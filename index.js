const pgInterface = require('./src/pg-interface');
const msInterface = require('./src/ms-interface');
const tableReader = require('./src/table-reader');

/**
 * Returns a databse reader
 * @param {string} dbms - name of dbms to use, this should either be "sqlserver" or "postgresql"
 */
module.exports = function ( dbms ) {

	const db = dbEngine( dbms );

	function dbEngine ( dbms ) {
		if( dbms == "sqlserver" ) return new msInterface();
		if( dbms == "postgresql") return new pgInterface();
		throw 'table2json - dbms name must be specified as either "sqlserver" or "postgresql"';
	}

	return {

		open : function ( connectionInfo ) {
			return db.open( connectionInfo );
		},

		close : function ( ) {
			return db.close( );
		},

		listTables : async function ( schemaName ) {
			const sql_tables = `
			select table_name
			from INFORMATION_SCHEMA.TABLES
			where TABLE_TYPE = 'BASE TABLE'
			and TABLE_SCHEMA = cast( $1 as varchar(50))
			`;
		
			const tableDbRows = await db.query( sql_tables, [schemaName] ); 
			const tableNames = tableDbRows.map( row => row.table_name );
			return tableNames;
		},

		defineTable : function ( schemaName, table) {
			return tableReader( db, schemaName, table );
		}
	};
};
