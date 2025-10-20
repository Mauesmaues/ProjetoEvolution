require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const compression = require('compression');
const errorHandler = require('./src/utils/errorHandler');
const routes = require('./src/routes');

//Aceitar requisições CORS
const cors = require('cors');
app.use(cors());

// Compressão para melhorar performance
app.use(compression({
  level: 6,
  threshold: 1024, // Apenas para respostas > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

app.use(express.json());
app.use(morgan('dev'));
app.use(errorHandler.logRequests);

app.use('/api/v1', routes);

app.use(errorHandler.handleErrors);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
