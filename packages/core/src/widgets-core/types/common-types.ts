/**
 * Common type definitions with proper typing
 */

// Simple type aliases to avoid any warnings
export type ConfigObject = Record<string, unknown>;
export type FieldValue = unknown;
export type ConfigValue = unknown;
export type EventDetail = Record<string, unknown>;
export type FactoryFunction<T = object> = () => T;
export type ConstructorArgs = (string | number | boolean | object)[];