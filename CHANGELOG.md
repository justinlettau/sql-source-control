# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.0.0"></a>
# [2.0.0](https://github.com/justinlettau/sql-source-control/compare/v1.9.1...v2.0.0) (2018-10-08)


### Bug Fixes

* convert objects to a valid safe filenames ([2890512](https://github.com/justinlettau/sql-source-control/commit/2890512)), closes [#41](https://github.com/justinlettau/sql-source-control/issues/41)
* **deps:** update dependency tedious to v3 ([#44](https://github.com/justinlettau/sql-source-control/issues/44)) ([1f697b0](https://github.com/justinlettau/sql-source-control/commit/1f697b0))


### Chores

* remove cat command ([903f411](https://github.com/justinlettau/sql-source-control/commit/903f411))
* upgrade to classes ([c4f0279](https://github.com/justinlettau/sql-source-control/commit/c4f0279))


### Features

* add config option for commands ([45c60ac](https://github.com/justinlettau/sql-source-control/commit/45c60ac))
* add data idempotency options ([ad14985](https://github.com/justinlettau/sql-source-control/commit/ad14985)), closes [#46](https://github.com/justinlettau/sql-source-control/issues/46) [#47](https://github.com/justinlettau/sql-source-control/issues/47)
* add file checksum comparison to reduce disk i/o ([5946370](https://github.com/justinlettau/sql-source-control/commit/5946370))
* add prompt to push command ([2573dc2](https://github.com/justinlettau/sql-source-control/commit/2573dc2))
* add support for data glob patterns ([15cda32](https://github.com/justinlettau/sql-source-control/commit/15cda32)), closes [#45](https://github.com/justinlettau/sql-source-control/issues/45)
* consolidate output/idempotency options ([81029fc](https://github.com/justinlettau/sql-source-control/commit/81029fc))
* improve CLI output ([5d36353](https://github.com/justinlettau/sql-source-control/commit/5d36353))
* unify output formatting ([69ac919](https://github.com/justinlettau/sql-source-control/commit/69ac919))


### BREAKING CHANGES

* Before:
```
"output": {
  "scalar-valued": "./functions/scalar-valued",
  "table-valued": "./functions/table-valued",
  "table-valued-parameters": "./user-defined-types/table-valued-parameters"
}
```

```
"idempotency": {
  "scalar-valued": "if-exists-drop",
  "table-valued": "if-exists-drop",
  "table-valued-parameters": "if-not-exists"
}
```

After:
```
"output": {
  "functions": "./functions",
  "types": "./types"
}
```

```
"idempotency": {
  "functions": "if-exists-drop",
  "types": "if-not-exists"
}
```
* remove `cat` command
* remove deprecated `connection` configuration option



<a name="1.9.1"></a>
## [1.9.1](https://github.com/justinlettau/sql-source-control/compare/v1.9.0...v1.9.1) (2018-09-14)


### Bug Fixes

* **deps:** update dependency fs-extra to v7 ([#35](https://github.com/justinlettau/sql-source-control/issues/35)) ([bb4a387](https://github.com/justinlettau/sql-source-control/commit/bb4a387))
* Fix foreign key scripting ([#40](https://github.com/justinlettau/sql-source-control/issues/40)) ([c7a48ca](https://github.com/justinlettau/sql-source-control/commit/c7a48ca)), closes [#39](https://github.com/justinlettau/sql-source-control/issues/39)



<a name="1.9.0"></a>
# [1.9.0](https://github.com/justinlettau/sql-source-control/compare/v1.8.0...v1.9.0) (2018-07-07)


### Bug Fixes

* remove column ordering by name ([80fb9d7](https://github.com/justinlettau/sql-source-control/commit/80fb9d7)), closes [#33](https://github.com/justinlettau/sql-source-control/issues/33)
* **pull:** script computed field formula ([2092150](https://github.com/justinlettau/sql-source-control/commit/2092150)), closes [#30](https://github.com/justinlettau/sql-source-control/issues/30)


### Features

* add connection config file support ([#29](https://github.com/justinlettau/sql-source-control/issues/29)) ([ed92901](https://github.com/justinlettau/sql-source-control/commit/ed92901))



<a name="1.8.0"></a>
# [1.8.0](https://github.com/justinlettau/sql-source-control/compare/v1.7.1...v1.8.0) (2018-06-11)


### Bug Fixes

* **deps:** update dependency fs-extra to v6 ([#24](https://github.com/justinlettau/sql-source-control/issues/24)) ([77cdbb1](https://github.com/justinlettau/sql-source-control/commit/77cdbb1))
* **deps:** update dependency inquirer to v6 ([#25](https://github.com/justinlettau/sql-source-control/issues/25)) ([65b047e](https://github.com/justinlettau/sql-source-control/commit/65b047e))


### Features

* add config to exclude output ([9d6a21d](https://github.com/justinlettau/sql-source-control/commit/9d6a21d))
* add data scripting to pull ([#26](https://github.com/justinlettau/sql-source-control/issues/26)) ([d874206](https://github.com/justinlettau/sql-source-control/commit/d874206))



<a name="1.7.1"></a>
## [1.7.1](https://github.com/justinlettau/sql-source-control/compare/v1.7.0...v1.7.1) (2018-04-04)


### Bug Fixes

* **deps:** update dependency fs-extra to ^5.0.0 ([#20](https://github.com/justinlettau/sql-source-control/issues/20)) ([33813b6](https://github.com/justinlettau/sql-source-control/commit/33813b6))
* **deps:** update dependency inquirer to ^5.0.0 ([#21](https://github.com/justinlettau/sql-source-control/issues/21)) ([e61dfff](https://github.com/justinlettau/sql-source-control/commit/e61dfff))
* **pull:** correct table-valued parameters not exists idempotency ([#23](https://github.com/justinlettau/sql-source-control/issues/23)) ([4c1df49](https://github.com/justinlettau/sql-source-control/commit/4c1df49)), closes [#22](https://github.com/justinlettau/sql-source-control/issues/22)
* script indent inconsistencies ([68b20da](https://github.com/justinlettau/sql-source-control/commit/68b20da))



<a name="1.7.0"></a>
# [1.7.0](https://github.com/justinlettau/sql-source-control/compare/v1.6.0...v1.7.0) (2018-02-27)


### Features

* add support for table-valued parameters ([25d4c0d](https://github.com/justinlettau/sql-source-control/commit/25d4c0d))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/justinlettau/sql-source-control/compare/v1.5.0...v1.6.0) (2018-02-04)


### Features

* add push command ([a54bf6f](https://github.com/justinlettau/sql-source-control/commit/a54bf6f))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/justinlettau/sql-source-control/compare/v1.4.0...v1.5.0) (2018-02-02)


### Features

* add update notification ([cbc21c2](https://github.com/justinlettau/sql-source-control/commit/cbc21c2))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/justinlettau/sql-source-control/compare/v1.3.2...v1.4.0) (2018-01-13)


### Features

* add `conns` command ([a53d656](https://github.com/justinlettau/sql-source-control/commit/a53d656))



<a name="1.3.2"></a>
## [1.3.2](https://github.com/justinlettau/sql-source-control/compare/v1.3.1...v1.3.2) (2018-01-13)


### Bug Fixes

* properly handle relative root directory ([#9](https://github.com/justinlettau/sql-source-control/issues/9)) ([a782fd1](https://github.com/justinlettau/sql-source-control/commit/a782fd1))
* remove duplicate schemas ([056d58e](https://github.com/justinlettau/sql-source-control/commit/056d58e))



<a name="1.3.1"></a>
## [1.3.1](https://github.com/justinlettau/sql-source-control/compare/v1.3.0...v1.3.1) (2018-01-11)


### Bug Fixes

* pull inline-table value functions ([#11](https://github.com/justinlettau/sql-source-control/issues/11)) ([dfdbfa6](https://github.com/justinlettau/sql-source-control/commit/dfdbfa6))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/justinlettau/sql-source-control/compare/v1.2.0...v1.3.0) (2017-11-03)


### Bug Fixes

* build error with chalk import ([4c22e4a](https://github.com/justinlettau/sql-source-control/commit/4c22e4a))


### Features

* add schema scripting ([32e75f7](https://github.com/justinlettau/sql-source-control/commit/32e75f7))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/justinlettau/sql-source-control/compare/v1.1.0...v1.2.0) (2017-06-17)


### Features

* add cat command ([ec8e18c](https://github.com/justinlettau/sql-source-control/commit/ec8e18c))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/justinlettau/sql-source-control/compare/v1.0.6...v1.1.0) (2017-06-09)


### Features

* add support for multiple connections ([2319658](https://github.com/justinlettau/sql-source-control/commit/2319658))
