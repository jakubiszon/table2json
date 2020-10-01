const pg = require('pg');

module.exports = function ( ) {

	/** @type {pg.Client} */
	let dbClient;

	this.dbms = "postgresql";

	this.open = async function ( connectionInfo ) {
		dbClient = new pg.Client( connectionInfo );
		await dbClient.connect( );
	}

	this.close = async function ( ) {
		await dbClient.end( );
	}

	this.query = async function ( sql, params ) {
		let table = await dbClient.query( sql, params );
		if ( !table ) table = { rows : null };
		return table.rows;
	}
} 
