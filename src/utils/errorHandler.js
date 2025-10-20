const responseFormatter = require('./responseFormatter');

const logRequests = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

const handleErrors = (err, req, res, next) => {
  console.error(err);
  res.status(500).json(responseFormatter.error('Internal server error', err));
};

module.exports = { logRequests, handleErrors };
