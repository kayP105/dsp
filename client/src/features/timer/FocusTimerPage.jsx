// client/src/features/timer/FocusTimerPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import './FocusTimerPage.css';

const FocusTimerPage = () => {
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const totalSeconds = initialMinutes * 60;

  useEffect(() => {
    if (!isActive) return;

    if (secondsLeft === 0) {
      setIsActive(false);
      setIsComplete(true);
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft(seconds => seconds - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, secondsLeft]);

  const handleStart = () => {
    if (initialMinutes > 0) {
      setSecondsLeft(initialMinutes * 60);
      setIsActive(true);
      setIsComplete(false);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsLeft(0);
    setIsComplete(false);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = (secondsLeft / totalSeconds) * circumference;

  return (
    <div className="card page-fade-in timer-container">
      <h2>Focus Timer</h2>
      <div className="visual-timer">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle className="timer-bg" cx="100" cy="100" r={radius} />
          <circle
            className="timer-progress"
            cx="100"
            cy="100"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
          />
        </svg>
        <div className="timer-text">
          {isComplete ? "Done!" : formatTime(secondsLeft)}
        </div>
      </div>
      
      {!isActive && !isComplete && (
        <div className="timer-setup">
          <label htmlFor="minutes">Set minutes:</label>
          <input
            id="minutes"
            type="number"
            value={initialMinutes}
            onChange={(e) => setInitialMinutes(Number(e.target.value))}
            min="1"
          />
        </div>
      )}

      <div className="timer-controls">
        {!isActive ? (
          <button onClick={handleStart} disabled={initialMinutes <= 0}>
            {isComplete ? 'Start Again' : 'Start'}
          </button>
        ) : (
          <button onClick={() => setIsActive(false)}>Pause</button>
        )}
        <button onClick={handleReset} disabled={!isActive && secondsLeft === 0}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default FocusTimerPage;