
const tokenMapper = require('../mappers/tokenMapper');
const web3Mapper = require('../mappers/web3Mapper');

const updateTokenOwners = async () => {

	console.log('update token owners');

	const { data } = await web3Mapper.getTokenOwners();

	await tokenMapper.updateTokenAddress(data);

	console.log('token owners updated!');
}

module.exports = {
	updateTokenOwners,
}