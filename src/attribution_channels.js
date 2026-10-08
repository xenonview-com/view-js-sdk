import Fields from './fields';

export default class AttributionChannels {
  constructor(params) {
    this.source = String(Fields.fallback(params.get('utm_source'), '')).toLowerCase();
    this.medium = String(Fields.fallback(params.get('utm_medium'), '')).toLowerCase();
  }

  paid() {
    return /^(.*cp.*|ppc|retargeting|paid.*)$/.test(this.medium);
  }

  platform() {
    return new Map([
      ['google', 'Google'], ['bing', 'Bing'],
      ['facebook', 'Facebook'], ['fb', 'Facebook'],
      ['instagram', 'Instagram'], ['ig', 'Instagram'],
      ['youtube', 'YouTube'], ['tiktok', 'TikTok']
    ]).get(this.source);
  }

  platformChannel() {
    const platform = this.platform();
    if (!platform) return undefined;
    return this.classifyPlatform(platform);
  }

  classifyPlatform(platform) {
    if (this.paid()) return platform + this.paidChannel();
    return this.organicPlatform(platform);
  }

  paidChannel() {
    return Fields.fallback(new Map([
      ['google', ' Paid Search'], ['bing', ' Paid Search'],
      ['youtube', ' Paid Video'], ['tiktok', ' Paid Video']
    ]).get(this.source), ' Paid Social');
  }

  organicPlatform(platform) {
    if (['social', 'organic_social', 'organic', 'organic_search', 'video', 'organic_video'].includes(this.medium)) return platform + ' Organic';
    return undefined;
  }

  values() {
    const channels = new Map([
      ['email', 'Email'], ['e-mail', 'Email'],
      ['sms', 'SMS'], ['affiliate', 'Affiliate'],
      ['referral', 'Referral'], ['app', 'Referral'], ['link', 'Referral'],
      ['display', 'Display'], ['banner', 'Display'], ['cpm', 'Display'],
      ['push', 'Push Notification']
    ]);
    return Fields.fallback(channels.get(this.medium), this.otherChannel());
  }

  otherChannel() {
    return Fields.fallback(this.platformChannel(), this.genericChannel());
  }

  genericChannel() {
    if (this.paid()) return 'Paid Other';
    return new Map([
      ['organic', 'Organic Search'], ['organic_search', 'Organic Search'],
      ['social', 'Organic Social'], ['organic_social', 'Organic Social'],
      ['video', 'Organic Video'], ['organic_video', 'Organic Video']
    ]).get(this.medium);
  }
}
