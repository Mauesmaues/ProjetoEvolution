const https = require('https');

// Cliente HTTP otimizado com pool de conexões
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 30000,
  freeSocketTimeout: 15000
});

// Fetch otimizado com pool de conexões
const fetch = (...args) => {
  return import('node-fetch').then(({default: fetch}) => {
    const [url, options = {}] = args;
    return fetch(url, { 
      ...options, 
      agent: url.startsWith('https:') ? agent : undefined 
    });
  });
};

module.exports = fetch;