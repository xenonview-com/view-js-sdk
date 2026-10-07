import 'isomorphic-fetch';

class ResponseStatus {
  static successful(response) {
    return [response.status >= 200, response.status < 400].every(Boolean);
  }

  static clientError(response) {
    return [response.status >= 400, response.status < 500].every(Boolean);
  }

  static async check(response) {
    if (ResponseStatus.successful(response)) return response;
    return ResponseStatus.reject(response);
  }

  static async reject(response) {
    if (ResponseStatus.clientError(response)) return ResponseStatus.rejectClient(response);
    const error = new Error(response.statusText);
    error.response = response;
    return Promise.reject(error);
  }

  static async rejectClient(response) {
    const details = await response.json();
    const error = new Error(details.error_message);
    error.response = response;
    error.details = details;
    error.authIssue = true;
    return Promise.reject(error);
  }
}

export function fetchJson(url, {accessToken, headers, ...options} = {}) {
  const acceptHeaders = {accept: 'application/json'};
  const authorizationHeaders = accessToken ? {authorization: `Bearer ${accessToken}`} : {};
  options = {credentials: 'same-origin', keepalive: true, headers:
        {...acceptHeaders, ...authorizationHeaders, ...headers}, ...options};
  return fetch(url, options)
    .then(ResponseStatus.check)
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