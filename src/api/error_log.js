import ApiBase from './api_base';

class errorLogApi extends ApiBase {
  constructor(apiUrl) {
    let props = {
      name: 'ApiErrorLog',
      url: 'error_log',
      apiUrl: apiUrl,
      authenticated: true
    };
    super(props);
  }
  params(data) {
    const {log} = data;
    let params = {};
    params.log = log;
    return params;
  }
}
function ErrorLogApi(apiUrl){
  return new errorLogApi(apiUrl);
}

export default ErrorLogApi;