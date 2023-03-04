export type Primitive = number | string | boolean | undefined | null;

/**
 * Deeply merges two objects. If a field is defined in both objects, the value of the from object will be used.
 * @param into Object to merge into, will be modified
 * @param from Object to merge from
 */
export function deepMerge<T, D extends Primitive>(into: T, from: D): D;
export function deepMerge<T extends Primitive, D extends Object>(
  into: T,
  from: D,
): D;
export function deepMerge<T extends Object, D extends Object>(
  into: T,
  from: D,
): T & D;
export function deepMerge<T, D>(into: T, from: D): (T & D) | D {
  const mergeRecurse = (
    into: Object | Primitive,
    from: Object | Primitive,
    intoParent: Object,
    intoKey: string,
  ): void => {
    if (
      typeof into !== 'object' ||
      into === null ||
      typeof from !== 'object' ||
      from === null
    )
      return (intoParent[intoKey] = from) as void;

    for (const [key, value] of Object.entries(from)) {
      mergeRecurse(into[key], value, into, key);
    }
  };

  if (
    typeof into !== 'object' ||
    into === null ||
    typeof from !== 'object' ||
    from === null
  )
    return from;

  for (const [key, value] of Object.entries(from)) {
    mergeRecurse(into[key], value, into, key);
  }

  return into as T & D;
}

/**
 * Binds a this context to a function. Helper to keep the correct type.
 * @param this
 * @param fn
 * @returns bound functions
 */
export function bind<T extends Function>(thisType: any, fn: T): T {
  return fn.bind(thisType);
}
