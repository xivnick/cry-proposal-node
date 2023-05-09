
const Web3 = require('web3');
const web3_config = require('./web3_config.json');

const web3 = new Web3(new Web3.providers.HttpProvider(web3_config.alchemy_key));

console.log('web3 : ', web3.version);

module.exports = web3;