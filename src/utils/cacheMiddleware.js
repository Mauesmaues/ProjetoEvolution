// Middleware de cache simples em memória
const cache = new Map();
const cacheExpiry = new Map();

const cacheMiddleware = (duration = 1800) => { // 30 min default
  return (req, res, next) => {
    const key = req.originalUrl;
    const now = Date.now();
    
    // Verifica se existe cache válido
    if (cache.has(key) && cacheExpiry.get(key) > now) {
      console.log('[Cache] HIT para:', key);
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', `public, max-age=${Math.floor((cacheExpiry.get(key) - now) / 1000)}`);
      return res.json(cache.get(key));
    }
    
    // Intercepta a resposta original
    const originalJson = res.json;
    res.json = function(body) {
      // Salva no cache apenas se for sucesso
      if (res.statusCode === 200 && body && body.success) {
        cache.set(key, body);
        cacheExpiry.set(key, now + (duration * 1000));
        console.log('[Cache] MISS - salvando:', key);
      }
      
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `public, max-age=${duration}`);
      originalJson.call(this, body);
    };
    
    next();
  };
};

module.exports = cacheMiddleware;