const axios = require('axios');




const getCryptoPrice = axios.create({
    baseURL: 'http://api.coincap.io/v2/assets/'
});

getCryptoPrice.get('litecoin')
    .then(res => console.log(res.data))
    .catch(err => console.log(err));