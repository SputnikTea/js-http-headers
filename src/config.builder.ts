/* eslint-disable @typescript-eslint/no-explicit-any */
import { bind, deepMerge } from './util.js';

/* eslint-disable prettier/prettier */
// Prettier makes conditional types hard to read.


// Forces a type to be defined
type Defined<T> = T extends undefined ? never : T;

// Helper Type to define a deep record
type RRecord<T> =
  | T
  | {
      [key: string | number | symbol]: RRecord<T> | T;
    };

type Primitive = undefined | null | boolean | string | number;

// Deeply make all fields optional
type DeepOptional<T> =
  T extends Primitive | any[] ? T // If primitive or array then return type
  : {[P in keyof T]?: DeepOptional<T[P]>} // Make this key optional and recurse

// Deeply map all fields to a certain type
type DeepMapToType<T, TargetType> = 
  T extends Primitive | any[] ? TargetType
  : {[K in keyof T]?: DeepMapToType<T[K], TargetType>}

// Recursively map all fields which exist in IsDefined to the defined type of base
type DefineKeysOfBase<
  Base,
  IsDefined,
> = IsDefined extends Primitive  
      ? Defined<Base> // If the key from defined is a primitive then return the type of base as defined
      :{
        [Key in keyof IsDefined]: // Foreach key
          Key extends keyof Defined<Base> // If the key exists in base (defined is required because of keyof for some reason)
            ? DefineKeysOfBase<Defined<Base>[Key], IsDefined[Key]>  // recurse
            : never // Key did not exist in base
      };

// Create a nested key union of the form "a" | "a.b" | "a.b.c" from a object
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: 
    Defined<TObj[TKey]> extends any[]
      ? `${TKey}` // do not recurse arrays
      : Defined<TObj[TKey]> extends object
        ? `${TKey}` | `${TKey}.${RecursiveKeyOf<Defined<TObj[TKey]>>}` // if is object then allow all subkeys to be used
        : `${TKey}`; // if not an object then just allow the current key to be used
}[keyof TObj & (string | number)];

// Get the type of a value at a given path
type PathValue<Obj, Path extends string> = 
  Path extends `${infer Key}.${infer Rest}` 
    ? Key extends keyof Obj 
      ? PathValue<Obj[Key], Rest> 
      : never 
    : Path extends keyof Obj 
      ? Obj[Path] 
      : never;
      
/* eslint-enable prettier/prettier */

export class ConfigException extends Error {
  constructor(message: string) {
    super('ConfigException : ' + message);
    this.name = 'ConfigException';
  }
}

class AppliedConfigBuilder<ConfigScheme extends {}> {
  private readonly config: ConfigScheme = {} as any;

  /**
   * Creates the final Configuration object
   * @returns The config object with the require and get functions attached.
   */
  buildConfig() {
    return {
      ...this.config,
      require: bind(this, this.require),
      get: bind(this, this.get),
    };
  }

  /**
   * Gets a config value at given path
   * @param path The path to the config value e.g. "database.host"
   * @param dynamic allow this to be used with dynamic paths (e.g. in function calls)
   * @returns the config at given path
   * @note the dynamic param is only used to differentiate the function signature and has no actual effect.
   */
  get<Path extends RecursiveKeyOf<ConfigScheme>>(
    path: Path,
  ): PathValue<ConfigScheme, Path>;
  get<Type = unknown>(path: String, dynamic: true): Type | undefined;
  get(path: String): unknown {
    let cfgRef = this.config;
    for (const p of path.split('.')) {
      if (typeof cfgRef !== 'object') return undefined as any;
      cfgRef = cfgRef[p];
      if (cfgRef === undefined) return undefined as any;
    }
    return cfgRef as any;
  }

  /**
   * Merges the given config into this config, extending the config scheme.
   * @param applyConfig The static config to merge into this config
   * @returns the builder with the merged config type
   */
  applyStaticConfig<StaticScheme extends DeepOptional<ConfigScheme>>(
    applyConfig: StaticScheme,
  ): AppliedConfigBuilder<
    ConfigScheme & DefineKeysOfBase<ConfigScheme, StaticScheme>
  > {
    deepMerge(this.config, applyConfig);
    return this as any;
  }

  /**
   * Merges the given config into this config without changing the config type
   * @param applyConfig The config to merge into this config
   * @returns the builder with the config type untouched
   */
  applyDynamicConfig<StaticScheme extends Partial<ConfigScheme>>(
    applyConfig: StaticScheme,
  ) {
    deepMerge(this.config, applyConfig);
    return this;
  }

  /**
   * Loads all environment variables starting with the given prefix into the config.
   * Will try to parse the value as JSON if possible.
   * @param env the process.env object
   * @param prefix the prefix to check for e.g. 'MY_APP_' would match MY_APP_DB_PORT and be loaded into the field db.port
   * @param seperator the seperator to use for the config path e.g. '-' would split DB-PORT into the field db.port
   * @param parseAsJson will try to parse the every value as JSON, if it fails it will be loaded as string default = true
   * @returns this
   */
  loadEnv(
    env: Record<string, string | undefined>,
    prefix: string,
    seperator: string,
    parseAsJson = true,
  ): this {
    for (const fullkey of Object.keys(env)) {
      if (!fullkey.startsWith(prefix)) continue;

      const key = fullkey.replace(prefix, '');
      const cfgPath = key.split(seperator);
      let cfgRef = this.config;

      for (let index = 0; index < cfgPath.length - 1; index++) {
        const key = cfgPath[index];
        cfgRef = cfgRef[key] ?? (cfgRef[key] = {});
      }

      const lastKey = cfgPath.at(-1) as string;
      if (parseAsJson) {
        try {
          cfgRef[lastKey] = JSON.parse(env[fullkey] as string);
        } catch {
          cfgRef[lastKey] = env[fullkey];
        }
      } else {
        cfgRef[lastKey] = env[fullkey];
      }
    }

    return this;
  }

  /**
   * Requires certain keys to be defined in the config.
   *
   * @throws {ConfigException} when any required key is undefined
   * @param requiredFields The fields to check for e.g. {database: {host: true, port: true}} would check for database.host and database.port to be defined
   * @returns this config with the required fields typed as defined
   */
  require<Required extends DeepMapToType<ConfigScheme, true>>(
    requiredFields: Required,
  ): ConfigScheme & DefineKeysOfBase<ConfigScheme, Required> {
    const checkRequired = (
      requiredFields: RRecord<true>,
      testObject: RRecord<Number | String | Boolean | undefined>,
      configPath: string[],
    ): void => {
      if (testObject === undefined)
        throw new ConfigException(
          `The config key "${configPath.join('.')}" is required!`,
        );

      if (typeof requiredFields === 'object') {
        if (typeof testObject !== 'object')
          throw new ConfigException(
            `The config key "${configPath.join(
              '.',
            )}" is expected to have sub keys!`,
          );
        for (const [key, val] of Object.entries(requiredFields)) {
          checkRequired(val, testObject[key], [...configPath, key]);
        }
      }
    };

    checkRequired(requiredFields, this.config, []);
    return this.config as ConfigScheme &
      DefineKeysOfBase<ConfigScheme, Required>;
  }
}

export class ConfigBuilder<
  ConfigScheme extends {},
> extends AppliedConfigBuilder<DeepOptional<ConfigScheme>> {}
