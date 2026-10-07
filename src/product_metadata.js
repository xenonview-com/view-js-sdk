// Names and brands use the same order as the SKU list.
export default class ProductMetadata {
  constructor(skus, productNames, brands) {
    this.skus = skus;
    this.entries = Object.entries({productNames, brands}).filter(ProductMetadata.isProvided);
  }

  static isProvided([, value]) {
    return value != null;
  }

  static skuList(value) {
    if (value == null) return [];
    return ProductMetadata.identifiers(value);
  }

  static identifiers(value) {
    if (Array.isArray(value)) return value;
    return value.toString().split(',').map(item => item.trim());
  }

  static names(value) {
    if (Array.isArray(value)) return value;
    return [value];
  }

  entry([field, value]) {
    const values = ProductMetadata.names(value);
    if (values.length !== ProductMetadata.skuList(this.skus).length) {
      throw new RangeError(`${field} must have one entry per SKU`);
    }
    return [field, values];
  }

  values() {
    return Object.fromEntries(this.entries.map(entry => this.entry(entry)));
  }

  withSkus() {
    const values = this.values();
    if (!this.entries.length) return values;
    return {...values, skus: ProductMetadata.skuList(this.skus)};
  }
}
