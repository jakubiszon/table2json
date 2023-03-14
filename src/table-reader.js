//
// contains functions reading table specific data from the database
//

const dbTypes = require( '../definitions/dbTypes' );

module.exports = tableReader;

/**
 * @function tableReader returns a promise resolving to table data for a table of the specified name
 * @param {object} databaseInterface
 * @param {string} schemaname 
 * @param {string} tablename name of the table to process
 * @returns {Promise} promise resolving to table data object
 */
async function tableReader ( databaseInterface, schemaname, tablename ) {

	let tableRecords = await databaseInterface.query(
		`select * from information_schema.tables where table_schema = $1 and table_name = $2`,
		[ schemaname, tablename ]
	)

	if( !tableRecords || !tableRecords.length ) return null;

	let tabledata = {
		...tableRecords[0],
		tablename: tableRecords[0].table_name, // name repeated in old format for backwards compatibility
		columns: [], //{} compare mssql and pgsql and get common info about the data type
		foreignkeys: [],
		uniquekeys: []
	};

	await readColumns();
	await readPrimaryKey();
	await readPKColumns();
	await readForeignKeys();
	await readUniqueKeys();
	return tabledata;

	async function readColumns ( ) {

		var sql = databaseInterface.dbms == 'postgresql'
			? "select * from information_schema.columns where table_schema = $1 and table_name = $2"
			:
		`select c.*, sc.is_identity from information_schema.columns c
		inner join sys.columns sc on c.column_name = sc.name and sc.object_id = object_id(c.table_name)
		where c.table_schema = $1 and c.table_name = $2`;
		// `select c.*, sc.is_identity from information_schema.columns c
		// inner join sys.columns sc on c.column_name = sc.name and sc.object_id = object_id(c.table_name)
		// where c.table_schema = $1 and c.table_name = $2`;

		let columns = await databaseInterface.query(sql, [schemaname, tablename]);
		tabledata.columns = columns.map(updateColumn);

	}

	/**
	 * Call on evey row of "database column" to set some properties.
	 * @param {Object} tableColumn a row of "information_schema.columns" view plus some additional items
	 */
	function updateColumn(tableColumn) {
		// is_nullable contains either 'YES' or 'NO'
		// here we turn it into a boolean value
		tableColumn.is_nullable = tableColumn.is_nullable == 'YES';
		
		if( databaseInterface.dbms == 'postgresql') {
			// change 'YES' / 'NO' values to boolean for postgres
			tableColumn.is_identity = tableColumn.is_identity == 'YES';
			tableColumn.is_self_referencing = tableColumn.is_self_referencing == 'YES';
			tableColumn.is_updatable = tableColumn.is_updatable == 'YES';
		}
		
		// two fields decide whether the column should be inserted a value
		// we just want one field to contain a true / false instead
		tableColumn.is_default_or_identity = Boolean(tableColumn.column_default || tableColumn.is_identity).valueOf();
		
		return tableColumn;
	}

	async function readPrimaryKey( ) {
		var sql = "select constraint_name from information_schema.table_constraints where table_schema = $1 and table_name = $2 and constraint_type = 'PRIMARY KEY';";
		let rows = await databaseInterface.query( sql, [schemaname, tablename] );
		if(rows.length > 0) {
			let row = rows[0];
			tabledata.primary_key_name = row.constraint_name;
		}
	}

	async function readPKColumns( ) {
		if(!tabledata.primary_key_name) {
			return;
		}

		var sql = "select column_name from information_schema.key_column_usage where table_schema = $1 and table_name = $2 and constraint_name = $3;"
		var params = [schemaname, tablename, tabledata.primary_key_name];
		let rows = await databaseInterface.query(sql, params);

		var pk_column_names = rows.map(row => row.column_name);
		for(let column of tabledata.columns)
			column.is_primary_key = pk_column_names.indexOf(column.column_name) >= 0;
	}

	async function readForeignKeys( ) {
		// this SQL is a bit more complex than it could be
		// the reason it is formed this way is MSSQL and Postgres do not implement
		// information schema in the exact same way, this SQL bypasses the differences
		// and returns uniform results for both DBMS
		var sql = 
`select fks.constraint_name, kcu.column_name, rc.unique_constraint_name, pks.table_name
from information_schema.TABLE_CONSTRAINTS fks -- foreign keys
inner join information_schema.KEY_COLUMN_USAGE kcu -- the columns of the above keys
on fks.table_schema = kcu.table_schema
and fks.constraint_name = kcu.constraint_name
and fks.TABLE_CATALOG = kcu.TABLE_CATALOG
inner join information_schema.referential_constraints rc -- referenced constraints
on rc.CONSTRAINT_CATALOG = fks.CONSTRAINT_CATALOG
and rc.CONSTRAINT_SCHEMA = fks.CONSTRAINT_SCHEMA
and rc.CONSTRAINT_NAME = fks.CONSTRAINT_NAME
inner join INFORMATION_SCHEMA.TABLE_CONSTRAINTS pks -- primary keys (referenced by fks)
on rc.UNIQUE_CONSTRAINT_CATALOG = pks.CONSTRAINT_CATALOG
and rc.UNIQUE_CONSTRAINT_SCHEMA = pks.CONSTRAINT_SCHEMA
and rc.UNIQUE_CONSTRAINT_NAME = pks.CONSTRAINT_NAME
and pks.CONSTRAINT_TYPE = 'PRIMARY KEY'
where fks.table_schema = $1
and fks.table_name = $2
and fks.constraint_type = 'FOREIGN KEY'
order by fks.constraint_name, kcu.ORDINAL_POSITION`;
		
		var params = [schemaname, tablename];
		let rows  = await databaseInterface.query( sql, params );

		// TODO this could be rewritten into something nicer
		var lastFK = '';
		for(let row of rows) {
			if(row.constraint_name != lastFK) {
				lastFK = row.constraint_name;
				tabledata.foreignkeys[tabledata.foreignkeys.length] = {
					keyname: row.constraint_name,
					keytablename: row.table_name,
					columns: []
				}
			}
			var columns = tabledata.foreignkeys[tabledata.foreignkeys.length-1].columns;
			columns.push(row.column_name);
		}
	}

	async function readUniqueKeys(callback) {
		var sql =
`select kcu.column_name, kcu.constraint_name
from information_schema.table_constraints tc
inner join information_schema.key_column_usage kcu
on tc.table_name = kcu.table_name
and tc.table_catalog = kcu.table_catalog
and tc.table_schema = kcu.table_schema
and tc.constraint_name = kcu.constraint_name
where tc.constraint_type = 'UNIQUE'
and tc.table_name = $2
and tc.table_schema = $1
order by kcu.ordinal_position asc`;

		var params = [schemaname, tablename];
		let rows = await databaseInterface.query( sql, params );

		//TODO improve this code
		var lastIDX = '';
		for(let row of rows) {
			if(row.constraint_name != lastIDX) {
				lastIDX = row.constraint_name;
				tabledata.uniquekeys[tabledata.uniquekeys.length] = {
					keyname: row.constraint_name,
					columns: []
				}
			}
			var columns = tabledata.uniquekeys[tabledata.uniquekeys.length-1].columns;
			columns.push(row.column_name);
		}
	}
}

function onlyUnique(value, index, self) { 
	return self.indexOf(value) === index;
}

function onlyDuplicates(value, index, self) {
	return self.indexOf(value) !== index;
}
