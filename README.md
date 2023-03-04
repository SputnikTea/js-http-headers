# TypedConf - Your config, perfectly typed

[ts-badge]: https://img.shields.io/badge/TypeScript-4.9-blue.svg
[typescript]: https://www.typescriptlang.org/
[typescript-4-9]: https://devblogs.microsoft.com/typescript/announcing-typescript-4-9/
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg


[license]: https://github.com/Aderinom/typedconf/blob/master/LICENSE

[gha-badge]: https://github.com/Aderinom/typedconf/actions/workflows/CI.yml/badge.svg
[gha-ci]: https://github.com/Aderinom/typedconf/actions/workflows/CI.yml
[ql-badge]: https://github.com/Aderinom/typedconf/actions/workflows/github-code-scanning/codeql/badge.svg
[ql-ci]: https://github.com/Aderinom/typedconf/actions/workflows/github-code-scanning
[snyk-bagdge]:https://snyk.io/test/github/Aderinom/typedconf/badge.svg


[![TypeScript version][ts-badge]][typescript-4-9]
[![LICENSE][license-badge]][license]
[![Build Status - GitHub Actions][gha-badge]][gha-ci]
[![Build Status - GitHub Actions][ql-badge]][ql-ci]
[![Known Vulnerabilities][snyk-bagdge]](https://snyk.io/test/github/Aderinom/typedconf)\
<a href="https://codeclimate.com/github/Aderinom/typedconf/maintainability"><img src="https://api.codeclimate.com/v1/badges/4eb0f4f2713a27c529c5/maintainability" /></a>
<a href="https://codeclimate.com/github/Aderinom/typedconf/test_coverage"><img src="https://api.codeclimate.com/v1/badges/4eb0f4f2713a27c529c5/test_coverage" /></a>
[![Foresight Docs](https://api-public.service.runforesight.com/api/v1/badge/success?repoId=1cc52369-48e8-4095-952c-7d4ee69b6f4c)](https://docs.runforesight.com/)


Fully Typed Configuration for your Typescript project.

Just access your configuration keys like you would any other object in your code, typechecking included!

Hello : 
```typescript
const db  = cfg.easy.key.access.db; //{host:string..}
const maybe = cfg.safe.undefined?.access // string | undefined
```
Goodbye :
```typescript
const dbHost : string = cfg.get("key.which.might.have.been.renamed.host")
const dbPort : number = cfg.get("key.which.might.have.been.renamed.port")
const dbDatabase : string = cfg.get("key.which.might.have.been.renamed.db")
const dbSchema : string = cfg.get("key.which.might.have.been.renamed.schema")
const key : number = cfg.get("key.uuuh.....")
const other : string = cfg.get("key.oh.no.typo")
```
Result:

✔️ Always know all keys which are safe to access \
✔️ Always know when a key has been removed or renamed \
✔️ Always know what config keys exist

## Getting Started
```shell
npm install tconf
```

### Example

```typescript
import { ConfigBuilder } from 'typedconf';

interface ConfigSchema {
  database: {
    host: string;
    port: number;
    schemas: string[];
    enabled: boolean;
  };
  api: {
    host: string;
    port: number;
  };
}

export const cfg = new ConfigBuilder<ConfigSchema>()
  // Apply a default config
  .applyStaticConfig({
    database: {
      host: 'localhost',
      port: 5432,
      schemas: ['public'],
      enabled: true,
    },
  })
  // Load environment variables
  .loadEnv(env, 'MY_APP_', '_')
  .buildConfig();

// Now our typechecker knows all fields that might be undefined and ensures that they are handled properly.
cfg.database.host; // defined
cfg.api?.port; // possibly undefined

// We can use the `require` method to ensure that required fields are defined and throw an error if they are not.
const checkedcfg = cfg.require({
  api: {
    port: true,
    host: true,
  },
});

checkedcfg.api.port; // now defined

// Even dynamic config access is typechecked
cfg.get('database.enabled'); // Defined Boolean

//cfg.get('database.something'); // Type Error - "database.something" does not extend config type.
cfg.get<bool>('database.something', true); // bool | undefined - Allows accessing paths dynamically in e.g. functions
```

more examples can be found in the `examples` directory

### Modules

This Project uses microbundle to generate ESM, CJS and UMD modules and should work in browser and node environments

## License

Licensed under the MIT. See the [LICENSE](https://github.com/Aderinom/tconf/blob/master/LICENSE) file for details.
