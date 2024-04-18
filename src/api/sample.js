import ApiBase from './api_base';

class sampleApi extends ApiBase {
  constructor(apiUrl) {
    let props = {
      name: 'ApiSample',
      url: 'sample',
      apiUrl: apiUrl,
      authenticated: true
    };
    super(props);
  }
  params(data) {
    const {id} = data;
    let params = {};
    params.uuid = id;
    return params;
  }
}
function SampleApi(apiUrl){
  return new sampleApi(apiUrl);
}
export default SampleApi;