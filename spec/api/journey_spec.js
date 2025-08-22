import JourneyApi from "../../src/api/journey";
import {ImmediatelyResolvePromise, UnblockPromises} from "../helper/api_helper";
import MockPromises from "mock-promises";

require('../helper/api_helper');

describe('JourneyApi', () => {
  let subject;
  const apiUrl = 'https://app.xenonview.com';
  let dataWithoutJourney = {id: 'somevalue', token: "<testToken>", timestamp: 0.1}
  let dataWithJourney = {...dataWithoutJourney, journey: ['step']};
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
  it('creates parameters with journey', () => {
    expect(subject.params(dataWithJourney)).toEqual({
      uuid: 'somevalue',
      journey: ['step'],
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