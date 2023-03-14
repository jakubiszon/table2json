const dbTypes = require( './definitions/dbTypes' );
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

		/**
		 * @function listAllTables returns am array of tableDescription objects.
		 * @returns {Promise<dbTypes.tableDescription[]>}
		 */
		listAllTables : async function () {
			const sql_tables = getAllTablesSql ( dbms );
			return await db.query( sql_tables );
		},

		defineTable : function ( table_schema, table_name ) {
			return tableReader( db, table_schema, table_name );
		}
	};
};

/**
 * Returns DBMS specific SQL to read all user defined tables.
 * @param {string} dbms 
 * @returns {string}
 */
function getAllTablesSql( dbms ) {
	if( dbms === 'sqlserver' ) {
		return `
		select table_schema
		,      table_name
		,      table_type
		from information_schema.tables
		`;
	}

	if( dbms === 'postgresql' ) {
		return `
		select table_schema
		,      table_name
		,      table_type
		from information_schema.tables
		where table_schema not in (
			'pg_catalog',
			'information_schema'
		)`;
	}

	throw 'table2json - dbms name must be specified as either "sqlserver" or "postgresql"';
}
