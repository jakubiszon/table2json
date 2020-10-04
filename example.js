/*

	This file is intended only as usage demonstration.
	This package should be used as a dependency of your programs.
	If you copy the code below you will need to update the require statement.

*/

//const table2json = require( 'table2json' );
const table2json = require( './index' );
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
		"database":"xxxxx",
		"password":"xxxxx",
		"user":"xxxxx"
	});

	// get the list of tableNames for the schema public
	let tableNames = await db.listTables( 'public' );

	// get table definitions
	const tableData = await Promise.all( tableNames.map( tname => db.defineTable( 'public', tname) ) );

	// close the reader now
	await db.close( );

	// now tableData contains table objects
	// what you do with them is up to you
	// here we simply save them as files
	const filePromises = tableData.map(
		tableObject => fs.writeFile(
			`output/${tableObject.tablename}.json`,
			JSON.stringify( tableObject, null, 4 )
		)
	);
	
	await Promise.all( filePromises );
})();
