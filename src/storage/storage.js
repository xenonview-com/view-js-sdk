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
  if (typeof global.api != 'undefined' && global.api !== undefined && global.api && global.api &&
    typeof global.api.browser != 'undefined' && global.api.browser !== undefined && global.api.browser && global.api.browser.localStorage)
      return global.api.browser.localStorage;
  return _localStorage;
}
function getSessionStorage(){
  if (typeof window != 'undefined' && window !== undefined && window && window.sessionStorage) return window.sessionStorage;
  if (typeof global.api != 'undefined' && global.api !== undefined && global.api && global.api &&
    typeof global.api.browser != 'undefined' && global.api.browser !== undefined && global.api.browser && global.api.browser.sessionStorage)
      return global.api.browser.sessionStorage;
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
