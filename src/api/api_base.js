import {fetchJson} from './fetch/json';
import Fields from '../fields';

const apiHost = 'app.xenonview.com';
const apiUrl_ = `https://${apiHost}`;


class ApiBase {
  constructor(props = {}) {
    const {name, method, headers, url: path, skipName, authenticated, apiUrl} = props;
    this.authenticated = Fields.fallback(authenticated, false);
    this.skipName = Fields.fallback(skipName, false);
    this.name = Fields.fallback(name, 'ApiBase');
    this.method = Fields.fallback(method, 'POST');
    this.headers = Fields.fallback(headers, {'content-type': 'application/json'});
    this.apiUrl = Fields.nullable(apiUrl, apiUrl_);
    this.path_ = Fields.fallback(path, '');
  }

  params(data) {
    return {};
  };

  path(data){
    return this.path_;
  }

  fetch({data} = {}) {
    let parameters;
    try {
      parameters = this.params(data);
    } catch (error) {
      return Promise.reject(error);
    }
    return this.request(data, parameters);
  }

  body(parameters) {
    if (!Fields.any([() => Object.keys(parameters).length, () => !this.skipName])) return {};
    return {body: JSON.stringify(this.bodyObject(parameters))};
  }

  bodyObject(parameters) {
    const body = {parameters};
    if (!this.skipName) body.name = this.name;
    return body;
  }

  request(data, parameters) {
    const options = {method: this.method, headers: this.headers, ...this.body(parameters)};
    if (this.authenticated) return this.authenticatedRequest(data, options);
    return this.send(data, options);
  }

  authenticatedRequest(data, options) {
    if (!data.token) return Promise.reject(new Error('No token and authenticated!'));
    return this.send(data, {...options, accessToken: data.token});
  }

  send(data, options) {
    return fetchJson(`${this.apiUrl}/${this.path(data)}`, options);
  }
}

export default ApiBase;
