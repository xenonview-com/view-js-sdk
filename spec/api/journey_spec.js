import JourneyApi from "../../src/api/journey";
require('../helper/api_helper');
import {UnblockPromises} from "../helper/api_helper";

describe('JourneyApi', () => {
  let subject;
  const apiUrl = 'https://app.xenonview.com';
  let dataWithoutJourney = {id: 'somevalue', token: "<testToken>", timestamp: 0.1}
  let dataWithJourney = {...dataWithoutJourney, journey: ['step']};
  beforeEach(() => {
    subject = new JourneyApi(apiUrl);
    const data = dataWithJourney;
    subject.fetch({data});
    UnblockPromises();
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