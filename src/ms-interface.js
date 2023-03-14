const dbTypes = require( '../definitions/dbTypes' );
const mssql = require('mssql');

module.exports = function () {

	/** @type {mssql.ConnectionPool} */
	let pool;

	this.dbms = "sqlserver";

	/**
	 * @param {dbTypes.dbConnection|string} connectionSpec 
	 */
	this.open = async function ( connectionSpec ) {
		const connectionString = toConnectionString( connectionSpec );
		pool = await mssql.connect( connectionString );
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

/**
 * @param {dbTypes.dbConnection|string} connectionSpec 
 * @returns {string} connection string
 */
function toConnectionString( connectionSpec ) {

	if( typeof connectionSpec === 'string' )
	{
		return connectionSpec
	}
	else
	{
		// we assume connectionSpec must be an object
		const server = connectionSpec.host || 'localhost';
		const port = connectionSpec.port || 1433;
		const usr = connectionSpec.user;
		const db = connectionSpec.database;
		const pwd = connectionSpec.password;
		const connectionString = `Server=${server},${port};Database=${db};User Id=${usr};Password=${pwd};TrustServerCertificate=true;`;
		return connectionString;
	}
}