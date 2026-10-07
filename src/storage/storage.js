const _defaultSessionStorage = {};
const _sessionStorage = {
  setItem: (key, value) => _defaultSessionStorage[key] = value,
  getItem: (key) => _defaultSessionStorage[key],
  removeItem: (key) => delete _defaultSessionStorage[key],
};

const _defaultLocalStorage = {};
const _localStorage = {
  setItem: (key, value) => _defaultLocalStorage[key] = value,
  getItem: (key) => _defaultLocalStorage[key],
  removeItem: (key) => delete _defaultLocalStorage[key],
};

class ShopifyStorage{
  constructor(underlying) {
    this._underlying = underlying;
  }
  async setItem(key, value){
    await this._underlying.setItem(key, value);
  }
  async getItem(key){
    return await this._underlying.getItem(key);
  }
  async removeItem(key){
    await this._underlying.removeItem(key);
  }
}

export class StorageProvider {
  static browser(environment) {
    if (typeof environment === 'undefined') return null;
    return environment;
  }

  static shopify(environment) {
    if (typeof environment === 'undefined') return null;
    return environment.browser;
  }

  static browserStorage(name, browser = StorageProvider.browser(globalThis.window)) {
    if (!browser) return null;
    return browser[name];
  }

  static shopifyStorage(name) {
    const browser = StorageProvider.shopify(globalThis.self);
    if (!browser) return null;
    return browser[name];
  }

  static get(name, fallback) {
    const browser = StorageProvider.browserStorage(name);
    if (browser) return browser;
    return StorageProvider.wrapShopify(name, fallback);
  }

  static wrapShopify(name, fallback) {
    const shopify = StorageProvider.shopifyStorage(name);
    if (shopify) return new ShopifyStorage(shopify);
    return fallback;
  }
}

function getLocalStorage() {
  return StorageProvider.get('localStorage', _localStorage);
}

function getSessionStorage() {
  return StorageProvider.get('sessionStorage', _sessionStorage);
}

export async function storeLocal(name, objectToStore) {
  const ls = getLocalStorage();
  await ls.setItem(name, JSON.stringify(objectToStore));
}

export async function retrieveLocal(name) {
  const ls = getLocalStorage();
  const value = await ls.getItem(name);
  return (value) ? JSON.parse(value) : null;
}

export async function resetLocal(name) {
  const ls = getLocalStorage();
  await ls.removeItem(name);
}

export async function storeSession(name, objectToStore) {
  const ss = getSessionStorage();
  await ss.setItem(name, JSON.stringify(objectToStore));
}

export async function retrieveSession(name) {
  const ss = getSessionStorage();
  const value = await ss.getItem(name);
  return (value) ? JSON.parse(value) : null;
}

export async function resetSession(name) {
  const ss = getSessionStorage();
  await ss.removeItem(name);
}
