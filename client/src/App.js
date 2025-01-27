import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tweet, setTweet] = useState('Drück den Buzzer für einen Tweet!');
  const [isBuzzing, setIsBuzzing] = useState(false);
  const fetchTweet = async () => {
    console.log('🎮 Buzzer gedrückt | Animation gestartet');
    setIsBuzzing(true);

    try {
      console.log('🌐 Starte API-Anfrage...');
      const response = await axios.get('/api/tweets');
      console.log('✅ API-Erfolg:', {
        status: response.status,
        tweet: response.data.data.text.substring(0, 50) + '...'
      });
      const tweets = response.data.data;
      setTweet(tweets.map(tweet => tweet.text).join('\n\n'));
    } catch (error) {
      console.error('❌ API-Fehler:', {
        status: error.response?.status,
        message: error.message,
        timestamp: new Date().toISOString()
      });
      setTweet('🚨 Fehler beim Laden des Tweets! 🚨');
    }
    setTimeout(() => setIsBuzzing(false), 500);
  };

  return (
    <div className="container">
      <h1>Twitter Buzzer 🎮</h1>
      <div className={`tweet-box ${isBuzzing ? 'buzz' : ''}`}>
        {tweet}
      </div>
      <button 
        className={`buzzer-button ${isBuzzing ? 'active' : ''}`}
        onClick={fetchTweet}
      >
        ALLE TWEETS LADEN
      </button>
    </div>
  );
}

export default App;
