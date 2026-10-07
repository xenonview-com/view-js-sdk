import JourneyApi from "../../src/api/journey";
import {ImmediatelyResolvePromise, UnblockPromises} from "../helper/api_helper";
import MockPromises from "mock-promises";

require('../helper/api_helper');

describe('JourneyApi', () => {
  let subject;
  const apiUrl = 'https://app.xenonview.com';
  let dataWithoutJourney = {id: 'somevalue', token: "<testToken>", timestamp: 0.1}
  const product = {skus: ['sku-1'], productNames: ['Laptop'], brands: ['Dell']};
  let dataWithJourney = {...dataWithoutJourney, journey: [product]};
  beforeEach((done) => {
    (async () => {
      MockPromises.reset();
      subject = new JourneyApi(apiUrl);
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
    expect(`${apiUrl}/journey`).toHaveBeenRequested();
  });
  it('includes SKU metadata in the HTTP request body', () => {
    const request = jasmine.Ajax.requests.mostRecent();
    expect(JSON.parse(request.params).parameters.journey).toEqual([product]);
  });
  it('creates parameters with journey', () => {
    expect(subject.params(dataWithJourney)).toEqual({
      uuid: 'somevalue',
      journey: [product],
      timestamp: jasmine.any(Number)
    });
  });
  it('creates parameters without journey', () => {
    expect(subject.params(dataWithoutJourney)).toEqual({
      uuid: 'somevalue',
      timestamp: jasmine.any(Number)
    });
  });
});