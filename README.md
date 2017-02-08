[![Build Status](https://travis-ci.org/justinlettau/sql-source-control.svg?branch=master)](https://travis-ci.org/justinlettau/sql-source-controlls)
[![Dependency Status](https://david-dm.org/justinlettau/sql-source-control.svg)](https://david-dm.org/justinlettau/sql-source-control)
[![Dev Dependency Status](https://david-dm.org/justinlettau/sql-source-control/dev-status.svg)](https://david-dm.org/justinlettau/sql-source-control?type=dev)

# SQL Source Control
`sql-source-control` is an open source CLI for scripting out SQL objects into a flat file structure
for use with source control systems such as Git, SVN or Mercurial. Under the hood, `sql-source-control`
discovers database objects and scripts them out using native database code. All SQL scripts are placed
in the `sql-database` directory. From there, you can use you any source control CLI or GUI to commit
to your source control system.

# Installation
```
npm install -g sql-source-control
```

# Usage
`sql-source-control` connects to your database with settings from a `ssc.json` config file. Commands
are directory specific, so run all commands in the directory you want the scripts created in.

```
ssc --help
```

## Init
Create default `ssc.json` config file. After creation, you will need to enter database connection
information in the `ssc.json` file.

```
ssc init
```

## Go
Generate SQL files for all stored procedures, functions, views, etc.

```
ssc go
```

# Development
For easy development, run the following command in the `sql-source-control` directory:

```
npm link
```
