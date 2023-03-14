const dbReader= require( '../index' );
const connections = require( './connections.json');

async function test( dbms ) {
	dbms = dbms || "postgresql";

	const reader = dbReader( dbms );
	await reader.open( connections[ dbms ]);

	let tableNames = await reader.listTables( dbms === "sqlserver" ? 'dbo' : 'public' );
	console.dir( tableNames );

	let tableDefinitions = await reader.listAllTables();
	console.dir( tableDefinitions );

	await reader.close();
}

test();