const ApiBase = require('./api_base').default;

function heartbeatParams(data) {
  const {journey: journey} = data;
  if (journey) return { journey: journey};
  return {};
}

class heartbeatApi extends ApiBase {
  constructor(apiUrl) {
    let props = {
      name: 'ApiHeartbeat',
      url: 'heartbeat',
      apiUrl: apiUrl,
      authenticated: true
    };
    super(props);
  }
  params(data) {
    let params = heartbeatParams(data);
    const {id, tags, platform, timestamp} = data;
    params.uuid = id;
    params.timestamp = timestamp;
    params.tags = tags;
    params.platform = platform;
    return params;
  }
}

function HeartbeatApi(apiUrl){
  return new heartbeatApi(apiUrl);
}
export default HeartbeatApi;