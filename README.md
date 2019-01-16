[![NPM Version](https://badge.fury.io/js/sql-source-control.svg)](https://badge.fury.io/js/sql-source-control)
[![Build Status](https://travis-ci.org/justinlettau/sql-source-control.svg?branch=master)](https://travis-ci.org/justinlettau/sql-source-control)
[![Build status](https://ci.appveyor.com/api/projects/status/a92idr95kkly8lgt/branch/master?svg=true)](https://ci.appveyor.com/project/justinlettau/sql-source-control/branch/master)
[![Dependency Status](https://david-dm.org/justinlettau/sql-source-control.svg)](https://david-dm.org/justinlettau/sql-source-control)
[![Dev Dependency Status](https://david-dm.org/justinlettau/sql-source-control/dev-status.svg)](https://david-dm.org/justinlettau/sql-source-control?type=dev)

# SQL Source Control

CLI for scripting SQL objects into a flat file structure for use with source control systems.

# Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Examples](#examples)
  - [Connections](#connections)
  - [Files](#files)
  - [Data](#data)
  - [Output](#output)
  - [Idempotency](#idempotency)
  - [Defaults](#defaults)
- [Development](#development)

# Features

- Works with **any source control system** like Git, SVN, Mercurial, etc.
- Supports all recent version of **Microsoft SQL Server**.
- **Free and open source**!

# Installation

```bash
npm install -g sql-source-control
```

# Usage

Commands are directory specific, so run all commands in the directory you want the scripts created in.

```bash
ssc --help
```

**Note**: Make sure to enable TCP/IP in "SQL Server Network Configuration" settings ([instructions](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/enable-or-disable-a-server-network-protocol?view=sql-server-2017#to-enable-a-server-network-protocol)).
If TCP/IP is not enabled, you may receive a "failed to connect" error on commands.

### `ssc init`

This will ask you a bunch of questions, and then write a config file for you.

If the current directory contains a `Web.config` file with the `connectionStrings` property, the
first node will be used for default values. Alternatively, a path to a `Web.config` file can be
specified with the `--webconfig` flag.

Options:

| Option        | Alias | Type      | Description                                     | Default |
| ------------- | ----- | --------- | ----------------------------------------------- | ------- |
| `--force`     | `-f`  | `boolean` | Overwrite an existing config file, if present.  | n/a     |
| `--skip`      | `-s`  | `boolean` | Use defaults and not prompt you for any options | n/a     |
| `--webconfig` | `-w`  | `string`  | Relative path to a `Web.config` file.           | n/a     |

### `ssc list`

List all available connections specified in the configuration file.

Options:

| Option     | Alias | Type     | Description                   | Default    |
| ---------- | ----- | -------- | ----------------------------- | ---------- |
| `--config` | `-c`  | `string` | Relative path to config file. | `ssc.json` |

### `ssc pull [conn]`

Generate SQL files for all tables, stored procedures, functions, etc. All scripts will be put in
the `output.root` directory and SQL scripts will be organized into subdirectories (based on config
file).

Within the `output.root` directory, `cache.json` is automatically generated and is intended to be committed into source
repositories. This file stores checksums of each file for comparison, to reduce disk I/O.

Data can be included in the via the `data` option in the configuration file. All tables included in the `data` option
will result in a file that truncates the table and inserts all rows. Because a truncate is issued, it is recommended to
only include static data tables, like lookup tables, in the `data` configuration.

Arguments:

| Argument | Description                             | Default                                 |
| -------- | --------------------------------------- | --------------------------------------- |
| `conn`   | Optional name of the connection to use. | First available connection from config. |

Options:

| Option     | Alias | Type     | Description                   | Default    |
| ---------- | ----- | -------- | ----------------------------- | ---------- |
| `--config` | `-c`  | `string` | Relative path to config file. | `ssc.json` |

Example output (see [here](https://github.com/justinlettau/sql-source-control-example) for full example):

```
./_sql-database
  ./data
    dbo.easy-lookup.sql
    ...
  ./functions
    dbo.complex-math.sql
    dbo.awesome-table-function.sql
    ...
  ./jobs
    amazing-things.sql
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
  ./types
    dbo.people-type.sql
    ...
  ./views
    dbo.super-cool-view.sql
    ...
```

### `ssc push [conn]`

Execute all local scripts against the requested database.

Arguments:

| Argument | Description                             | Default                                 |
| -------- | --------------------------------------- | --------------------------------------- |
| `conn`   | Optional name of the connection to use. | First available connection from config. |

Options:

| Option     | Alias | Type      | Description                   | Default    |
| ---------- | ----- | --------- | ----------------------------- | ---------- |
| `--config` | `-c`  | `string`  | Relative path to config file. | `ssc.json` |
| `--skip`   | `-s`  | `boolean` | Skip user warning prompt.     | `false`    |

# Configuration

Configuration options are stored in a `ssc.json` file. The following properties are supported:

**connections** (`object[]`, `string`): Relative path to a `Web.config` file with `connectionStrings`, a
`ssc-connections.json` file with an array of connections, or an array of connections with the following properties:

| Property   | Type     | Description      | Default |
| ---------- | -------- | ---------------- | ------- |
| `name`     | `string` | Connection name. | n/a     |
| `server`   | `string` | Server name.     | n/a     |
| `database` | `string` | Database name.   | n/a     |
| `port`     | `number` | Server port.     | n/a     |
| `user`     | `string` | Login username.  | n/a     |
| `password` | `string` | Login password.  | n/a     |

**files** (`string[]`): Optional. Glob of files to include/exclude during the `pull` command. Default includes all files.

**data** (`string[]`): Optional. Glob of table names to include for data scripting during the `pull` command. Default
includes none.

**output** (`object`): Optional. Defines paths where files will be scripted during the `pull` command. The following
properties are supported:

| Property    | Type     | Description                                            | Default               |
| ----------- | -------- | ------------------------------------------------------ | --------------------- |
| `root`      | `string` | Directory for scripted files, relative to config file. | `./_sql-database`     |
| `data`      | `string` | Subdirectory for data files.                           | `./data`              |
| `functions` | `string` | Subdirectory for function files.                       | `./functions`         |
| `jobs`      | `string` | Subdirectory for jobs files.                           | `./jobs`              |
| `procs`     | `string` | Subdirectory for stored procedure files.               | `./stored-procedures` |
| `schemas`   | `string` | Subdirectory for schema files.                         | `./schemas`           |
| `tables`    | `string` | Subdirectory for table files.                          | `./tables`            |
| `triggers`  | `string` | Subdirectory for trigger files.                        | `./triggers`          |
| `types`     | `string` | Subdirectory for table valued parameter files.         | `./types`             |
| `views`     | `string` | Subdirectory for view files.                           | `./views`             |

**idempotency** (`object`): Optional. Defines what type of idempotency will scripted during the `pull` command. The
following properties are supported.

| Property    | Type         | Description                                         | Default          |
| ----------- | ------------ | --------------------------------------------------- | ---------------- |
| `data`      | `string` (2) | Idempotency for data files.                         | `truncate`       |
| `functions` | `string` (1) | Idempotency for function files.                     | `if-exists-drop` |
| `jobs`      | `string` (1) | Idempotency for job files.                          | `if-exists-drop` |
| `procs`     | `string` (1) | Idempotency for stored procedure files.             | `if-exists-drop` |
| `tables`    | `string` (1) | Idempotency for table files.                        | `if-not-exists`  |
| `triggers`  | `string` (1) | Idempotency for trigger files.                      | `if-exists-drop` |
| `types`     | `string` (1) | Idempotency for user defined table parameter files. | `if-not-exists`  |
| `views`     | `string` (1) | Idempotency for view files.                         | `if-exists-drop` |

1. `if-exists-drop`, `if-not-exists`, or `false`.
2. `delete-and-reseed`, `delete`, `truncate`, or `false`.

# Examples

### Connections

Basic connections.

```json
{
  "connections": [
    {
      "name": "dev",
      "server": "localhost\\development",
      "database": "awesome-db",
      "port": 1433,
      "user": "example",
      "password": "qwerty"
    }
  ]
}
```

Connections stored in `Web.config` file.

```json
{
  "connections": "./Web.config"
}
```

Connections stored in separate JSON file. Storing connections in a separate JSON can be used in conjunction with a
`.gitignore` entry to prevent user connections or sensitive data from being committed.

```json
{
  "connections": "./ssc-connections.json"
}
```

### Files

Only include certain files.

```js
{
  // ...
  "files": ["dbo.*"]
}
```

Exclude certain files.

```js
{
  // ...
  "files": ["*", "!dbo.*"]
}
```

### Data

Only include certain tales.

```js
{
  // ...
  "data": ["dbo.*"]
}
```

Exclude certain tables.

```js
{
  // ...
  "data": ["*", "!dbo.*"]
}
```

### Output

Override default options.

```js
{
  // ...
  "output": {
    "root": "./my-database",
    "procs": "./my-procs",
    "triggers": false
  }
}
```

### Idempotency

Override default options.

```js
{
  // ...
  "idempotency": {
    "triggers": false,
    "views": "if-not-exists"
  }
}
```

### Defaults

Default configuration values.

```json
{
  "connections": [],
  "files": [],
  "data": [],
  "output": {
    "root": "./_sql-database",
    "data": "./data",
    "functions": "./functions",
    "jobs": "./jobs",
    "procs": "./stored-procedures",
    "schemas": "./schemas",
    "tables": "./tables",
    "triggers": "./triggers",
    "types": "./types",
    "views": "./views"
  },
  "idempotency": {
    "data": "truncate",
    "functions": "if-exists-drop",
    "jobs": "if-exists-drop",
    "procs": "if-exists-drop",
    "tables": "if-not-exists",
    "triggers": "if-exists-drop",
    "types": "if-not-exists",
    "views": "if-exists-drop"
  }
}
```

# Development

Clone the repo and run the following commands in the `sql-source-control` directory:

```bash
npm install
npm link
npm run build
```
