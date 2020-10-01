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
const table2json = require('table2json');

(async function () {
	// create a db-interface, we need to pass dbms name
	// this could be either "postgres" or "sqlserver"
	// in this example we will play with postgres
	const db = table2json( 'postgresql' );

	await db.open({
		"host":"localhost",
		"port":5432,
		"database":"xxxxx",
		"password":"xxxxx",
		"user":"xxxxx"
	});

	// get the list of tables for the schema public
	let tables = await reader.listTables( 'public' );
})();
```
