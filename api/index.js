const express = require('express');
const app = express();

// This is a simple in-memory message store that will reset
// when the serverless function "wakes up" after a period of inactivity.
// For a production app, you would use a database.
let messages = [];

// Use express.json() middleware to automatically parse JSON bodies
app.use(express.json());
// Add middleware to also parse URL-encoded bodies, which is what GMod sends by default
app.use(express.urlencoded({ extended: true }));

// Handle POST requests to /api/send
app.post('/api/send', (req, res) => {
  console.log('Incoming POST request to /api/send');
  // Accept URL-encoded (preferred) or JSON passed under "body" fallback
  let payload = req.body || {};
  if (payload.body && typeof payload.body === 'string') {
    try {
      payload = JSON.parse(payload.body);
    } catch (e) {
      console.log('Failed to parse JSON fallback body:', e.message);
    }
  }

  if (payload && payload.text) {
    const message = {
      text: payload.text,
      timestamp: Number(payload.timestamp) || Date.now()
    };
    messages.push(message);
    res.status(200).send('message received');
    console.log('new message:', message.text);
  } else {
    console.log('Bad request: missing text in body');
    res.status(400).send('bad request');
  }
});

// Handle GET requests to /api/fetch
app.get('/api/fetch', (req, res) => {
  console.log('Incoming GET request to /api/fetch');
  const last_timestamp = Number(req.query.timestamp || 0) || 0;
  const new_messages = messages.filter(msg => Number(msg.timestamp) > last_timestamp);
  res.status(200).json(new_messages);
});

// Vercel serverless function entry point
module.exports = (req, res) => {
  app(req, res);
};
