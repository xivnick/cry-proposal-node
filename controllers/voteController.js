
const voteMapper = require('../mappers/voteMapper');
const tokenMapper = require('../mappers/tokenMapper');
const web3Mapper = require('../mappers/web3Mapper');
const proposalMapper = require('../mappers/proposalMapper');

module.exports.postVotes = async (req, res) => {

	console.log('postVotes', req.body);

	const { proposal_id, address, agree, signature } = req.body;
	if(!proposal_id || !address || agree === null || !signature) return res.status(422).send();

	const message = 'Welcome to the Crazy Rich Yellows proposal page\n\nClick sign to confirm your final vote, your vote will be reflected automatically as you click sign\nThis request will not trigger a blockchain transaction or cost any gas gees\n\nWallet address: ' + address;

	const { address: address2 } = await web3Mapper.getAddress(message, signature);

	console.log(address, address2);

	if(address !== address2) return res.status(403).send();

	const { status } = await proposalMapper.selectStatusById(proposal_id);

	if(status !== "ONGOING") return res.status(400).send();

	await voteMapper.insertVotesWithAddress(proposal_id, address, agree);

	return res.status(200).send();
}

module.exports.getSumOfVoteNum = async (req, res) => {

	console.log('getSumOfVoteNum', req.query);

	const { address } = req.query;
	if(!address) return res.status(422).send();

	const { sumOfVoteNum } = await tokenMapper.selectSumOfVoteNumByAddress(address);

	return res.json({sumOfVoteNum});
}

module.exports.getSumOfVoteNumVotedToProposalId = async (req, res) => {

	console.log('getSumOfVoteNumVotedToProposalId', req.query);

	const { address, proposal_id } = req.query;
	if(!address || !proposal_id) return res.status(422).send();

	const { sumOfVoteNum } = await tokenMapper.selectSumOfVoteNumByAddressAndProposalId(address, proposal_id);

	return res.json({sumOfVoteNum});
}