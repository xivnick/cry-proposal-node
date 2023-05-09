
const mysql = require('mysql2/promise');
const db_config = require('./db_config.json');

const queryFormat = (query, values) => {
	if (!values) return query;
	return query.replace(/:(\w+)/g, (txt, key) => {
  		if (Object.prototype.hasOwnProperty.call(values, key)) {
   			return mysql.escape(values[key]);
  		}
  		return txt;
	});
}

const pool = mysql.createPool({
	host: db_config.host,
	user: db_config.user,
	password: db_config.password,
	database: db_config.database,
	queryFormat,
});

module.exports = {
	pool,
	queryFormat,
};
