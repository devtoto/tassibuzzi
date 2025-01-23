import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tweet, setTweet] = useState('Drück den Buzzer für einen Tweet!');
  const [isBuzzing, setIsBuzzing] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  const fetchTweet = async () => {
    if (isCooldown) {
      console.log(`⏳ Buzzer blockiert - Cooldown aktiv (${cooldownTime}s)`);
      return;
    }
    
    console.log('🎮 Buzzer gedrückt | Animation gestartet');
    setIsBuzzing(true);
    setIsCooldown(true);
    setCooldownTime(5);
    
    // Starte Cooldown-Timer
    const timer = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      console.log('🌐 Starte API-Anfrage...');
      const response = await axios.get('/api/tweets');
      console.log('✅ API-Erfolg:', {
        status: response.status,
        tweet: response.data.data.text.substring(0, 50) + '...'
      });
      setTweet(response.data.data.text);
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
        className={`buzzer-button ${isBuzzing ? 'active' : ''} ${isCooldown ? 'cooldown' : ''}`}
        onClick={fetchTweet}
        disabled={isCooldown}
      >
        {isCooldown ? `COOLDOWN (${cooldownTime}s)` : 'BUZZER DRÜCKEN!'}
      </button>
    </div>
  );
}

export default App;