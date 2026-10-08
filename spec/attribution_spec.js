import Attribution from '../src/attribution';
import {_Xenon} from '../src/xenon';
import ApiBase from '../src/api/api_base';
import {mock, instance, when, anything, capture} from 'ts-mockito';
import {ImmediatelyResolveAllPromises} from './helper/api_helper';
import {storeSession, retrieveSession} from '../src/storage/storage';

const searchUrl = 'https://www.flytanium.com/?srsltid=AU7gw4XNyGiE52t5U_txCK4aQ7zXLI0C6aVge7SAoQKJqAvTIEyy0QYD';
const shoppingUrl = 'https://www.flytanium.com/products/arcade-pro?variant=46823805419772&country=US&currency=USD&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic&srsltid=AU7gw4WotzIGiIU53UqSWtmosm5DADicFgQ1LghNdZ-HxjIqfeK6CZPDYHo';

const cases = [
  ['Google search example', new URL(searchUrl).search, 'Google Organic', 'No Campaign'],
  ['Google Shopping example', new URL(shoppingUrl).search, 'Google Merchant', 'sag_organic'],
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
  ['YouTube description capitalized', '?utm_source=Youtube&utm_medium=description', 'YouTube', 'No Campaign'],
  ['YouTube description lowercase', '?utm_source=youtube&utm_medium=description', 'YouTube', 'No Campaign'],
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
  cases.forEach(([description, query, source, campaign]) => {
    it(`classifies ${description}`, () => {
      const attribution = new Attribution(new URLSearchParams(query));
      expect(attribution.values()).toEqual([source, campaign].filter(value => value !== undefined));
    });
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
    .forEach(([description, query, leadSource, leadCampaign]) => {
      it(`persists and sends ${description}`, async () => {
        const filteredQuery = await unit.autodiscoverLeadFrom(query);
        expect(new URLSearchParams(filteredQuery).toString()).toEqual(new URLSearchParams(query).toString());
        const attribution = {leadSource, leadCampaign, leadGuid: null};
        expect(await retrieveSession('view-attribution')).toEqual(attribution);
        expect(await retrieveSession('view-tags')).toEqual([leadSource, leadCampaign]);
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
});
