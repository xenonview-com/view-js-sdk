import ApiBase from './api_base';
import ProductMetadata from '../product_metadata';

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
    const {uid, timestamp, outcome, content, value, skus, platform, productNames, brands} = data;
    const {leadSource, leadCampaign, leadGuid} = content;
    let params = {};
    params.uid = uid;
    params.timestamp = timestamp;
    params.outcome = outcome;
    params.leadSource = leadSource;
    params.leadCampaign = leadCampaign;
    params.leadGuid = leadGuid;
    params.value = value;
    params.platform = platform;
    params.skus = skus;
    Object.assign(params, new ProductMetadata(skus, productNames, brands).values());
    return params;
  }
}
function CountApi(apiUrl){
  return new countApi(apiUrl);
}
export default CountApi;