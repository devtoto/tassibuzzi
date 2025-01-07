// backend/server.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const Twitter = require('twitter-v2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

// Twitter API client with rate limiting wrapper
class RateLimitedTwitterClient {
  constructor(client, maxRequestsPerWindow = 100, windowMs = 900000) {
    this.client = client;
    this.requests = [];
    this.maxRequests = maxRequestsPerWindow;
    this.windowMs = windowMs;
  }

  async makeRequest(method, ...args) {
    // Clean up old requests
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    // Check if we're within rate limits
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    // Make the request
    this.requests.push(now);
    return await this.client[method](...args);
  }
}

// Initialize Twitter client with rate limiting
const twitterClient = new RateLimitedTwitterClient(
  new Twitter({ bearer_token: process.env.TWITTER_BEARER_TOKEN }),
  parseInt(process.env.TWITTER_RATE_LIMIT_MAX_REQUESTS) || 100,
  parseInt(process.env.TWITTER_RATE_LIMIT_WINDOW_MS) || 900000
);

// API rate limiter middleware
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(res.getHeader('Retry-After') / 1000)
    });
  }
});

// Apply rate limiting to all routes
app.use(apiLimiter);

// Health check endpoint (exempt from rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Rate-limited tweets endpoint
app.get('/api/tweets/:username', async (req, res) => {
  try {
    // Get user ID
    const userResponse = await twitterClient.makeRequest('get', 'users/by/username/' + req.params.username);
    const userId = userResponse.data.id;
    
    // Get tweets
    const tweetsResponse = await twitterClient.makeRequest('get', 'users/' + userId + '/tweets', {
      max_results: 20,
      exclude: 'retweets,replies',
      tweet: {
        fields: ['created_at', 'text']
      }
    });
    
    res.json(tweetsResponse.data);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    
    // Handle rate limit errors specifically
    if (error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({ 
        error: error.message,
        type: 'TWITTER_RATE_LIMIT'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch tweets',
      type: 'GENERAL_ERROR'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    type: 'SERVER_ERROR'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});