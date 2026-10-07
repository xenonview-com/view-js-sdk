import HeartbeatApi from "../../src/api/heartbeat";
import {ImmediatelyResolvePromise, UnblockPromises} from "../helper/api_helper";
import MockPromises from "mock-promises";

require('../helper/api_helper');

describe('HeartbeatApi', () => {
  let subject;
  const apiUrl = 'https://app.xenonview.com';
  let dataWithoutWatchdog = {id: 'somevalue', token: "<testToken>", timestamp: 0.1, tags: [], platform: {}};
  let dataWithoutJourney = {...dataWithoutWatchdog, watchdog: {}};
  const product = {skus: ['sku-1'], productNames: ['Laptop'], brands: ['Dell']};
  let dataWithJourney = {...dataWithoutJourney, journey: [product]};
  beforeEach((done) => {
    (async () => {
      MockPromises.reset();
      subject = new HeartbeatApi(apiUrl);
      const data = dataWithJourney;
      subject.fetch({data}).then(() => done(), () => done());
      const request = jasmine.Ajax.requests.mostRecent();
      const response = [{'result': 'success'}];
      request.succeed(response);
      UnblockPromises();
    })();
  });
  afterEach(() => {
    ImmediatelyResolvePromise(0);
  });
  it('requests journey', () => {
    expect(`${apiUrl}/heartbeat`).toHaveBeenRequested();
  });
  it('includes SKU metadata in the HTTP request body', () => {
    const request = jasmine.Ajax.requests.mostRecent();
    expect(JSON.parse(request.params).parameters.journey).toEqual([product]);
  });
  it('creates parameters with journey', () => {
    expect(subject.params(dataWithJourney)).toEqual({
      uuid: 'somevalue',
      journey: [product],
      tags: [],
      platform: {},
      watchdog: {},
      timestamp: jasmine.any(Number)
    });
  });
  it('creates parameters without journey', () => {
    expect(subject.params(dataWithoutJourney)).toEqual({
      uuid: 'somevalue',
      tags: [],
      platform: {},
      watchdog: {},
      timestamp: jasmine.any(Number)
    });
  });
  it('creates parameters without watchdog', () => {
    expect(subject.params(dataWithoutWatchdog)).toEqual({
      uuid: 'somevalue',
      tags: [],
      platform: {},
      timestamp: jasmine.any(Number)
    });
  });
});