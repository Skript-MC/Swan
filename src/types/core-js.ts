export {};

declare global {
  // Define the new core-js collection-methods polyfill
  interface Set<T> {
    addAll(...values: T[]): this;
  }
}
