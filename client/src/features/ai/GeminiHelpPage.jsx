// client/src/features/ai/GeminiHelpPage.jsx

import React, { useState, useRef, useEffect } from 'react';
import publicApi from '../../lib/publicApi'; // <-- THE CRITICAL CHANGE
import './GeminiHelpPage.css';
import { FaPaperPlane } from 'react-icons/fa';

const GeminiHelpPage = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! How can I help you with your studies today? Ask me anything from 'Explain photosynthesis' to 'Give me a practice question for algebra'." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const newMessages = [...messages, { sender: 'user', text: prompt }];
    const userPrompt = prompt;
    setMessages(newMessages);
    setPrompt('');
    setIsLoading(true);

    try {
      // Use the new publicApi instance
      const response = await publicApi.post('/gemini/query', { prompt: userPrompt });
      setMessages([...newMessages, { sender: 'ai', text: response.data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card page-fade-in chat-container">
      <h2>Study Assistant</h2>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="message-bubble ai">
            <span className="typing-indicator">...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !prompt.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default GeminiHelpPage;