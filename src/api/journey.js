const ApiBase = require('./api_base').default;

function journeyParams(data) {
  const {journey: journey} = data;
  if (journey) return { journey: journey};
  return {};
}

class journeyApi extends ApiBase {
  constructor(apiUrl) {
    let props = {
      name: 'ApiJourney',
      url: 'journey',
      apiUrl: apiUrl,
      authenticated: true
    };
    super(props);
  }
  params(data) {
    let params = journeyParams(data);
    const {id} = data;
    params.uuid = id;
    return params;
  }
}

function JourneyApi(apiUrl){
  return new journeyApi(apiUrl);
}
export default JourneyApi;