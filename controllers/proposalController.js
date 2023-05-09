
const proposalMapper = require('../mappers/proposalMapper');
const tokenMapper = require('../mappers/tokenMapper');
const web3Mapper = require('../mappers/web3Mapper');


module.exports.getProposal = async (req, res) => {

	const { id, address } = req.query;
	if(!id) return res.status(422).send();

	const { proposal } = await proposalMapper.selectProposalById(id);

	if(address) {
		const usedVotes = await tokenMapper.selectSumOfVoteNumByAddressAndProposalId(address, id);
		proposal['usedVotes'] = usedVotes;
	}
	else {
		proposal['usedVotes'] = 0;
	}

	return res.json({ proposal });
}

module.exports.getProposalList = async (req, res) => {

	const { proposals } = await proposalMapper.selectProposals();

	return res.json({ proposals });
}

module.exports.postProposal = async (req, res) => {

	console.log('postProposal', req.body);

	const { address, title, content, end_date, signature } = req.body;

	if(!address || !title || !content || !end_date || !signature) return res.status(422).send();

	const message = 'Welcome to the Crazy Rich Yellows proposal page\n\nClick sign to confirm your proposal, your proposal will be reflected automatically as you click sign\nThis request will not trigger a blockchain transaction or cost any gas gees\n\nWallet address: ' + address;

	const { address : address2 } = await web3Mapper.getAddress(message, signature);

	if(address !== address2) return res.status(403).send();

	const { sumOfVoteNum } = await tokenMapper.selectSumOfVoteNumByAddress(address);

	if(sumOfVoteNum < 9) return res.status(400).send();

	await proposalMapper.insertProposal(address, title, content, end_date);

	return res.status(200).send();
}
