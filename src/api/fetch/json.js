import 'isomorphic-fetch';

async function checkStatus(response) {
  if (response.status >= 200 && response.status < 400) {
    return response;
  }
  if (response.status >= 400 && response.status < 500) {
    const details = await response.json();
    const error = new Error(details.error_message);
    error.response = response;
    error.details = details;
    error.authIssue = true;
    return Promise.reject(error);
  }
  const error = new Error(response.statusText);
  error.response = response;
  return Promise.reject(error);
}

export function fetchJson(url, {accessToken, headers, ...options} = {}) {
  const acceptHeaders = {accept: 'application/json'};
  const authorizationHeaders = accessToken ? {authorization: `Bearer ${accessToken}`} : {};
  options = {credentials: 'same-origin', headers: {...acceptHeaders, ...authorizationHeaders, ...headers}, ...options};
  return fetch(url, options)
    .then(checkStatus)
    .then((response) => {
      return [204, 304].includes(response.status) ? {} : response.json();
    })
    .catch((error) =>{
      if (error instanceof TypeError) {
        const newError = new Error('Your internet connection appears to have gone down.');
        newError.noNet = true;
        return Promise.reject(newError);
      }
      return Promise.reject(error);
    });
}