const axios = require('axios');




const getCryptoPrice = axios.create({
    baseURL: 'https://api.coinpaprika.com/v1/'
});

getCryptoPrice.get('coins')
    .then(res => console.log(res.data))
    .catch(err => console.log(err));