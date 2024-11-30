# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.1](https://github.com/justinlettau/sql-source-control/compare/v3.0.0...v3.0.1) (2024-07-25)


### Bug Fixes

* **deps:** update dependency xml2js to ^0.5.0 [security] ([859b589](https://github.com/justinlettau/sql-source-control/commit/859b589512ca189fe6861b30ff002c2700d63cb0))
* **deps:** update dependency xml2js to ^0.6.0 ([355a768](https://github.com/justinlettau/sql-source-control/commit/355a768f941010c886fba1a39c3a73a1f5c21855))
* readme ([e2b7a13](https://github.com/justinlettau/sql-source-control/commit/e2b7a13ce676d3cc4876bc83768507c6c02f271b))

## [3.0.0](https://github.com/justinlettau/sql-source-control/compare/v2.1.1...v3.0.0) (2020-12-17)


### Features

* add `includeConstraintName` config option ([0235d94](https://github.com/justinlettau/sql-source-control/commit/0235d948e87b26a2fe592df24c99a98cbd285948))
* add docker ([c5545a7](https://github.com/justinlettau/sql-source-control/commit/c5545a77c590fdbda2229794da2e3847f982777c))
* add eol config option ([a5ca82e](https://github.com/justinlettau/sql-source-control/commit/a5ca82e8484a56fbcc64182691a4b3d4d140ad40)), closes [#7](https://github.com/justinlettau/sql-source-control/issues/7)
* support both CLUSTERED and NONCLUSTERED INDEX, PERSISTED computed columns ([#133](https://github.com/justinlettau/sql-source-control/issues/133)) ([d37ad0a](https://github.com/justinlettau/sql-source-control/commit/d37ad0a4ed729a10c9c94314558e945d49740359))


### Bug Fixes

* appveyor node version ([9ccfe5a](https://github.com/justinlettau/sql-source-control/commit/9ccfe5a754cb5d8fa1fbc122bf8d3e9bd1405d6b))
* build typing errors ([7367c73](https://github.com/justinlettau/sql-source-control/commit/7367c735f6be2bbb543b4103c3c585415234edf1))
* convert actions to async ([8ad32f9](https://github.com/justinlettau/sql-source-control/commit/8ad32f9714918a17f4b38689ee2d7dfb8ff91002))
* convert actions to async ([829b501](https://github.com/justinlettau/sql-source-control/commit/829b5013f0cb0539a53fe7fe1907e1240b466c7a))
* convert actions to async ([5593747](https://github.com/justinlettau/sql-source-control/commit/55937475f451273e95e588d3426b57af6419ce91))
* convert actions to async ([a841aee](https://github.com/justinlettau/sql-source-control/commit/a841aee6158d5b0852b732f811679b36103bfde0))
* corrected data generation ([#117](https://github.com/justinlettau/sql-source-control/issues/117)) ([e109f7d](https://github.com/justinlettau/sql-source-control/commit/e109f7d72e4e76140e531f29053abd979843f658))
* download bak files to backups folder ([4fa85ce](https://github.com/justinlettau/sql-source-control/commit/4fa85ce71e07cd227a85376c1df7ee5f5849a100))
* export names of default constraints ([47eb83c](https://github.com/justinlettau/sql-source-control/commit/47eb83c9e6bb93652799e4230a67691043c9e836)), closes [#81](https://github.com/justinlettau/sql-source-control/issues/81)
* identity insert line break ([b33b9c8](https://github.com/justinlettau/sql-source-control/commit/b33b9c8bb8af3e16fb26bd039a404912ae93a535))
* lint error ([0e49aa6](https://github.com/justinlettau/sql-source-control/commit/0e49aa6e8a55bd0d5b8c7043f58918f36ce2d96f))
* port type should be number instead of string ([#118](https://github.com/justinlettau/sql-source-control/issues/118)) ([69e9b2b](https://github.com/justinlettau/sql-source-control/commit/69e9b2bca1231ab61071863c9cc10deea72219ef))
* remove backups folder ([4d7f71b](https://github.com/justinlettau/sql-source-control/commit/4d7f71b4a4547e842d04a908cf61557af643da90))

<a name="2.1.1"></a>

## [2.1.1](https://github.com/justinlettau/sql-source-control/compare/v2.1.0...v2.1.1) (2019-01-23)

### Bug Fixes

- skip job queries when no output ([cba23cc](https://github.com/justinlettau/sql-source-control/commit/cba23cc)), closes [#65](https://github.com/justinlettau/sql-source-control/issues/65)

<a name="2.1.0"></a>

# [2.1.0](https://github.com/justinlettau/sql-source-control/compare/v2.0.2...v2.1.0) (2019-01-16)

### Bug Fixes

- **deps:** update dependency multimatch to v3 ([#57](https://github.com/justinlettau/sql-source-control/issues/57)) ([25c1e78](https://github.com/justinlettau/sql-source-control/commit/25c1e78))
- add handling for no output root ([1b80a3b](https://github.com/justinlettau/sql-source-control/commit/1b80a3b)), closes [#60](https://github.com/justinlettau/sql-source-control/issues/60)
- foreign key scripting ([b47cdf5](https://github.com/justinlettau/sql-source-control/commit/b47cdf5))
- indexes w/ multiple columns ([9c18038](https://github.com/justinlettau/sql-source-control/commit/9c18038)), closes [#48](https://github.com/justinlettau/sql-source-control/issues/48)
- primary keys w/ multiple columns ([3b0ef94](https://github.com/justinlettau/sql-source-control/commit/3b0ef94))
- remove identity insert when no identiity ([dbe7d33](https://github.com/justinlettau/sql-source-control/commit/dbe7d33)), closes [#53](https://github.com/justinlettau/sql-source-control/issues/53)
- update unit tests to work with node v11 ([b7c4a93](https://github.com/justinlettau/sql-source-control/commit/b7c4a93))
- user defined type scripting ([1378a30](https://github.com/justinlettau/sql-source-control/commit/1378a30))
- **deps:** update dependency tedious to v5 ([#62](https://github.com/justinlettau/sql-source-control/issues/62)) ([01731bb](https://github.com/justinlettau/sql-source-control/commit/01731bb))

### Features

- add job generation to pull ([14125e2](https://github.com/justinlettau/sql-source-control/commit/14125e2)), closes [#31](https://github.com/justinlettau/sql-source-control/issues/31)

<a name="2.0.2"></a>

## [2.0.2](https://github.com/justinlettau/sql-source-control/compare/v2.0.1...v2.0.2) (2018-10-09)

### Bug Fixes

- write NULL for empty data values ([#50](https://github.com/justinlettau/sql-source-control/issues/50)) ([2372554](https://github.com/justinlettau/sql-source-control/commit/2372554)), closes [#49](https://github.com/justinlettau/sql-source-control/issues/49)

<a name="2.0.1"></a>

## [2.0.1](https://github.com/justinlettau/sql-source-control/compare/v2.0.0...v2.0.1) (2018-10-08)

### Bug Fixes

- correct dependency issue ([b5f66df](https://github.com/justinlettau/sql-source-control/commit/b5f66df))

<a name="2.0.0"></a>

# [2.0.0](https://github.com/justinlettau/sql-source-control/compare/v1.9.1...v2.0.0) (2018-10-08)

### Bug Fixes

- convert objects to a valid safe filenames ([2890512](https://github.com/justinlettau/sql-source-control/commit/2890512)), closes [#41](https://github.com/justinlettau/sql-source-control/issues/41)
- **deps:** update dependency tedious to v3 ([#44](https://github.com/justinlettau/sql-source-control/issues/44)) ([1f697b0](https://github.com/justinlettau/sql-source-control/commit/1f697b0))

### Chores

- remove cat command ([903f411](https://github.com/justinlettau/sql-source-control/commit/903f411))
- upgrade to classes ([c4f0279](https://github.com/justinlettau/sql-source-control/commit/c4f0279))

### Features

- add config option for commands ([45c60ac](https://github.com/justinlettau/sql-source-control/commit/45c60ac))
- add data idempotency options ([ad14985](https://github.com/justinlettau/sql-source-control/commit/ad14985)), closes [#46](https://github.com/justinlettau/sql-source-control/issues/46) [#47](https://github.com/justinlettau/sql-source-control/issues/47)
- add file checksum comparison to reduce disk i/o ([5946370](https://github.com/justinlettau/sql-source-control/commit/5946370))
- add prompt to push command ([2573dc2](https://github.com/justinlettau/sql-source-control/commit/2573dc2))
- add support for data glob patterns ([15cda32](https://github.com/justinlettau/sql-source-control/commit/15cda32)), closes [#45](https://github.com/justinlettau/sql-source-control/issues/45)
- consolidate output/idempotency options ([81029fc](https://github.com/justinlettau/sql-source-control/commit/81029fc))
- improve CLI output ([5d36353](https://github.com/justinlettau/sql-source-control/commit/5d36353))
- unify output formatting ([69ac919](https://github.com/justinlettau/sql-source-control/commit/69ac919))

### BREAKING CHANGES

- Before:

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

- remove `cat` command
- remove deprecated `connection` configuration option

<a name="1.9.1"></a>

## [1.9.1](https://github.com/justinlettau/sql-source-control/compare/v1.9.0...v1.9.1) (2018-09-14)

### Bug Fixes

- **deps:** update dependency fs-extra to v7 ([#35](https://github.com/justinlettau/sql-source-control/issues/35)) ([bb4a387](https://github.com/justinlettau/sql-source-control/commit/bb4a387))
- Fix foreign key scripting ([#40](https://github.com/justinlettau/sql-source-control/issues/40)) ([c7a48ca](https://github.com/justinlettau/sql-source-control/commit/c7a48ca)), closes [#39](https://github.com/justinlettau/sql-source-control/issues/39)

<a name="1.9.0"></a>

# [1.9.0](https://github.com/justinlettau/sql-source-control/compare/v1.8.0...v1.9.0) (2018-07-07)

### Bug Fixes

- remove column ordering by name ([80fb9d7](https://github.com/justinlettau/sql-source-control/commit/80fb9d7)), closes [#33](https://github.com/justinlettau/sql-source-control/issues/33)
- **pull:** script computed field formula ([2092150](https://github.com/justinlettau/sql-source-control/commit/2092150)), closes [#30](https://github.com/justinlettau/sql-source-control/issues/30)

### Features

- add connection config file support ([#29](https://github.com/justinlettau/sql-source-control/issues/29)) ([ed92901](https://github.com/justinlettau/sql-source-control/commit/ed92901))

<a name="1.8.0"></a>

# [1.8.0](https://github.com/justinlettau/sql-source-control/compare/v1.7.1...v1.8.0) (2018-06-11)

### Bug Fixes

- **deps:** update dependency fs-extra to v6 ([#24](https://github.com/justinlettau/sql-source-control/issues/24)) ([77cdbb1](https://github.com/justinlettau/sql-source-control/commit/77cdbb1))
- **deps:** update dependency inquirer to v6 ([#25](https://github.com/justinlettau/sql-source-control/issues/25)) ([65b047e](https://github.com/justinlettau/sql-source-control/commit/65b047e))

### Features

- add config to exclude output ([9d6a21d](https://github.com/justinlettau/sql-source-control/commit/9d6a21d))
- add data scripting to pull ([#26](https://github.com/justinlettau/sql-source-control/issues/26)) ([d874206](https://github.com/justinlettau/sql-source-control/commit/d874206))

<a name="1.7.1"></a>

## [1.7.1](https://github.com/justinlettau/sql-source-control/compare/v1.7.0...v1.7.1) (2018-04-04)

### Bug Fixes

- **deps:** update dependency fs-extra to ^5.0.0 ([#20](https://github.com/justinlettau/sql-source-control/issues/20)) ([33813b6](https://github.com/justinlettau/sql-source-control/commit/33813b6))
- **deps:** update dependency inquirer to ^5.0.0 ([#21](https://github.com/justinlettau/sql-source-control/issues/21)) ([e61dfff](https://github.com/justinlettau/sql-source-control/commit/e61dfff))
- **pull:** correct table-valued parameters not exists idempotency ([#23](https://github.com/justinlettau/sql-source-control/issues/23)) ([4c1df49](https://github.com/justinlettau/sql-source-control/commit/4c1df49)), closes [#22](https://github.com/justinlettau/sql-source-control/issues/22)
- script indent inconsistencies ([68b20da](https://github.com/justinlettau/sql-source-control/commit/68b20da))

<a name="1.7.0"></a>

# [1.7.0](https://github.com/justinlettau/sql-source-control/compare/v1.6.0...v1.7.0) (2018-02-27)

### Features

- add support for table-valued parameters ([25d4c0d](https://github.com/justinlettau/sql-source-control/commit/25d4c0d))

<a name="1.6.0"></a>

# [1.6.0](https://github.com/justinlettau/sql-source-control/compare/v1.5.0...v1.6.0) (2018-02-04)

### Features

- add push command ([a54bf6f](https://github.com/justinlettau/sql-source-control/commit/a54bf6f))

<a name="1.5.0"></a>

# [1.5.0](https://github.com/justinlettau/sql-source-control/compare/v1.4.0...v1.5.0) (2018-02-02)

### Features

- add update notification ([cbc21c2](https://github.com/justinlettau/sql-source-control/commit/cbc21c2))

<a name="1.4.0"></a>

# [1.4.0](https://github.com/justinlettau/sql-source-control/compare/v1.3.2...v1.4.0) (2018-01-13)

### Features

- add `conns` command ([a53d656](https://github.com/justinlettau/sql-source-control/commit/a53d656))

<a name="1.3.2"></a>

## [1.3.2](https://github.com/justinlettau/sql-source-control/compare/v1.3.1...v1.3.2) (2018-01-13)

### Bug Fixes

- properly handle relative root directory ([#9](https://github.com/justinlettau/sql-source-control/issues/9)) ([a782fd1](https://github.com/justinlettau/sql-source-control/commit/a782fd1))
- remove duplicate schemas ([056d58e](https://github.com/justinlettau/sql-source-control/commit/056d58e))

<a name="1.3.1"></a>

## [1.3.1](https://github.com/justinlettau/sql-source-control/compare/v1.3.0...v1.3.1) (2018-01-11)

### Bug Fixes

- pull inline-table value functions ([#11](https://github.com/justinlettau/sql-source-control/issues/11)) ([dfdbfa6](https://github.com/justinlettau/sql-source-control/commit/dfdbfa6))

<a name="1.3.0"></a>

# [1.3.0](https://github.com/justinlettau/sql-source-control/compare/v1.2.0...v1.3.0) (2017-11-03)

### Bug Fixes

- build error with chalk import ([4c22e4a](https://github.com/justinlettau/sql-source-control/commit/4c22e4a))

### Features

- add schema scripting ([32e75f7](https://github.com/justinlettau/sql-source-control/commit/32e75f7))

<a name="1.2.0"></a>

# [1.2.0](https://github.com/justinlettau/sql-source-control/compare/v1.1.0...v1.2.0) (2017-06-17)

### Features

- add cat command ([ec8e18c](https://github.com/justinlettau/sql-source-control/commit/ec8e18c))

<a name="1.1.0"></a>

# [1.1.0](https://github.com/justinlettau/sql-source-control/compare/v1.0.6...v1.1.0) (2017-06-09)

### Features

- add support for multiple connections ([2319658](https://github.com/justinlettau/sql-source-control/commit/2319658))
