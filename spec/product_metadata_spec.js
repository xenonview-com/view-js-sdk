import {_Xenon} from '../src/xenon';
import CountApi from '../src/api/count';
import ApiBase from '../src/api/api_base';
import JourneyApi from '../src/api/journey';
import HeartbeatApi from '../src/api/heartbeat';
import {mock, instance, when, anything, capture, verify} from 'ts-mockito';
import {ImmediatelyResolveAllPromises} from './helper/api_helper';
import {storeSession, retrieveSession} from '../src/storage/storage';

describe('Product metadata', () => {
  let unit;
  let fetch;
  const skus = ['sku-1', 'sku-2'];
  const productNames = ['Laptop, 15 inch', 'Keyboard'];
  const brands = ['Dell', 'Apple'];

  beforeEach(async () => {
    ImmediatelyResolveAllPromises();
    sessionStorage.clear();
    localStorage.clear();
    fetch = mock(ApiBase);
    when(fetch.fetch(anything())).thenReturn(Promise.resolve(true));
    unit = new _Xenon();
    unit.CountApi = () => instance(fetch);
    await storeSession('xenon-view', 'uid');
    await storeSession('view-attribution', {leadSource: 'test'});
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('records ordered arrays in purchase journeys and count requests', async () => {
    await unit.purchase(skus, 100, null, null, 'Member', productNames, brands);
    const journey = (await unit.journey())[0];
    expect(journey.skus).toEqual(skus);
    expect(journey.productNames).toEqual(productNames);
    expect(journey.brands).toEqual(brands);
    expect(capture(fetch.fetch).last()[0].data).toEqual(jasmine.objectContaining({
      skus, productNames, brands, outcome: 'Purchase:Member', value: 100
    }));
  });

  it('supports comma-separated SKUs with arrays of names and brands', async () => {
    await unit.purchase('sku-1, sku-2', null, null, null, null, productNames, brands);
    expect((await unit.journey())[0].skus).toEqual(skus);
    expect(capture(fetch.fetch).last()[0].data.productNames).toEqual(productNames);
  });

  it('accepts a scalar name and brand for one SKU without splitting commas', async () => {
    await unit.purchase('sku-1', null, null, null, null, productNames[0], brands[0]);
    expect((await unit.journey())[0].productNames).toEqual([productNames[0]]);
    expect(capture(fetch.fetch).last()[0].data.brands).toEqual([brands[0]]);
  });

  it('records cancellation metadata with matching SKUs', async () => {
    await unit.purchaseCancel(skus, 100, productNames, brands);
    expect((await unit.journey())[0]).toEqual(jasmine.objectContaining({skus, productNames, brands}));
    verify(fetch.fetch(anything())).never();
  });

  [
    ['productAddedToCart', ['sku-1', 100, productNames[0], brands[0]]],
    ['upsold', ['sku-1', 100, productNames[0], brands[0]]],
    ['upsellDismissed', ['sku-1', 100, productNames[0], brands[0]]],
    ...['productNotAddedToCart', 'productRemoved', 'productKept', 'productReturned']
      .map(method => [method, ['sku-1', productNames[0], brands[0]]])
  ].forEach(([method, args]) => {
    it(`records names and brands for ${method}`, async () => {
      await unit[method](...args);
      expect((await unit.journey())[0]).toEqual(jasmine.objectContaining({
        productNames: [productNames[0]], brands: [brands[0]]
      }));
    });
  });

  ['productAddedToCart', 'upsold'].forEach(method => {
    it(`sends names and brands in the ${method} count`, async () => {
      await unit[method]('sku-1', 100, productNames[0], brands[0]);
      expect(capture(fetch.fetch).last()[0].data).toEqual(jasmine.objectContaining({
        skus: ['sku-1'], productNames: [productNames[0]], brands: [brands[0]]
      }));
    });
  });

  it('allows each metadata field to be omitted independently', async () => {
    await unit.count('Purchase', 100, skus, true, null, brands);
    const data = capture(fetch.fetch).last()[0].data;
    expect(data.brands).toEqual(brands);
    expect(data.productNames).toBeUndefined();
    await unit.count('Purchase', 100, skus, true, productNames);
    expect(capture(fetch.fetch).last()[0].data.productNames).toEqual(productNames);
    expect(capture(fetch.fetch).last()[0].data.brands).toBeUndefined();
  });

  it('rejects mismatched metadata before recording purchase or cancellation', async () => {
    await expectAsync(unit.purchase(skus, null, null, null, null, ['Laptop'], brands))
      .toBeRejectedWithError(RangeError, 'productNames must have one entry per SKU');
    await expectAsync(unit.purchaseCancel(skus, null, productNames, ['Dell']))
      .toBeRejectedWithError(RangeError, 'brands must have one entry per SKU');
    expect(await unit.journey()).toBeNull();
    verify(fetch.fetch(anything())).never();
  });

  it('validates count metadata even without attribution', async () => {
    sessionStorage.clear();
    await expectAsync(unit.count('Purchase', 100, skus, false, productNames, ['Dell']))
      .toBeRejectedWithError(RangeError, 'brands must have one entry per SKU');
    await expectAsync(unit.count('Purchase', 100, null, false, 'Laptop'))
      .toBeRejectedWithError(RangeError, 'productNames must have one entry per SKU');
    verify(fetch.fetch(anything())).never();
  });

  it('preserves metadata when replaying a failed request', async () => {
    when(fetch.fetch(anything())).thenReturn(Promise.reject(new Error('offline')));
    await unit.count('Purchase', 100, skus, false, productNames, brands);
    expect((await retrieveSession('view-count-replay'))[0].data.productNames).toEqual(productNames);
    when(fetch.fetch(anything())).thenReturn(Promise.resolve(true));
    await unit.count('Other');
    expect(capture(fetch.fetch).byCallIndex(1)[0].data).toEqual(jasmine.objectContaining({skus, productNames, brands}));
    expect(await retrieveSession('view-count-replay')).toEqual([]);
  });

  it('serializes metadata in count API parameters', async () => {
    const api = CountApi('https://example.com');
    await unit.count('Purchase', 100, skus, true, productNames, brands);
    const data = capture(fetch.fetch).last()[0].data;
    expect(api.params(data)).toEqual(jasmine.objectContaining({skus, productNames, brands}));
  });
  [['commit', 'JourneyApi', JourneyApi], ['heartbeat', 'HeartbeatApi', HeartbeatApi]]
    .forEach(([method, factory, realFactory]) => {
      it(`carries metadata through ${method} API parameters`, async () => {
        const endpoint = mock(ApiBase);
        when(endpoint.fetch(anything())).thenReturn(Promise.resolve(true));
        unit[factory] = () => instance(endpoint);
        await storeSession('xenon-will-sample', true);
        await unit.purchase(skus, 100, null, null, null, productNames, brands);
        await unit[method]();
        const data = capture(endpoint.fetch).last()[0].data;
        const parameters = realFactory('https://example.com').params(data);
        expect(parameters.journey[0]).toEqual(jasmine.objectContaining({skus, productNames, brands}));
      });
    });

  it('retains the existing duplicate event count semantics', async () => {
    await unit.storeJourney([{category: 'Feature', action: 'Attempted', name: 'test', count: null, timestamp: 1}]);
    await unit.featureAttempted('test');
    expect((await unit.journey())[0].count).toBe(1);
  });

  it('rejects multiple names for a single cart SKU before recording', async () => {
    await expectAsync(unit.productAddedToCart('sku-1', 100, productNames, 'Dell'))
      .toBeRejectedWithError(RangeError, 'productNames must have one entry per SKU');
    expect(await unit.journey()).toBeNull();
    verify(fetch.fetch(anything())).never();
  });

});
