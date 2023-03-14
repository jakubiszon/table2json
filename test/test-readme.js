const table2json = require( '../index' );
const fs = require( 'fs' ).promises;

(async function () {
	// create a db-interface, we need to pass dbms name
	// this could be either "postgres" or "sqlserver"
	// in this example we will play with postgres
	const db = table2json( 'postgresql' );

	// connect to the database
	await db.open({
		"host":"localhost",
		"port":5432,
		"database":"xxx",
		"password":"xxx",
		"user":"xxx"
	});

	// get the list of tableNames for the schema public
	let tables = await db.listAllTables();
	console.log(tables);

	// get table definitions
	const tableData = await Promise.all( tables.map( t => db.defineTable( t.table_schema, t.table_name )));

	// close the reader now
	await db.close( );

	// now tableData contains table objects
	// what you do with them is up to you
	// here we simply save them as files
	const filePromises = tableData.map(
		tableObject => fs.writeFile(
			`output/${tableObject.table_schema}.${tableObject.table_name}.json`,
			JSON.stringify( tableObject, null, 4 )
		)
	);

	await Promise.all( filePromises );
})();