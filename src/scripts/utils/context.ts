import { dispatch } from "./events.ts";

type PlainObject = Record<PropertyKey, unknown>;

type Context = PlainObject;
type Contexts = Map<string, Context>;
type ContextParserResult = {
  context: string;
  propertyKey: string;
  searchKey?: string;
  searchIndex?: string;
  index?: string;
  targetKey?: string;
};

class ContextRedefinitionError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}

class ContextObjectError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}

class ContextPathError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}

const reContextParser =
  /^(?<context>\w+)(?:\.(?<propertyKey>\w+))?(\[(?:(?<searchKey>\w+)\:(?<searchIndex>[\w-]+)|(?<index>\d+))\])?(?:\.(?<targetKey>\w+))?$/i;

const CustomEvents = {
  CONTEXT_CHANGE: "context:change",
} as const;

const contexts: Contexts = new Map<string, Context>();

function isPlainObject(value: unknown): value is PlainObject {
  return value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Creates a new context.
 * @param ctxName the name to assign to the new context
 * @param initObject an object to use as initial context
 * @throws ContextRedefinitionError
 * @throws ContextObjectError
 */
function create(ctxName: string, initObject: Context = {}) {
  if (contexts.has(ctxName.trim())) throw new ContextRedefinitionError("redifinition of a context is not allowed.");
  if (typeof initObject !== "object") {
    throw new ContextObjectError("only empty or pre-initialized objects are allowed to be used as context.");
  }
  contexts.set(ctxName.trim(), initObject);
}

/**
 * Retrieves the content from a context's property.
 * @param ctxName full context path to retrieve
 * @returns the value stored into the property key or undefined
 */
function get(ctxName: string): unknown | undefined {
  const { context, propertyKey, index } = reContextParser.exec(ctxName.trim())?.groups as ContextParserResult;

  // Context, propertyKey, and index
  // Ex. "context.property[index]"
  if (context && propertyKey && index) {
    if (
      contexts.has(context) &&
      Object.hasOwn(contexts.get(context)!, propertyKey) &&
      Array.isArray(contexts.get(context)![propertyKey])
    ) {
      return (contexts.get(context)![propertyKey] as Array<unknown>)![parseInt(index)];
    }
  }

  // Context and propertyKey
  // Ex. "context.propertyKey"
  if (context && propertyKey) {
    if (contexts.has(context) && Object.hasOwn(contexts.get(context)!, propertyKey)) {
      return contexts.get(context)![propertyKey];
    }
  }

  // Context only
  // Ex. "context"
  if (contexts.has(context)) return contexts.get(context);

  return;
}

/**
 * Set the value of a context path.
 * @param ctxName full context path to be set
 * @param value the value to assign to the specified context path
 * @fires `context:change` event `{ detail: {context, propertyKey, searchKey?, searchIndex?, targetKey?, oldValue} }`
 * @throws ContextPathError
 */
function set<T>(ctxName: string, value: T) {
  const { context, propertyKey, searchKey, searchIndex, index, targetKey } = reContextParser.exec(ctxName.trim())
    ?.groups as ContextParserResult;

  // undefined or context only
  if (!context || !propertyKey) {
    throw new ContextPathError("the minimum requirements are a context and property names.");
  }

  // context, propertyKey, searchKey, searchIndex, and targetKey
  // Ex. "context.propertyKey[searchKey:searchIndex].targetKey"
  if (context && propertyKey && searchKey && searchIndex && targetKey) {
    if (
      contexts.has(context) &&
      Object.hasOwn(contexts.get(context)!, propertyKey)
    ) {
      for (const item of contexts.get(context)![propertyKey] as PlainObject[]) {
        if (Object.hasOwn(item, searchKey)) {
          if (item[searchKey] === searchIndex) {
            if (item[targetKey] !== value) {
              const oldValue = item[targetKey];
              item[targetKey] = value;
              dispatch(null, CustomEvents.CONTEXT_CHANGE, {
                context,
                propertyKey,
                searchKey,
                searchIndex,
                targetKey,
                oldValue,
              });
              return;
            }
          }
        }
      }
    }
  }

  // context, propertyKey, index, and targetKey
  // Ex. "context.propertyKey[index].targetKey"
  if (context && propertyKey && index && targetKey) {
    if (
      contexts.has(context) &&
      Object.hasOwn(contexts.get(context)!, propertyKey) &&
      Array.isArray(contexts.get(context)![propertyKey]) &&
      isPlainObject((contexts.get(context)![propertyKey] as PlainObject[])![parseInt(index)]) &&
      Object.hasOwn((contexts.get(context)![propertyKey] as PlainObject[])![parseInt(index)], targetKey)
    ) {
      if ((contexts.get(context)![propertyKey] as PlainObject[])![parseInt(index)][targetKey] !== value) {
        const oldValue = (contexts.get(context)![propertyKey] as PlainObject[])![parseInt(index)][targetKey];
        (contexts.get(context)![propertyKey] as PlainObject[])![parseInt(index)][targetKey] = value;
        dispatch(null, CustomEvents.CONTEXT_CHANGE, {
          context,
          propertyKey,
          index: parseInt(index),
          targetKey,
          oldValue,
        });
        return;
      }
    }
  }

  // context, propertyKey, and index
  // Ex. "context.propertyKey[index]"
  if (context && propertyKey && index) {
    if (
      contexts.has(context) &&
      Object.hasOwn(contexts.get(context)!, propertyKey) &&
      Array.isArray(contexts.get(context)![propertyKey]) &&
      parseInt(index) < (contexts.get(context)![propertyKey] as Array<T>).length
    ) {
      if ((contexts.get(context)![propertyKey] as Array<T>)![parseInt(index)] !== value) {
        const oldValue = (contexts.get(context)![propertyKey] as Array<T>)![parseInt(index)];
        (contexts.get(context)![propertyKey] as Array<T>)![parseInt(index)] = value;
        dispatch(null, CustomEvents.CONTEXT_CHANGE, { context, propertyKey, index: parseInt(index), oldValue });
        return;
      }
    }
  }

  // context, propertyKey, and targetKey only
  // Ex. "context.propertyKey.targetKey"
  if (context && propertyKey && targetKey) {
    if (
      contexts.has(context) &&
      Object.hasOwn(contexts.get(context)!, propertyKey) &&
      isPlainObject(contexts.get(context)![propertyKey]) &&
      Object.hasOwn(contexts.get(context)![propertyKey]!, targetKey)
    ) {
      if ((contexts.get(context)![propertyKey] as PlainObject)[targetKey] !== value) {
        const oldValue = (contexts.get(context)![propertyKey] as PlainObject)[targetKey];
        (contexts.get(context)![propertyKey] as PlainObject)[targetKey] = value;
        dispatch(null, CustomEvents.CONTEXT_CHANGE, { context, propertyKey, targetKey, oldValue });
        return;
      }
    }
  }

  // context and propertyKey only
  // Ex. "context.propertyKey"
  if (context && propertyKey) {
    if (contexts.get(context)![propertyKey] !== value) {
      const oldValue = contexts.get(context)![propertyKey];
      contexts.get(context)![propertyKey] = value;
      dispatch(null, CustomEvents.CONTEXT_CHANGE, { context, propertyKey, oldValue });
      return;
    }
  }
}

/**
 * Parses the context path and returns each segment or `null`
 * @param ctxName full context path to parse
 * @returns `ContextParserResult` | `null`
 */
function parse(ctxName: string): ContextParserResult | null {
  return reContextParser.exec(ctxName)?.groups as ContextParserResult;
}

export { type Context, type ContextParserResult, CustomEvents };

export default {
  ContextObjectError,
  ContextPathError,
  ContextRedefinitionError,
  create,
  get,
  set,
  parse,
};
