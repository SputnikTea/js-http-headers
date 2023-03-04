import { ConfigBuilder, ConfigException } from '../src/config.builder.js';

describe('AppliedConfigBuilder', () => {
  let builder: ConfigBuilder<{ a: number; b: { c: string } }>;

  beforeEach(() => {
    builder = new ConfigBuilder<{ a: number; b: { c: string } }>();
  });

  describe('applyStaticConfig', () => {
    it('should merge the applied config', () => {
      const result = builder
        .applyStaticConfig({ b: { c: 'test' } })
        .buildConfig();
      expect(result).toEqual({
        a: undefined,
        b: { c: 'test' },
        require: expect.any(Function),
        get: expect.any(Function),
      });
    });
  });

  describe('applyDynamicConfig', () => {
    it('should merge the applied config', () => {
      const result = builder
        .applyDynamicConfig({ b: { c: 'test' } })
        .buildConfig();
      expect(result).toEqual({
        a: undefined,
        b: { c: 'test' },
        require: expect.any(Function),
        get: expect.any(Function),
      });
    });
  });

  describe('loadEnv', () => {
    it('should load environment variables starting with the prefix into the config and ignore anything else', () => {
      const env = { MY_APP_a: '1', 'MY_APP_b-c': '2', Randomstuff: 'dwadwa' };
      const result = builder.loadEnv(env, 'MY_APP_', '-').buildConfig();
      expect(result).toEqual({
        a: 1,
        b: { c: 2 },
        require: expect.any(Function),
        get: expect.any(Function),
      });
    });

    it('should load environment variables as string when parse json is disabled', () => {
      const env = {
        MY_APP_a: '1',
        'MY_APP_b-c': '{{test',
        Randomstuff: 'dwadwa',
      };
      const result = builder.loadEnv(env, 'MY_APP_', '-', false).buildConfig();
      expect(result).toEqual({
        a: '1',
        b: { c: '{{test' },
        require: expect.any(Function),
        get: expect.any(Function),
      });
    });
  });

  describe('require', () => {
    it('should throw ConfigException when a required field is undefined', () => {
      expect(() => builder.buildConfig().require({ a: true })).toThrow(
        new ConfigException(`The config key "a" is required!`),
      );
    });

    it('should throw ConfigException when a field with sub fiels is not an object', () => {
      expect(() =>
        builder
          .applyStaticConfig({ b: 1 } as any)
          .buildConfig()
          .require({ b: { c: true } }),
      ).toThrow(
        new ConfigException(`The config key "b" is expected to have sub keys!`),
      );
    });
  });

  describe('get', () => {
    it('should return the config value at the specified path', () => {
      const result = builder
        .applyDynamicConfig({ a: 1, b: { c: 'test' } })
        .get('a');
      expect(result).toEqual(1);
    });

    it('should return the config value at the specified nested path', () => {
      const result = builder
        .applyDynamicConfig({ a: 1, b: { c: 'test' } })
        .get('b.c');
      expect(result).toEqual('test');
    });

    it('should return undefined if the config value at the specified path is not defined', () => {
      const result = builder
        .applyDynamicConfig({ a: 1, b: { c: 'test' } })
        .get<string>('b.d', true);
      expect(result).toBeUndefined();
    });
  });
});
