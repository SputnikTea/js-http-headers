import { deepMerge } from '../src/util.js';

describe('deepMerge', () => {
  test('should merge two primitive values', () => {
    expect(deepMerge(1, 2)).toBe(2);
    expect(deepMerge('hello', 'world')).toBe('world');
  });

  test('should merge two objects with nested properties', () => {
    const into = {
      foo: {
        bar: 1,
        baz: 'hello',
      },
      qux: [2, 3],
    };
    const from = {
      foo: {
        bar: 2,
        quux: 'world',
      },
      qux: [4, 5],
    };
    const expected = {
      foo: {
        bar: 2,
        baz: 'hello',
        quux: 'world',
      },
      qux: [4, 5],
    };
    expect(deepMerge(into, from)).toEqual(expected);
  });

  test('should merge two objects with overlapping properties', () => {
    const into = {
      foo: {
        bar: 1,
        baz: 'hello',
      },
      qux: [2, 3],
    };
    const from = {
      foo: {
        bar: 2,
        qux: 'world',
      },
      qux: [4, 5],
    };
    const expected = {
      foo: {
        bar: 2,
        baz: 'hello',
        qux: 'world',
      },
      qux: [4, 5],
    };
    expect(deepMerge(into, from)).toEqual(expected);
  });

  test('should handle null and undefined values', () => {
    const into = {
      foo: {
        bar: null,
        baz: undefined,
      },
      qux: null,
    };
    const from = {
      foo: {
        bar: 2,
        qux: 'world',
      },
      quux: undefined,
    };
    const expected = {
      foo: {
        bar: 2,
        baz: undefined,
        qux: 'world',
      },
      qux: null,
      quux: undefined,
    };
    expect(deepMerge(into, from)).toEqual(expected);
  });

  test('should return the second argument when merging a primitive and an object', () => {
    expect(deepMerge(1, { foo: 'bar' })).toEqual({ foo: 'bar' });
    expect(deepMerge('hello', { foo: 'bar' })).toEqual({ foo: 'bar' });
  });

  test('should merge an array into an object', () => {
    const into = {
      foo: {
        bar: 1,
        baz: [2, 3],
      },
    };
    const from = {
      foo: {
        baz: [4, 5],
        qux: 'hello',
      },
    };
    const expected = {
      foo: {
        bar: 1,
        baz: [4, 5],
        qux: 'hello',
      },
    };
    expect(deepMerge(into, from)).toEqual(expected);
  });

  test('should merge an object into an array', () => {
    const into = [1, 2];
    const from = {
      1: 'hello',
      2: 'world',
    };
    const expected = [1, 'hello', 'world'];
    expect(deepMerge(into, from)).toEqual(expected);
  });

  test('should merge a nested array into an array', () => {
    const into = [1, [2, 3]];
    const from = {
      1: ['hello', 'world'],
    };
    const expected = [1, ['hello', 'world']];
    expect(deepMerge(into, from)).toEqual(expected);
  });
});
