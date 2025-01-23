const express = require('express');
const app = express();
app.use(express.static('public'));

const axios = require('axios');

// Cache für Tweets
let tweetCache = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 Minute Cache-Dauer
const API_COOLDOWN = 15 * 1000;   // 15 Sekunden API-Cooldown

const twitterAPI = axios.create({
  baseURL: 'https://api.twitter.com/2',
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
  }
});

// Fetch Tweets mit Cache
async function fetchTweetsWithCache() {
  const now = Date.now();
  
  // Prüfe Cache-Gültigkeit
  if (tweetCache.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    console.log('📦 Verwende gecachte Tweets');
    return tweetCache;
  }

  // Prüfe API-Cooldown
  if (now - lastFetchTime < API_COOLDOWN) {
    console.log('⏳ API-Cooldown aktiv, verwende Cache');
    return tweetCache.length > 0 ? tweetCache : null;
  }

  try {
    // Hole neue Tweets
    console.log('🔄 Hole neue Tweets von Twitter API');
    const response = await twitterAPI.get('/tweets/search/recent', {
      params: {
        query: `from:${process.env.TWITTER_USERNAME}`,
        'tweet.fields': 'created_at',
        max_results: 50
      }
    });

    tweetCache = response.data.data || [];
    lastFetchTime = now;
    return tweetCache;
  } catch (error) {
    console.error('🚨 Twitter API Fehler:', error.response?.data || error.message);
    return tweetCache.length > 0 ? tweetCache : null;
  }
}

app.get('/api/tweets', async (req, res) => {
  try {
    console.log(`📡 Neue API-Anfrage von ${req.ip} für Tweets von @${process.env.TWITTER_USERNAME}`);
    
    const tweets = await fetchTweetsWithCache();
    
    if (!tweets || tweets.length === 0) {
      return res.json({
        data: { text: 'Keine Tweets verfügbar 🐦' }
      });
    }

    const randomTweet = tweets[Math.floor(Math.random() * tweets.length)];
    console.log(`🎲 Zufälliger Tweet ausgewählt aus ${tweets.length} Tweets`);
    
    res.json({ data: randomTweet });
  } catch (error) {
    console.error('🚨 Server Fehler:', error.message);
    res.status(500).json({
      error: 'Twitter API Anfrage fehlgeschlagen 🚨'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});