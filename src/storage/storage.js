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
function getLocalStorage(){
  if (typeof window != 'undefined' && window !== undefined && window && window.localStorage) return window.localStorage;
  const browser_ = typeof self != 'undefined' && self.browser ? self.browser : null;
  if (typeof browser_ != 'undefined' && browser_ !== undefined && browser_ && browser_.localStorage)
      return browser_.localStorage;
  return _localStorage;
}
function getSessionStorage(){
  if (typeof window != 'undefined' && window !== undefined && window && window.sessionStorage) return window.sessionStorage;
  const browser_ = typeof self != 'undefined' && self.browser ? self.browser : null;
  if (typeof browser_ != 'undefined' && browser_ !== undefined && browser_ && browser_.sessionStorage)
    return browser_.sessionStorage;
  return _sessionStorage;
}

export function storeLocal(name, objectToStore) {
  getLocalStorage().setItem(name, JSON.stringify(objectToStore));
}

export function retrieveLocal(name) {
  const value = getLocalStorage().getItem(name);
  return (value) ? JSON.parse(value) : null;
}

export function resetLocal(name) {
  getLocalStorage().removeItem(name);
}

export function storeSession(name, objectToStore) {
  getSessionStorage().setItem(name, JSON.stringify(objectToStore));
}

export function retrieveSession(name) {
  const value = getSessionStorage().getItem(name);
  return (value) ? JSON.parse(value) : null;
}

export function resetSession(name) {
  getSessionStorage().removeItem(name);
}
