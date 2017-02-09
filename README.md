[![NPM Version](https://badge.fury.io/js/sql-source-control.svg)](https://badge.fury.io/js/sql-source-control)
[![Build Status](https://travis-ci.org/justinlettau/sql-source-control.svg?branch=master)](https://travis-ci.org/justinlettau/sql-source-controlls)
[![Dependency Status](https://david-dm.org/justinlettau/sql-source-control.svg)](https://david-dm.org/justinlettau/sql-source-control)
[![Dev Dependency Status](https://david-dm.org/justinlettau/sql-source-control/dev-status.svg)](https://david-dm.org/justinlettau/sql-source-control?type=dev)

# SQL Source Control
`sql-source-control` is an open source CLI for scripting out SQL objects into a flat file structure
for use with source control systems such as Git, SVN or Mercurial. Under the hood, `sql-source-control`
discovers database objects and scripts them out using native database code. All SQL scripts are placed
in the `sql-database` directory. From there, you can use you any source control CLI or GUI to commit
to your source control system.

Works with Microsoft SQL Server 2005 and higher.

# Installation
```bash
npm install -g sql-source-control
```

# Usage
`sql-source-control` connects to your database with settings from a `ssc.json` config file. Commands
are directory specific, so run all commands in the directory you want the scripts created in.

```bash
ssc --help
```

## Init
Create default `ssc.json` config file. After creation, you will need to enter the database connection
information into the config file.

```bash
ssc init
```

## Go
Generate SQL files for all tables, stored procedures, functions, etc. All scripts will be put in a
`sql-database` directory and SQL scripts will be organizaed into subdirectories.

```bash
ssc go
```

Example output:

```
/sql-database
    /stored-procedures
        people-read.sql
        ...
    /functions/table-valued
        awesome-table-func.sql
        ...
    /functions/scalar-valued
        complex-math.sql
        ...
    /views
        super-cool-view.sql
        ...
```

# Config Options
Required proprties are `user`, `password`, `server`, `database`, and `port`. All others are otpional.

```json
{
    "user": "example",
    "password": "qwerty",
    "server": "dev.example.com\\development",
    "database": "awesome-db",
    "port": 1433,
    "include": "cool.*",
    "exclude": "*.danger*"
}
```

In the above example:

The `include` property includes everything from `cool` schema.

The `exclude` property exludes all scripts that start with `danger`.

# Development
For easy development, run the following commands in the `sql-source-control` directory:

```bash
npm install
npm link
```
