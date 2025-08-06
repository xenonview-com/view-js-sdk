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
  const api_ = global && global.api ? global.api : api;
  if (typeof api_ != 'undefined' && api_ !== undefined && api_ && api_ &&
    typeof api_.browser != 'undefined' && api_.browser !== undefined && api_.browser && api_.browser.localStorage)
      return api_.browser.localStorage;
  return _localStorage;
}
function getSessionStorage(){
  if (typeof window != 'undefined' && window !== undefined && window && window.sessionStorage) return window.sessionStorage;
  const api_ = global && global.api ? global.api : api;
  if (typeof api_ != 'undefined' && api_ !== undefined && api_ && api_ &&
    typeof api_.browser != 'undefined' && api_.browser !== undefined && api_.browser && api_.browser.sessionStorage)
      return api_.browser.sessionStorage;
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
