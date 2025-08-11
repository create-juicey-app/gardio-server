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

// Normalize timestamps to milliseconds (accept seconds or ms)
function toMs(ts) {
  const n = Number(ts);
  if (!isFinite(n) || n <= 0) return null;
  return n < 1e12 ? Math.floor(n * 1000) : Math.floor(n);
}

// Replace singular routes with dual-path handlers that accept both /send and /api/send
const sendPaths = ['/send', '/api/send'];
const fetchPaths = ['/fetch', '/api/fetch'];

// Handle POST requests
sendPaths.forEach((p) =>
  app.post(p, (req, res) => {
    console.log('Incoming POST request to', p);
    let payload = req.body || {};
    if (payload.body && typeof payload.body === 'string') {
      try {
        payload = JSON.parse(payload.body);
      } catch (e) {
        console.log('Failed to parse JSON fallback body:', e.message);
      }
    }

    if (payload && payload.text) {
      const ts = toMs(payload.timestamp) || Date.now();
      const message = { text: payload.text, timestamp: ts };
      messages.push(message);
      res.status(200).send('message received');
      console.log('new message:', message.text, '@', message.timestamp);
    } else {
      console.log('Bad request: missing text in body');
      res.status(400).send('bad request');
    }
  })
);

// Handle GET requests
fetchPaths.forEach((p) =>
  app.get(p, (req, res) => {
    console.log('Incoming GET request to', p);
    const lastTsMs = toMs(req.query.timestamp) || 0;
    const new_messages = messages.filter((msg) => toMs(msg.timestamp) > lastTsMs);
    res.status(200).json(new_messages);
  })
);

// Vercel serverless function entry point
module.exports = (req, res) => {
  app(req, res);
};
