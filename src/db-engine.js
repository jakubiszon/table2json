const pgInterface = require('./pg-interface.js');
const msInterface = require('./ms-interface.js');

/**
 * Returns a database engine which only exposes a "query" method and takes query+params 
 * in format accepted by "pg" library. 
 * @param {string} dbms - this should either be "sqlserver" or "postgresql"
 */
module.exports = function ( dbms ) {

	if( dbms == "sqlserver" ) return new msInterface();
	if( dbms == "postgresql" ) return new pgInterface();
	throw 'dbms name must be specified as either "sqlserver" or "postgresql"';

};
