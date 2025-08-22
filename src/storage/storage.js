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

function getLocalStorage(){
  if (typeof window != 'undefined' && window !== undefined && window && window.localStorage) return window.localStorage;
  const browser_ = typeof self != 'undefined' && self.browser ? self.browser : null;
  if (typeof browser_ != 'undefined' && browser_ !== undefined && browser_ && browser_.localStorage)
      return new ShopifyStorage(browser_.localStorage);
  return _localStorage;
}
function getSessionStorage(){
  if (typeof window != 'undefined' && window !== undefined && window && window.sessionStorage) return window.sessionStorage;
  const browser_ = typeof self != 'undefined' && self.browser ? self.browser : null;
  if (typeof browser_ != 'undefined' && browser_ !== undefined && browser_ && browser_.sessionStorage)
    return new ShopifyStorage(browser_.sessionStorage);
  return _sessionStorage;
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
