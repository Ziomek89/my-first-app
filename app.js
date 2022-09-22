require('dotenv/config');
const express = require('express');
const morgan = require('morgan');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const CryptoService = require('./services/crypto.service')
const cookieParser = require('cookie-parser');
const myCryptoService = new CryptoService();


mongoose.connect(process.env.MONGODB_URI)
  .then(x => console.log('successfully connected to database ' + x.connections[0].name))
  .catch(err => {
    console.log(err)
  })

const app = express();

app.use(cookieParser());


app.set('views', __dirname + '/views');
app.set('view engine', hbs);
app.use(express.static(__dirname + '/public'));

// required for the app when deployed to Heroku (in production)
app.set('trust proxy', 1);
 
// use session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 900000
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    })
  })
);


app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'));


//setting up my authentication routes
const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes);

app.get('/crypto-data', (req, res, next) => {

    const anyCrypto = req.query.crypto;
    
   

    myCryptoService.getCrypto(anyCrypto)
    .then(axiosResponse => {
        console.log(axiosResponse);
     const someCryptoData = axiosResponse.data;
     const someCryptoRank = someCryptoData.data.rank;
     const someCryptoSymbol = someCryptoData.data.symbol;
     const someCryptoName = someCryptoData.data.name;
     const someCryptoPrice = someCryptoData.data.priceUsd;
     const someCryptoPercent = someCryptoData.data.changePercent24Hr;
     
     res.render('cryptoData.hbs', {
        cryptoRank: someCryptoRank,
        cryptoSymbol: someCryptoSymbol,
        cryptoName: someCryptoName,
        crytoPrice: someCryptoPrice,
        cryptoPercentChangeIn24Hrs: someCryptoPercent
     })

    })
    .catch(err => console.log(err));
});

app.get('/all-crypto-data', (req, res, next) => {
    myCryptoService.getAllCrypto()
      .then(axiosResponse => {
        res.send(axiosResponse.data);

      })
  })


app.listen(process.env.PORT, () => console.log('yo the server is running'));