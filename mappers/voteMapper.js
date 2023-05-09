
const DB = require('../db');

// const insertVotes = async (proposal_id, token_ids, agree) => {

// 	const flattened_data = [];

// 	for(let token_id of token_ids) {

// 		flattened_data.push([proposal_id, token_id, agree]);
// 	}

// 	const sql = `
// 		INSERT INTO vote (proposal_id, token_id, agree)
// 		VALUES :flattened_data
// 		ON DUPLICATE KEY IGNORE
// 	`;
// 	const values = {flattened_data};

// 	await DB.pool.query(sql, values);
// };

const insertVotesWithAddress = async (proposal_id, address, agree) => {

	const sql = `
		INSERT INTO vote (proposal_id, token_id, agree)
		(
			SELECT :proposal_id, id, :agree FROM token WHERE address = :address
		)
		ON DUPLICATE KEY UPDATE agree = VALUES(agree)
	`;
	const values = {proposal_id, address, agree};

	await DB.pool.query(sql, values);
}

module.exports = {
	insertVotesWithAddress,
};