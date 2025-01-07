import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const useSound = () => {
  const audio = new Audio('/buzzer-sound.mp3');
  return () => {
    audio.currentTime = 0;
    audio.play().catch(err => console.log('Audio play failed:', err));
  };
};

export default function BuzzerApp() {
  const [tweets, setTweets] = useState([]);
  const [currentTweet, setCurrentTweet] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const playSound = useSound();

  const fetchTweets = async () => {
    if (!username) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/tweets/${username}`);
      if (!response.ok) throw new Error('Failed to fetch tweets');
      
      const data = await response.json();
      setTweets(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuzzer = () => {
    if (tweets.length === 0) {
      fetchTweets();
      return;
    }

    setIsAnimating(true);
    playSound();
    
    const randomTweet = tweets[Math.floor(Math.random() * tweets.length)];
    setCurrentTweet(randomTweet);
    
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      {/* Username Input */}
      <div className="mb-8 w-full max-w-md">
        <Input
          type="text"
          placeholder="Enter X username (without @)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-white/10 text-white border-white/20"
        />
      </div>

      {/* Buzzer Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleBuzzer}
          disabled={isLoading}
          className="w-48 h-48 rounded-full bg-red-600 hover:bg-red-700 shadow-lg flex items-center justify-center text-white text-2xl font-bold disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'BUZZ!'}
        </Button>
      </motion.div>

      {/* Tweet Display */}
      <div className="mt-12 w-full max-w-md">
        <AnimatePresence mode="wait">
          {currentTweet && (
            <motion.div
              key={currentTweet.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-none">
                <CardContent className="p-6">
                  <p className="text-blue-400 font-bold mb-2">@{username}</p>
                  <p className="text-white text-lg">{currentTweet.text}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {new Date(currentTweet.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}