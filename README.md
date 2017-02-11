[![NPM Version](https://badge.fury.io/js/sql-source-control.svg)](https://badge.fury.io/js/sql-source-control)
[![Build Status](https://travis-ci.org/justinlettau/sql-source-control.svg?branch=master)](https://travis-ci.org/justinlettau/sql-source-controlls)
[![Dependency Status](https://david-dm.org/justinlettau/sql-source-control.svg)](https://david-dm.org/justinlettau/sql-source-control)
[![Dev Dependency Status](https://david-dm.org/justinlettau/sql-source-control/dev-status.svg)](https://david-dm.org/justinlettau/sql-source-control?type=dev)

# SQL Source Control
`sql-source-control` is an open source CLI for scripting out SQL objects into a flat file structure
for use with source control systems such as Git, SVN or Mercurial. Under the hood, `sql-source-control`
discovers database objects and scripts them out using native database code. From there, you can use
you any source control CLI or GUI to commit to your source control system.

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

## Init
This will ask you a bunch of questions, and then write a config file for you.

```bash
ssc init
```

Options:
- `-f` or `--force` will overwrite an existing config file, if present.
- `-s` or `--skip` will use defaults and not prompt you for any options.

## Go
Generate SQL files for all tables, stored procedures, functions, etc. All scripts will be put in
the output root directory and SQL scripts will be organizaed into subdirectories (based on config
file).

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
Configuration options are stored in a `ssc.json` file.

```json
{
    "user": "example",
    "password": "qwerty",
    "server": "dev.example.com\\development",
    "database": "awesome-db",
    "port": 1433,

    // the following options are optional ..

    // glob of files to include
    "include": "cool.*",

    // glob of files to exclude
    "exclude": "*.danger*",

    "output": {

        // directory to place scripted files into
        "root": "/sqlite-databse",

        // directory to script procs (relative to root)
        "procs": "/procs",

        // directory to script views (relative to root)
        "views": "/views",

        // directory to script table functions  (relative to root)
        "table-valued": "/functions/table-valued",

        // directory to script scalar functions  (relative to root)
        "scalar-valued": "/functions/scalar-valued"
    }
}
```

# Development
For easy development, run the following commands in the `sql-source-control` directory:

```bash
npm install
npm link
```
