import ApiBase from './api_base';

class countApi extends ApiBase {
  constructor(apiUrl) {
    let props = {
      name: 'ApiIncrementCount',
      url: 'increment_count',
      apiUrl: apiUrl,
      authenticated: true
    };
    super(props);
  }
  params(data) {
    const {uid, timestamp, outcome, content, value} = data;
    const {leadSource, leadCampaign, leadGuid} = content;
    let params = {};
    params.uid = uid;
    params.timestamp = timestamp;
    params.outcome = outcome;
    params.leadSource = leadSource;
    params.leadCampaign = leadCampaign;
    params.leadGuid = leadGuid;
    params.value = value
    return params;
  }
}
function CountApi(apiUrl){
  return new countApi(apiUrl);
}
export default CountApi;