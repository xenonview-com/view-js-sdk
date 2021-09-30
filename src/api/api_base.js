import {fetchJson} from './fetch/json';

const apiHost = 'app.xenonview.com';
const apiUrl_ = `https://${apiHost}`;


class ApiBase {
  constructor(props = {}) {
    const {name, method, headers, url, skipName, authenticated, apiUrl} = props;
    this.authenticated = (authenticated) ? authenticated : false;
    this.skipName = (skipName) ? skipName : false;
    this.name = (name) ? name : 'ApiBase';
    this.method = (method) ? method : 'POST';
    this.headers = (headers) ? headers : {
      'content-type': 'application/json'
    };
    this.apiUrl = (apiUrl || apiUrl != undefined) ? apiUrl : apiUrl_;
    this.url_ = (url) ? url : '';
  }

  params(data) {
    return {};
  };

  url(data){
    return this.url_;
  }

  fetch({data} = {}) {
    let parameters = {};
    try {
      parameters = this.params(data);
    } catch (error) {
      return Promise.reject(error);
    }
    let fetchParameters = {
      method: this.method,
      headers: this.headers,
    };

    if (Object.keys(parameters).length || !this.skipName) {
      let bodyObject = {
        parameters: parameters
      };
      if (!this.skipName) bodyObject.name = this.name;
      const body = JSON.stringify(bodyObject);
      fetchParameters.body = body;
    }

    if (this.authenticated) {
      const {token} = data;
      if (token) fetchParameters.accessToken = token;
      else return Promise.reject(new Error("No token and authenticated!"))
    }
    const fetchUrl = `${this.apiUrl}/${this.url(data)}`;
    return fetchJson(fetchUrl, fetchParameters);
  }
}

export default ApiBase;
