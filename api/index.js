let messages = [];

module.exports = (req, res) => {
  const { method, url } = req;
  console.log(`Incoming request: ${method} ${url}`);

  // post requests to /send
  if (method === 'POST' && url === '/send') {
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

  // get requests to /fetch
  if (method === 'GET' && url.startsWith('/fetch')) {
    const url_params = new URL(url, `http://${req.headers.host}`);
    const last_timestamp = url_params.searchParams.get('timestamp') || 0;
    const new_messages = messages.filter(msg => msg.timestamp > last_timestamp);
    res.status(200).json(new_messages);
    return;
  }

  res.status(404).send('Not Found');
};