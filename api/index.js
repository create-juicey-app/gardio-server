const express = require('express');
const app = express();

let messages = [];

// Use express.json() middleware to automatically parse JSON bodies
app.use(express.json());

// Handle POST requests to /api/send
app.post('/api/send', (req, res) => {
  console.log('Incoming POST request to /api/send');
  if (req.body && req.body.text) {
    const message = {
      text: req.body.text,
      timestamp: req.body.timestamp
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
  const last_timestamp = req.query.timestamp || 0;
  const new_messages = messages.filter(msg => msg.timestamp > last_timestamp);
  res.status(200).json(new_messages);
});

// Vercel serverless function entry point
module.exports = (req, res) => {
  app(req, res);
};
