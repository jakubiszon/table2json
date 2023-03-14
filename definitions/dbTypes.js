//--------------------------------------------------------------------------
//
//  This file contains definitions of types returned by the library
//
//--------------------------------------------------------------------------

class dbConnection {

	/** @property {string | null} host of the db server, default = 'localhost' */
	host;

	/** @property {number | null} port used to connect to the db server, default port is used for each DBMS when this value is not specified */
	port;

	/** @type {string} */
	database;

	/** @type {string} */
	password;

	/** @type {string} */
	user;
}

class tableDescription {

	/** @type {string} */
	table_schema;

	/** @type {string} */
	table_name;

	/** @type { "BASE TABLE" | "VIEW" } */
	table_type;
}


module.exports = {
	dbConnection,
	tableDescription
};
