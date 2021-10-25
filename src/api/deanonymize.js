const ApiBase = require('./api_base').default;

class deanonApi extends ApiBase {
  constructor(apiUrl) {
    let props = {
      name: 'ApiDeanonymize',
      url: 'deanonymize',
      apiUrl: apiUrl,
      authenticated: true
    };
    super(props);
  }
  params(data) {
    const {id, person} = data;
    let params = {};
    params.uuid = id;
    params.person = person;
    return params;
  }
}
function DeanonApi(apiUrl){
  return new deanonApi(apiUrl);
}
export default DeanonApi;