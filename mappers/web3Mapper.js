
const web3 = require('../web3');

const getAddress = async (message, signature) => {

	const address = await web3.eth.accounts.recover(message, signature);

	return { address };
}

const cry_abi_file = require('../crazyrichyellows.json');
const cry_address = '0x50a645E96846e7c78995adfcD5e25863361d57d7';

const getTokenOwners = async () => {

	cry = new web3.eth.Contract(cry_abi_file.abi, cry_address);

	data = {};

	for(let i = 1; i <= 2300; i++){

		if(i % 100 === 1) console.log(`${i}/2300`);

		wallet = await cry.methods.ownerOf(i).call();

		data[i] = wallet;
	}

	return { data };
}

module.exports = {
	getAddress,
	getTokenOwners,
}