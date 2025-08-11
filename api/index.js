// api/index.js
// This serverless function will now handle all requests for the GMod addon
// without needing a vercel.json rewrite rule.

// This is a simple in-memory message store that will reset
// when the serverless function "wakes up" after a period of inactivity.
// For a production app, you would use a database.
let messages = [];

module.exports = (req, res) => {
  const { method, url } = req;
  console.log(`Incoming request: ${method} ${url}`);

  // Handle POST requests to /api/send
  if (method === 'POST' && url === '/api/send') {
    if (req.body && req.body.text) {
      const message = {
        text: req.body.text,
        timestamp: req.body.timestamp
      };
      messages.push(message);
      res.status(200).send('message received');
      console.log('new message:', message.text);
    } else {
      res.status(400).send('bad request');
    }
    return;
  }

  // Handle GET requests to /api/fetch
  if (method === 'GET' && url.startsWith('/api/fetch')) {
    const url_params = new URL(url, `http://${req.headers.host}`);
    const last_timestamp = url_params.searchParams.get('timestamp') || 0;
    const new_messages = messages.filter(msg => msg.timestamp > last_timestamp);
    res.status(200).json(new_messages);
    return;
  }

  // Return 404 for any other requests
  res.status(404).send('Not Found');
};
