
const DB = require('../db');

const updateTokenAddress = async (data) => {

	const flattened_data = [];

	for(let token_id in data) {
		const wallet_address = data[token_id];

		flattened_data.push([token_id, 0, wallet_address]);
	}

	const sql = `
		INSERT INTO token (id, vote_num, address) VALUES :flattened_data
		ON DUPLICATE KEY UPDATE address = VALUES(address);
	`
	const values = {flattened_data};

	await DB.pool.query(sql, values); 
}

const selectSumOfVoteNumByAddress = async (address) => {

	const sql = `
		SELECT IFNULL(SUM(vote_num), 0) as sum_of_vote_num FROM token WHERE address = :address
	`
	const values = {address};

	const [[ { sum_of_vote_num: sumOfVoteNum } ]] = await DB.pool.query(sql, values);

	return { sumOfVoteNum };
}

const selectSumOfVoteNumByAddressAndProposalId = async (address, proposal_id) => {
	const sql = `
		SELECT IFNULL(SUM(token.vote_num), 0) as sum_of_vote_num
		FROM token
			INNER JOIN vote
			ON token.id = vote.token_id
		WHERE vote.proposal_id = :proposal_id AND token.address = :address;

	`;
	const values = {address, proposal_id};

	const [[ { sum_of_vote_num: sumOfVoteNum } ]] = await DB.pool.query(sql, values);

	return { sumOfVoteNum };
}

module.exports = {
	updateTokenAddress,
	selectSumOfVoteNumByAddress,
	selectSumOfVoteNumByAddressAndProposalId,
}