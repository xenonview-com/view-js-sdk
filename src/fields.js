export default class Fields {
  static truthy(values) {
    return Object.fromEntries(Object.entries(values).filter(([, value]) => Boolean(value)));
  }

  static fallback(value, fallback) {
    return value ? value : fallback;
  }

  static nullable(value, fallback) {
    return value == null ? fallback : value;
  }

  static all(predicates) {
    return predicates.every(predicate => predicate());
  }

  static any(predicates) {
    return predicates.some(predicate => predicate());
  }
}
