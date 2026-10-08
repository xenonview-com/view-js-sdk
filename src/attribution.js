import Fields from './fields';

export default class Attribution {
  constructor(params) {
    this.params = params;
  }

  campaign(key) {
    return Fields.fallback(this.params.get(key), 'No Campaign');
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
      [() => this.sourceIs('shareasale'), () => ['Share-a-sale', this.campaign('sscid')]],
      [() => p.has('sscid'), () => ['Share-a-sale', p.get('sscid')]],
      [() => p.get('g_adtype') === 'none', () => ['Google Organic', this.campaign('g_campaign')]],
      [() => p.get('g_adtype') === 'search', () => ['Google Paid Search', this.campaign('g_campaign')]],
      [() => p.get('utm_source') === 'facebook', () => ['Facebook Ad', this.campaign('utm_campaign')]],
      [() => this.sourceIs('email-broadcast'), () => ['Email', this.campaign('utm_campaign')]],
      [() => this.sourceIs('youtube'), () => ['YouTube', this.campaign('utm_campaign')]],
      [() => this.googleProductListing(), () => ['Google Merchant', this.campaign('utm_campaign')]],
      [() => p.has('avad'), () => ['Avantlink', this.campaign('avad')]],
      [() => p.has('dt_id'), () => ['Shopify Collabs', this.campaign('dt_id')]],
      [() => p.has('awc'), () => ['Awin', this.campaign('awc')]],
      [() => this.sourceIs('awin'), () => ['Awin', this.campaign('utm_campaign')]],
      [() => p.get('source') === 'sas-click', () => ['Share-a-sale', this.campaign('u')]],
      [() => [p.has('utm_source'), p.has('utm_campaign')].every(Boolean), () => [p.get('utm_source'), p.get('utm_campaign')]],
      [() => p.has('utm_source'), () => [p.get('utm_source'), 'No Campaign']],
      [() => p.has('srsltid'), () => ['Google Organic', this.campaign('utm_campaign')]],
      [() => true, () => ['Unattributed']]
    ];
  }

  values() {
    const [, resolve] = this.rules().find(([matches]) => matches());
    return resolve();
  }
}
