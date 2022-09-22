const axios = require('axios');

class CryptoService {
  constructor(){
    this.myAxios = axios.create({
      baseURL: 'http://api.coincap.io/v2/'
    })
  }

  getCrypto(cryptoId){
    return this.myAxios.get('assets/' + cryptoId)
  }

  getAllCrypto(){
    return this.myAxios.get('assets/')
  }



}

module.exports = CryptoService;