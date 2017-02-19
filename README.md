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

If the current directory contains a `web.config` file with the `connectionStrings` property, the
first node will be used for default values.

```bash
ssc init
```

Options:
- `-f` or `--force` will overwrite an existing config file, if present.
- `-s` or `--skip` will use defaults and not prompt you for any options.

## Pull
Generate SQL files for all tables, stored procedures, functions, etc. All scripts will be put in
the output root directory and SQL scripts will be organizaed into subdirectories (based on config
file).

```bash
ssc pull
```

Example output:

```
./_sql-database
    ./functions/scalar-valued
        dbo.complex-math.sql
        ...
    ./functions/table-valued
        dbo.awesome-table-func.sql
        ...
    ./stored-procedures
        dbo.people-read.sql
        ...
    ./tables
        dbo.people.sql
        ...
    ./views
        dbo.super-cool-view.sql
        ...
```

# Config Options
Configuration options are stored in a `ssc.json` file.

```
{
    "server": "dev.example.com\\development",
    "database": "awesome-db",
    "port": 1433,
    "user": "example",
    "password": "qwerty",

    // the following options are optional ...

    // glob of files to include
    "include": "cool.*",

    // glob of files to exclude
    "exclude": "*.danger*",

    "output": {

        // directory to place scripted files into (relative to config file)
        "root": "./_sql-databse",

        // directory to script scalar functions (relative to root)
        "scalar-valued": "./functions/scalar-valued",

        // directory to script table functions (relative to root)
        "table-valued": "./functions/table-valued",

        // directory to script procs (relative to root)
        "procs": "./stored-procedures",

        // directory to script tables (relative to root)
        "tables": "./tables",

        // directory to script triggers (relative to root)
        "triggers": "./triggers"

        // directory to script views (relative to root)
        "views": "./views"
    },

    "idempotency": {

        // options: "if-exists-drop", "if-not-exists", or false
        "procs": "if-exists-drop",
        "scalar-valued": "if-exists-drop",
        "table-valued": "if-exists-drop",
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
```
