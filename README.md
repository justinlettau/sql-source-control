[![Build Status](https://travis-ci.org/justinlettau/sql-source-control.svg?branch=master)](https://travis-ci.org/justinlettau/sql-source-controlls)
[![Dependency Status](https://david-dm.org/justinlettau/sql-source-control.svg)](https://david-dm.org/justinlettau/sql-source-control)
[![Dev Dependency Status](https://david-dm.org/justinlettau/sql-source-control/dev-status.svg)](https://david-dm.org/justinlettau/sql-source-control?type=dev)

# SQL Source Control
Simple CLI for getting SQL into source control systems.

# Installation
```
npm install -g sql-source-control
```

# Usage
```
ssc --help
```

## Init
Create default `css.json` config file.

```
ssc init
```

## Go
Generate SQL files for all stored procedures, functions, views, etc.

```
ssc go
```
