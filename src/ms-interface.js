const mssql = require('mssql');

module.exports = function () {

	/** @type {mssql.ConnectionPool} */
	let pool;

	this.dbms = "sqlserver";

	this.open = async function ( connectionString ) {
		pool = await new mssql.ConnectionPool( connectionString ).connect();
	};

	this.close = async function ( ) {
		await pool.close();
	};

	this.query = async function ( sql, params ) {
		let request = pool.request()
		if( params ) {
			// replace the $ with @, the queries were originally written for postgres
			for(let idx=params.length; idx>0; idx--) {
				let paramname = '@p' + idx.toString();
				//console.log('replace: ', paramname);
				sql = sql.replace('$' + idx.toString(), paramname);
				request.input( paramname.substring(1), params[idx-1] );
			}
		}

		//console.log(sql);
		let queryResult = await request.query( sql );
		return queryResult.recordset.map( lowerCaseObject );
	}
};

function lowerCaseObject(obj) {
	var result = {};
	for(let a in obj) {
		result[a.toLowerCase()] = obj[a];
	}
	return result;
}