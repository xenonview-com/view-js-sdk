import JourneyApi from "../../src/api/journey";
require('../helper/api_helper');
import {UnblockPromises} from "../helper/api_helper";

describe('JourneyApi', () => {
  let subject;
  const apiUrl = 'https://app.xenonview.com';
  let dataWithJourney = {uuid: 'somevalue', handle: 'test_user_screenname', journey: ['step']};
  let dataWithoutJourney = {uuid: 'somevalue', handle: 'test_user_screenname'};
  beforeEach(() => {
    subject = new JourneyApi();
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
      handle: 'test_user_screenname',
      journey: ['step']
    });
  });
  it('creates parameters without journey', () => {
    expect(subject.params(dataWithoutJourney)).toEqual({
      uuid: 'somevalue',
      handle: 'test_user_screenname'
    });
  });
});