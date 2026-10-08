import Attribution from '../src/attribution';
import {_Xenon} from '../src/xenon';
import ApiBase from '../src/api/api_base';
import {mock, instance, when, anything, capture} from 'ts-mockito';
import {ImmediatelyResolveAllPromises} from './helper/api_helper';
import {storeSession, retrieveSession} from '../src/storage/storage';

const searchUrl = 'https://www.flytanium.com/?srsltid=AU7gw4XNyGiE52t5U_txCK4aQ7zXLI0C6aVge7SAoQKJqAvTIEyy0QYD';
const shoppingUrl = 'https://www.flytanium.com/products/arcade-pro?variant=46823805419772&country=US&currency=USD&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic&srsltid=AU7gw4WotzIGiIU53UqSWtmosm5DADicFgQ1LghNdZ-HxjIqfeK6CZPDYHo';

function expectedTracking(query, tracking) {
  const params = new URLSearchParams(query);
  const manual = Object.fromEntries(['utm_source', 'utm_campaign']
    .filter(key => Boolean(params.get(key)))
    .map(key => [key, params.get(key)]));
  return {...manual, ...tracking};
}

const auditCases = [
  ['Google click ID', '?gclid=click', 'Google Ad', 'No Campaign', {gclid: 'click'}],
  ['iOS web click ID', '?wbraid=click', 'Google Ad', 'No Campaign', {wbraid: 'click'}],
  ['iOS app click ID', '?gbraid=click', 'Google Ad', 'No Campaign', {gbraid: 'click'}],
  ['Marketing Platform click ID', '?dclid=click', 'Google Marketing Platform Ad', 'No Campaign', {dclid: 'click'}],
  ['ad ahead of organic marker', '?gclid=paid&srsltid=organic', 'Google Ad', 'No Campaign', {gclid: 'paid'}],
  ['ad ahead of product listing', '?gclid=paid&utm_source=google&utm_medium=product_sync&utm_campaign=sag_organic', 'Google Ad', 'sag_organic', {gclid: 'paid', utm_medium: 'product_sync'}],
  ['Google manual paid search', '?utm_source=GOOGLE&utm_medium=CPC&utm_campaign=sale', 'Google Paid Search', 'sale', {utm_medium: 'CPC'}],
  ['Google manual organic search', '?utm_source=google&utm_medium=organic', 'Google Organic', 'No Campaign', {utm_medium: 'organic'}],
  ['Facebook paid social', '?utm_source=Facebook&utm_medium=paid_social', 'Facebook Paid Social', 'No Campaign', {utm_medium: 'paid_social'}],
  ['Facebook organic social', '?utm_source=facebook&utm_medium=social', 'Facebook Organic', 'No Campaign', {utm_medium: 'social'}],
  ['Facebook without paid evidence', '?utm_source=FACEBOOK', 'Facebook', 'No Campaign'],
  ['Instagram paid social', '?utm_source=ig&utm_medium=ppc', 'Instagram Paid Social', 'No Campaign', {utm_medium: 'ppc'}],
  ['YouTube paid video', '?utm_source=youtube&utm_medium=cpc', 'YouTube Paid Video', 'No Campaign', {utm_medium: 'cpc'}],
  ['YouTube organic video', '?utm_source=youtube&utm_medium=video', 'YouTube Organic', 'No Campaign', {utm_medium: 'video'}],
  ['Shopify Email defaults', '?utm_source=shopify_email&utm_medium=email&utm_campaign=Welcome', 'Shopify Email', 'Welcome', {utm_medium: 'email'}],
  ['Shop app referral', '?utm_source=shop_app&utm_medium=referral', 'Shop', 'No Campaign', {utm_medium: 'referral'}],
  ['newsletter email', '?utm_source=newsletter&utm_medium=email', 'Email', 'No Campaign', {utm_medium: 'email'}],
  ['SMS campaign', '?utm_source=vendor&utm_medium=sms', 'SMS', 'No Campaign', {utm_medium: 'sms'}],
  ['generic affiliate', '?utm_source=creator&utm_medium=affiliate', 'Affiliate', 'No Campaign', {utm_medium: 'affiliate'}],
  ['referral', '?utm_source=blog&utm_medium=referral', 'Referral', 'No Campaign', {utm_medium: 'referral'}],
  ['display', '?utm_source=network&utm_medium=display', 'Display', 'No Campaign', {utm_medium: 'display'}],
  ['push', '?utm_source=vendor&utm_medium=push', 'Push Notification', 'No Campaign', {utm_medium: 'push'}],
  ['unknown paid platform', '?utm_source=vendor&utm_medium=paid', 'Paid Other', 'No Campaign', {utm_medium: 'paid'}],
  ['generic organic search', '?utm_medium=organic', 'Organic Search', 'No Campaign', {utm_medium: 'organic'}],
  ['generic organic social', '?utm_medium=social', 'Organic Social', 'No Campaign', {utm_medium: 'social'}],
  ['generic organic video', '?utm_medium=video', 'Organic Video', 'No Campaign', {utm_medium: 'video'}],
  ['campaign without source', '?utm_campaign=spring', 'Unknown Source', 'spring'],
  ['campaign ID without source', '?utm_id=123', 'Unknown Source', '123', {utm_id: '123'}],
  ['campaign ID fallback', '?utm_source=vendor&utm_id=123', 'vendor', '123', {utm_id: '123'}],
  ['campaign name before ID', '?utm_source=vendor&utm_campaign=spring&utm_id=123', 'vendor', 'spring', {utm_id: '123'}],
  ['all campaign details', '?utm_source=google&utm_campaign=sale&utm_medium=cpc&utm_content=banner&utm_term=knives&utm_id=123&utm_source_platform=ads&utm_creative_format=video&utm_marketing_tactic=remarketing&gclid=click&variant=private', 'Google Ad', 'sale', {
    utm_medium: 'cpc', utm_content: 'banner', utm_term: 'knives', utm_id: '123',
    utm_source_platform: 'ads', utm_creative_format: 'video', utm_marketing_tactic: 'remarketing', gclid: 'click'
  }],
  ['empty campaign name fallback', '?utm_source=vendor&utm_campaign=&utm_id=123', 'vendor', '123', {utm_id: '123'}],
  ['empty click ID', '?gclid=', 'Unattributed', undefined],
  ['explicit custom override', '?xenonSrc=custom&xenonId=sale&gclid=click', 'custom', 'sale', {gclid: 'click'}],
  ['affiliate ahead of medium', '?awc=affiliate&utm_medium=referral', 'Awin', 'affiliate', {utm_medium: 'referral'}]
];

const cases = [
  ['Google search example', new URL(searchUrl).search, 'Google Organic', 'No Campaign'],
  ['Google Shopping example', new URL(shoppingUrl).search, 'Google Merchant', 'sag_organic', {utm_medium: 'product_sync', utm_content: 'sag_organic'}],
  ['product listing without srsltid', '?utm_source=google&utm_medium=product_sync&utm_campaign=sag_organic', 'Google Merchant', 'sag_organic'],
  ['product listing identified by content', '?utm_source=GOOGLE&utm_medium=product_sync&utm_content=sag_organic', 'Google Merchant', 'No Campaign'],
  ['campaign plus product content', '?utm_source=google&utm_medium=product_sync&utm_campaign=summer&utm_content=sag_organic', 'Google Merchant', 'summer'],
  ['unrelated Google campaign', '?utm_source=google&utm_campaign=summer&srsltid=click', 'google', 'summer'],
  ['Google UTM without campaign', '?utm_source=google&srsltid=click', 'google', 'No Campaign'],
  ['another tagged source', '?utm_source=newsletter&utm_campaign=summer&srsltid=click', 'newsletter', 'summer'],
  ['another source without campaign', '?utm_source=newsletter&srsltid=click', 'newsletter', 'No Campaign'],
  ['paid Google search', '?g_campaignid=paid&srsltid=click', 'Google Ad', 'paid'],
  ['custom tracking override', '?xenonSrc=custom&xenonId=campaign&utm_source=google&utm_medium=product_sync&utm_campaign=sag_organic', 'custom', 'campaign'],
  ['product sync without organic marker', '?utm_source=google&utm_medium=product_sync&srsltid=click', 'google', 'No Campaign'],
  ['organic marker without product sync', '?utm_source=google&utm_campaign=sag_organic&srsltid=click', 'google', 'sag_organic'],
  ['organic marker on another source', '?utm_source=other&utm_medium=product_sync&utm_campaign=sag_organic', 'other', 'sag_organic'],
  ['YouTube description capitalized', '?utm_source=Youtube&utm_medium=description', 'YouTube', 'No Campaign', {utm_medium: 'description'}],
  ['YouTube description lowercase', '?utm_source=youtube&utm_medium=description', 'YouTube', 'No Campaign', {utm_medium: 'description'}],
  ['YouTube campaign with Google parameter', '?utm_source=Youtube&utm_campaign=video&srsltid=click', 'YouTube', 'video'],
  ['Shopify Collabs example', '?dt_id=2562492', 'Shopify Collabs', '2562492'],
  ['Collabs with UTMs', '?dt_id=2562492&utm_source=creator&utm_campaign=shopifycollabs', 'Shopify Collabs', '2562492'],
  ['empty Collabs identifier', '?dt_id=', 'Shopify Collabs', 'No Campaign'],
  ['Awin click append', '?awc=112354_12345_click', 'Awin', '112354_12345_click'],
  ['Awin UTM campaign', '?utm_source=AWIN&utm_campaign=affiliate', 'Awin', 'affiliate'],
  ['Awin UTM without campaign', '?utm_source=awin', 'Awin', 'No Campaign'],
  ['forwarded ShareASale migration markers', '?source=sas-click&u=1313269', 'Share-a-sale', '1313269'],
  ['migration marker without affiliate', '?source=sas-click', 'Share-a-sale', 'No Campaign'],
  ['existing ShareASale marker', '?sscid=original&source=sas-click&u=1313269', 'Share-a-sale', 'original'],
  ['unrelated generic source parameter', '?source=unknown&u=1313269', 'Unattributed', undefined]
];

describe('Attribution landing page rules', () => {
  cases.concat(auditCases).forEach(([description, query, source, campaign]) => {
    it(`classifies ${description}`, () => {
      const attribution = new Attribution(new URLSearchParams(query));
      expect(attribution.values()).toEqual([source, campaign].filter(value => value !== undefined));
    });
  });

  it('preserves supplementary UTM and click fields without unrelated query parameters', () => {
    const tracking = {
      utm_medium: 'cpc', utm_content: 'banner', utm_term: 'knives', utm_id: '123',
      utm_source_platform: 'ads', utm_creative_format: 'video', utm_marketing_tactic: 'remarketing',
      gclid: 'google', wbraid: 'web', gbraid: 'app', dclid: 'display'
    };
    const params = new URLSearchParams({...tracking, variant: 'private', utm_source: 'google', utm_campaign: 'sale'});
    expect(new Attribution(params).metadata()).toEqual({leadTracking: {...tracking, utm_source: 'google', utm_campaign: 'sale'}});
    expect(new Attribution(new URLSearchParams('?gclid=&utm_medium=&utm_campaign=sale')).metadata()).toEqual({});
  });

  it('extracts the YouTube redirect destinations provided in the examples', () => {
    const destinations = [
      'https%3A%2F%2Fwww.flytanium.com%2F%3Futm_source%3DYoutube%26utm_medium%3Ddescription',
      'https%3A%2F%2Fwww.flytanium.com%2Fproducts%2Ftheory-year-of-the-fire-horse-limited-edition%3Futm_source%3Dyoutube%26utm_medium%3Ddescription'
    ];
    destinations.forEach(destination => {
      const redirect = new URL(`https://www.youtube.com/redirect?event=video_description&q=${destination}`);
      const landing = new URL(redirect.searchParams.get('q'));
      expect(new Attribution(landing.searchParams).values()).toEqual(['YouTube', 'No Campaign']);
    });
  });
});

describe('Attribution capture and API propagation', () => {
  let unit;
  let countApi;

  beforeEach(async () => {
    ImmediatelyResolveAllPromises();
    sessionStorage.clear();
    localStorage.clear();
    countApi = mock(ApiBase);
    when(countApi.fetch(anything())).thenReturn(Promise.resolve(true));
    unit = new _Xenon();
    unit.CountApi = () => instance(countApi);
    await storeSession('xenon-view', 'test-user');
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  [cases[0], cases[1], cases[14], cases[15], cases[17], cases[20], cases[23]]
    .concat(auditCases.filter(([, , source]) => source !== 'Unattributed'))
    .forEach(([description, query, leadSource, leadCampaign, tracking = {}]) => {
      it(`persists and sends ${description}`, async () => {
        const filteredQuery = await unit.autodiscoverLeadFrom(query);
        const retained = new URLSearchParams(query);
        ['xenonSrc', 'xenonId', 'xenon_euid'].forEach(key => retained.delete(key));
        expect(new URLSearchParams(filteredQuery).toString()).toEqual(retained.toString());
        const attribution = {leadSource, leadCampaign, leadGuid: null};
        if (Object.keys(tracking).length) attribution.leadTracking = expectedTracking(query, tracking);
        expect(await retrieveSession('view-attribution')).toEqual(attribution);
        expect(await retrieveSession('view-tags')).toEqual([leadSource, leadCampaign]);
        expect(capture(countApi.fetch).last()[0].data.content).toEqual(attribution);
        await unit.count('Purchase');
        expect(capture(countApi.fetch).last()[0].data.content).toEqual(attribution);
      });
    });

  it('retains the first attribution in the session', async () => {
    await unit.autodiscoverLeadFrom(new URL(searchUrl).search);
    await unit.autodiscoverLeadFrom(new URL(shoppingUrl).search);
    expect(await retrieveSession('view-attribution')).toEqual({
      leadSource: 'Google Organic', leadCampaign: 'No Campaign', leadGuid: null
    });
  });

  it('retains tracking metadata through first attribution and a failed API replay', async () => {
    const attribution = {
      leadSource: 'Google Ad', leadCampaign: 'sale', leadGuid: null,
      leadTracking: {gclid: 'click', utm_medium: 'cpc', utm_content: 'banner', utm_campaign: 'sale'}
    };
    when(countApi.fetch(anything())).thenReject(new Error('offline'));
    await unit.autodiscoverLeadFrom('?gclid=click&utm_campaign=sale&utm_medium=cpc&utm_content=banner');
    await unit.autodiscoverLeadFrom('?utm_source=shop_app');
    expect(await retrieveSession('view-attribution')).toEqual(attribution);
    const replay = await retrieveSession('view-count-replay');
    expect(replay[0].data.content).toEqual(attribution);
    when(countApi.fetch(anything())).thenReturn(Promise.resolve(true));
    await unit.count('Purchase');
    expect(capture(countApi.fetch).last()[0].data.content).toEqual(attribution);
    expect(await retrieveSession('view-count-replay')).toEqual([]);
  });
});
