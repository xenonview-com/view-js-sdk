import Fields from './fields';
import AttributionChannels from './attribution_channels';

export default class Attribution {
  constructor(params) {
    this.params = params;
    this.channel = new AttributionChannels(params).values();
  }

  campaign(key) {
    return Fields.fallback(this.params.get(key), this.campaignFallback(key));
  }

  campaignFallback(key) {
    if (key === 'utm_campaign') return Fields.fallback(this.params.get('utm_id'), 'No Campaign');
    return 'No Campaign';
  }

  hasClickId(keys) {
    return keys.some(key => Boolean(this.params.get(key)));
  }

  metadata() {
    const keys = [
      'utm_medium', 'utm_content', 'utm_term', 'utm_id', 'utm_source_platform',
      'utm_creative_format', 'utm_marketing_tactic', 'gclid', 'wbraid', 'gbraid', 'dclid'
    ];
    const tracking = Fields.truthy(Object.fromEntries(keys.map(key => [key, this.params.get(key)])));
    if (!Object.keys(tracking).length) return {};
    return {leadTracking: {...this.manualSource(), ...tracking}};
  }

  manualSource() {
    return Fields.truthy({utm_source: this.params.get('utm_source'), utm_campaign: this.params.get('utm_campaign')});
  }

  sourceIs(source) {
    return String(Fields.fallback(this.params.get('utm_source'), '')).toLowerCase() === source;
  }

  medium() {
    return this.params.has('utm_medium') ? ' - ' + this.params.get('utm_medium') : '';
  }

  googleProductListing() {
    return Fields.all([
      () => this.sourceIs('google'),
      () => this.params.get('utm_medium') === 'product_sync',
      () => ['utm_campaign', 'utm_content'].some(key => this.params.get(key) === 'sag_organic')
    ]);
  }

  rules() {
    const p = this.params;
    return [
      [() => p.has('xenonSrc'), () => [p.get('xenonSrc'), this.campaign('xenonId')]],
      [() => p.has('cr_campaignid'), () => ['Cerebro', p.get('cr_campaignid')]],
      [() => this.sourceIs('klaviyo'), () => ['Klaviyo' + this.medium(), this.campaign('utm_campaign')]],
      [() => p.has('g_campaignid'), () => ['Google Ad', p.get('g_campaignid')]],
      [() => this.hasClickId(['gclid', 'wbraid', 'gbraid']), () => ['Google Ad', this.campaign('utm_campaign')]],
      [() => this.hasClickId(['dclid']), () => ['Google Marketing Platform Ad', this.campaign('utm_campaign')]],
      [() => this.sourceIs('shareasale'), () => ['Share-a-sale', this.campaign('sscid')]],
      [() => p.has('sscid'), () => ['Share-a-sale', p.get('sscid')]],
      [() => p.get('g_adtype') === 'none', () => ['Google Organic', this.campaign('g_campaign')]],
      [() => p.get('g_adtype') === 'search', () => ['Google Paid Search', this.campaign('g_campaign')]],
      [() => this.googleProductListing(), () => ['Google Merchant', this.campaign('utm_campaign')]],
      [() => this.sourceIs('shopify_email'), () => ['Shopify Email', this.campaign('utm_campaign')]],
      [() => this.sourceIs('shop_app'), () => ['Shop', this.campaign('utm_campaign')]],
      [() => p.has('avad'), () => ['Avantlink', this.campaign('avad')]],
      [() => p.has('dt_id'), () => ['Shopify Collabs', this.campaign('dt_id')]],
      [() => p.has('awc'), () => ['Awin', this.campaign('awc')]],
      [() => this.sourceIs('awin'), () => ['Awin', this.campaign('utm_campaign')]],
      [() => p.get('source') === 'sas-click', () => ['Share-a-sale', this.campaign('u')]],
      [() => Boolean(this.channel), () => [this.channel, this.campaign('utm_campaign')]],
      [() => this.sourceIs('facebook'), () => ['Facebook', this.campaign('utm_campaign')]],
      [() => this.sourceIs('email-broadcast'), () => ['Email', this.campaign('utm_campaign')]],
      [() => this.sourceIs('youtube'), () => ['YouTube', this.campaign('utm_campaign')]],
      [() => p.has('utm_source'), () => [p.get('utm_source'), this.campaign('utm_campaign')]],
      [() => p.has('srsltid'), () => ['Google Organic', this.campaign('utm_campaign')]],
      [() => ['utm_campaign', 'utm_id'].some(key => Boolean(p.get(key))), () => ['Unknown Source', this.campaign('utm_campaign')]],
      [() => true, () => ['Unattributed']]
    ];
  }

  values() {
    const [, resolve] = this.rules().find(([matches]) => matches());
    return resolve();
  }
}
