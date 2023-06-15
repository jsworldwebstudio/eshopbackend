const express = require('express');
const app = express();
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const verifyJWT = require('./helpers/verifyJWT');
// const handleRefreshToken = require('./helpers/refreshToken');
const cookieParser = require('cookie-parser');
// const errorHandler = require('./helpers/error-handler');

require('dotenv/config');

app.use(cors());
app.options('*', cors());

//Create a write stream (in append mode)
let accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'regLog.txt'), {flags: 'a'});

//Middleware
app.use(express.json());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(cookieParser());


//Routes
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const refreshRoutes = require('./routes/refresh');
const logoutRoutes = require('./routes/logout');

const api = process.env.API_URL;

app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/refresh`, refreshRoutes);
app.use(`${api}/logout`, logoutRoutes);

app.use(verifyJWT);
app.use(`${api}/orders`, ordersRoutes);

//Database
mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbname: 'eshop-database'
})
.then(()=> {
  console.log('Databse Connection is ready...');
})
.catch((err)=> {
  console.log(err);
})

//Server
app.listen(3000, ()=>{
  console.log('server is running http://localhost:3000');
})