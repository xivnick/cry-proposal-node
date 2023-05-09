
const DB = require('../db');

const insertProposal = async (address, title, content, end_date) => {

	const sql = `
		INSERT INTO proposal (address, title, content, end_date) 
		VALUES (:address, :title, :content, :end_date) 
	`;
	const values = {address, title, content, end_date};

	await DB.pool.query(sql, values);
}

const selectProposals = async () => {

	const sql = `
		SELECT id, address, title, start_date, end_date, agree, disagree,
			CASE
				WHEN end_date > now() THEN 'ONGOING'
				WHEN agree > disagree THEN 'PASS'
				ELSE 'REFUSED'
			END AS status,
			address = (SELECT address FROM yellow_man LIMIT 1) AS yellow_man
		FROM proposal LEFT JOIN 
		(
			SELECT  proposal.id as proposal_id,
				IFNULL((SELECT SUM(vote_num) FROM vote LEFT JOIN token ON vote.token_id = token.id WHERE vote.proposal_id = proposal.id AND agree = 1), 0) AS agree,
				IFNULL((SELECT SUM(vote_num) FROM vote LEFT JOIN token ON vote.token_id = token.id WHERE vote.proposal_id = proposal.id AND agree = 0), 0) AS disagree
			FROM proposal
		) AS pada ON proposal.id = pada.proposal_id
	`;
	const values = {};

	const [ proposals ] = await DB.pool.query(sql, values);

	return { proposals };
}

const selectProposalById = async (id) => {

	const sql = `
		SELECT address, title, content, start_date, end_date,
			IFNULL((SELECT SUM(vote_num) FROM vote LEFT JOIN token ON vote.token_id = token.id WHERE vote.proposal_id = :id AND agree = 1), 0) AS agree,
			IFNULL((SELECT SUM(vote_num) FROM vote LEFT JOIN token ON vote.token_id = token.id WHERE vote.proposal_id = :id AND agree = 0), 0) AS disagree,
			CASE
				WHEN end_date > now() THEN 'ONGOING'
				WHEN IFNULL((SELECT SUM(vote_num) FROM vote LEFT JOIN token ON vote.token_id = token.id WHERE vote.proposal_id = :id AND agree = 1), 0) > IFNULL((SELECT SUM(vote_num) FROM vote LEFT JOIN token ON vote.token_id = token.id WHERE vote.proposal_id = :id AND agree = 0), 0) THEN 'PASS'
				ELSE 'REFUSED'
			END AS status
		FROM proposal WHERE id = :id
	`;
	const values = {id};

	const [[ proposal ]] = await DB.pool.query(sql, values);

	return { proposal };
}

const selectStatusById = async (id) => {

	const sql = `
		SELECT 
			IFNULL((SELECT SUM(vote_num) FROM vote LEFT JOIN token ON vote.token_id = token.id WHERE vote.proposal_id = :id AND agree = 1), 0) AS agree,
			IFNULL((SELECT SUM(vote_num) FROM vote LEFT JOIN token ON vote.token_id = token.id WHERE vote.proposal_id = :id AND agree = 0), 0) AS disagree,
			CASE
				WHEN end_date > now() THEN 'ONGOING'
				WHEN IFNULL((SELECT SUM(vote_num) FROM vote LEFT JOIN token ON vote.token_id = token.id WHERE vote.proposal_id = :id AND agree = 1), 0) > IFNULL((SELECT SUM(vote_num) FROM vote LEFT JOIN token ON vote.token_id = token.id WHERE vote.proposal_id = :id AND agree = 0), 0) THEN 'PASS'
				ELSE 'REFUSED'
			END AS status
		FROM proposal WHERE id = :id
	`;
	const values = {id};

	const [[ { status } ]] = await DB.pool.query(sql, values);

	return { status };
}

module.exports = {
	insertProposal,
	selectProposals,
	selectProposalById,
	selectStatusById,
}