import {fetch as fetchPolyfill} from 'whatwg-fetch';

let isomorphicFetch;
const nativeGlobalFetch = global.fetch;
const nativeWindowFetch = window.fetch;

export function install() {
  if (!isomorphicFetch) {
    global.fetch = null;
    window.fetch = null;
    isomorphicFetch = fetchPolyfill;
  }
  global.fetch = isomorphicFetch;
  window.fetch = isomorphicFetch;
}

export function uninstall() {
  global.fetch = nativeGlobalFetch;
  window.fetch = nativeWindowFetch;
}