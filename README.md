# table2json - tiny table structure reader
table2json is a minimalistic database structure reader. It can load structure data for postgresql or sql-server. It returns json data for the following items:

* tables
* table columns ( names, types, default values, identity usage, etc. )
* primary keys
* foreign keys
* unique indexes

table2json was tested on postgres and sql-server but as it relies on **information_schema** views it might be plugged in to other DBMS *with some effort*.

## How to use it?

```js
const table2json = require( 'table2json' );
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
```

### Connecting to postgres
To connect to postgres you need to:
  1. create a database interface by passing 'postgres' as the argument
```JS
const db = table2json( 'postgresql' );
```
  2. pass connection description object to the `open` method, this object is consumed by the **pg** library and should be compatible with its specification
```JS
await db.open({
	"host":"localhost",
	"port":5432,
	"database":"xxxxx",
	"password":"xxxxx",
	"user":"xxxxx"
});
```

### Connecting to sqlserver
To connect to sqlserver you need to:
  1. create a database interface by passing 'sqlserver' as the argument
```JS
const db = table2json( 'sqlserver' );
```
  2. pass connection description object or a connection string to the `open` method, the passed data is consumed by **mssql** library and should be compatible with its formats, example:
```JS
await db.open({
	"password": "xxxxxxxxxxx",
	"port": 1433,
	"user": "xxxxxxxxxxx",
	"server": "localhost",
	"database": "xxxxxxxxxxx",
	"stream": false,
	"options": {
		"enableArithAbort": true,
		"encrypt": true
	}
});
```
Some remarks:
 - the sqlserver you connect to should accept TCP/IP connections
 - if you use just a connction string or an object as above but without the `options` part, there will be a warning shown, despite the warning the program should run successfully
