const dbReader = require('../index');
const connections = require( './connections.json');

async function test() {
	let dbms = "sqlserver";
	let reader = dbReader( dbms );
	await reader.open( connections[ dbms ]);
	let tables = await reader.listTables( dbms === "sqlserver" ? 'dbo' : 'public' );
	let tableData = await Promise.all( tables.map( tname => reader.defineTable( 'dbo', tname) ) );

	console.log( tables );
	console.dir( tableData );

	await reader.close();
}

test();
