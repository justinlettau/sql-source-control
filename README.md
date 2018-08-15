[![NPM Version](https://badge.fury.io/js/sql-source-control.svg)](https://badge.fury.io/js/sql-source-control)
[![Build Status](https://travis-ci.org/justinlettau/sql-source-control.svg?branch=master)](https://travis-ci.org/justinlettau/sql-source-control)
[![Dependency Status](https://david-dm.org/justinlettau/sql-source-control.svg)](https://david-dm.org/justinlettau/sql-source-control)
[![Dev Dependency Status](https://david-dm.org/justinlettau/sql-source-control/dev-status.svg)](https://david-dm.org/justinlettau/sql-source-control?type=dev)

# SQL Source Control
`sql-source-control` is an open source CLI for scripting out SQL objects into a flat file structure
for use with source control systems such as Git, SVN or Mercurial. Under the hood, `sql-source-control`
discovers database objects and scripts them out using native database code. From there, you can use
any source control CLI or GUI to commit to your source control system.

Works with Microsoft SQL Server 2005 and higher.

# Installation
```bash
npm install -g sql-source-control
```

# Usage
`sql-source-control` connects to your database with settings from a config file. Commands
are directory specific, so run all commands in the directory you want the scripts created in.

```bash
ssc --help
```

**Note**: Make sure to enable TCP/IP in "SQL Server Network Configuration" settings ([instructions](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/enable-or-disable-a-server-network-protocol?view=sql-server-2017#to-enable-a-server-network-protocol)).
If TCP/IP is not enabled, you may receive a "failed to connect" error on commands.

## Init
This will ask you a bunch of questions, and then write a config file for you.

If the current directory contains a `Web.config` file with the `connectionStrings` property, the
first node will be used for default values. Alternatively, a path to a `Web.config` file can be
specified with the `--webconfig` flag.

```bash
ssc init
```

Options:
- `-f` or `--force` will overwrite an existing config file, if present.
- `-s` or `--skip` will use defaults and not prompt you for any options.
- `-w` or `--webconfig` to provide a relative path to a `Web.config` file.

## Conns
List all available connections specified in the configuration file.

```bash
ssc conns
```

## Pull
Generate SQL files for all tables, stored procedures, functions, etc. All scripts will be put in
the output root directory and SQL scripts will be organized into subdirectories (based on config
file).

```bash
ssc pull dev
```

Where `dev` is the optional name of the connection to use. If omitted, the first available connection
is used.

Example output:

```
./_sql-database
    ./data
        dbo.easy-lookup.sql
        ...
    ./functions/scalar-valued
        dbo.complex-math.sql
        ...
    ./functions/table-valued
        dbo.awesome-table-func.sql
        ...
    ./schemas
        dbo.sql
        ...
    ./stored-procedures
        dbo.people-read.sql
        ...
    ./tables
        dbo.people.sql
        ...
    ./user-defined-types/table-valued-parameters
        dbo.insert-people-params.sql
        ...
    ./views
        dbo.super-cool-view.sql
        ...
```

Data can be included in the `pull` via the `data` option in the configuration file. All tables included
in the `data` option will result in a file that truncates the table and inserts all rows. Because a truncate
is issued, it is recommended to only include static data tables, like lookup tables, in the `data`
configuration.

## Push
Execute all local scripts against the requested database.

```bash
ssc push prod
```

Where `prod` is the optional name of the connection to use. If omitted, the first available connection
is used.

WARNING:
All scripts are directly executed against the requested connection. This can not be undone! Be sure
to backup your database before running the `push` command.

## Cat
Concatenate all SQL files into a single file. Outputs to `./_sql-database/cat.sql`.

```bash
ssc cat
```

# Config Options
Configuration options are stored in a `ssc.json` file.

```js
{
  // SQL server connections ...
  "connections": [{
    "name": "dev",
    "server": "dev.example.com\\development",
    "database": "awesome-db",
    "port": 1433,
    "user": "example",
    "password": "qwerty"
  }],

  // ... OR, path to Web.config file with connectionStrings
  "connections": "./Web.config",

  // ... OR, path to ssc-connections.json file
  "connections": "./ssc-connections.json",

  // the following options are optional (default values shown) ...

  // glob of files to include / exclude (examples: ["dbo.*"] or ["*", "!dbo.*"])
  "files": [],

  // list of tables to include / exclude for data scripting (example: ["dbo.LookupTable"])
  "data": [],

  "output": {

    // directory to place scripted files into (relative to config file)
    "root": "./_sql-database",

    // directory to script data (relative to root)
    "data": "./data"

    // directory to script procs (relative to root), or false
    "procs": "./stored-procedures",

    // directory to script scalar functions (relative to root), or false
    "scalar-valued": "./functions/scalar-valued",

    // directory to script schemas (relative to root), or false
    "schemas": "./schemas",

    // directory to script table functions (relative to root), or false
    "table-valued": "./functions/table-valued",

    // directory to script table-valued parameters (relative to root), or false
    "table-valued-parameters": "./user-defined-types/table-valued-parameters"

    // directory to script tables (relative to root), or false
    "tables": "./tables",

    // directory to script triggers (relative to root), or false
    "triggers": "./triggers",

    // directory to script views (relative to root), or false
    "views": "./views"
  },

  "idempotency": {

    // options: "if-exists-drop", "if-not-exists", or false
    "procs": "if-exists-drop",
    "scalar-valued": "if-exists-drop",
    "table-valued": "if-exists-drop",
    "table-valued-parameters": "if-not-exists",
    "tables": "if-not-exists",
    "triggers": "if-exists-drop",
    "views": "if-exists-drop"
  }
}
```

# Development
For easy development, clone the repo and run the following commands in the `sql-source-control` directory:

```bash
npm install
npm link
npm run build
```
