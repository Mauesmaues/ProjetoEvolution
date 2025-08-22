require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const errorHandler = require('./src/utils/errorHandler');
const routes = require('./src/routes');

//Aceitar requisições CORS
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(morgan('dev'));
app.use(errorHandler.logRequests);

app.use('/api/v1', routes);

app.use(errorHandler.handleErrors);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
