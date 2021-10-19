export function storeLocal(name, objectToStore) {
  localStorage.setItem(name, JSON.stringify(objectToStore));
}

export function retrieveLocal(name) {
  let objectToRetrieve = JSON.parse(localStorage.getItem(name));
  return objectToRetrieve;
}

export function resetLocal(name) {
  localStorage.removeItem(name);
}

export function storeSession(name, objectToStore) {
  sessionStorage.setItem(name, JSON.stringify(objectToStore));
}

export function retrieveSession(name) {
  let objectToRetrieve = JSON.parse(sessionStorage.getItem(name));
  return objectToRetrieve;
}

export function resetSession(name) {
  sessionStorage.removeItem(name);
}
