import HeartbeatApi from "../../src/api/heartbeat";
require('../helper/api_helper');
import {UnblockPromises} from "../helper/api_helper";

describe('HeartbeatApi', () => {
  let subject;
  const apiUrl = 'https://app.xenonview.com';
  let dataWithoutWatchdog = {id: 'somevalue', token: "<testToken>", timestamp: 0.1, tags: [], platform:{}};
  let dataWithoutJourney = {...dataWithoutWatchdog, watchdog:{}};
  let dataWithJourney = {...dataWithoutJourney, journey: ['step']};
  beforeEach(() => {
    subject = new HeartbeatApi(apiUrl);
    const data = dataWithJourney;
    subject.fetch({data});
    UnblockPromises();
  });
  it('requests journey', () => {
    expect(`${apiUrl}/heartbeat`).toHaveBeenRequested();
  });
  it('creates parameters with journey', () => {
    expect(subject.params(dataWithJourney)).toEqual({
      uuid: 'somevalue',
      journey: ['step'],
      tags:[],
      platform: {},
      watchdog:{},
      timestamp: jasmine.any(Number)
    });
  });
  it('creates parameters without journey', () => {
    expect(subject.params(dataWithoutJourney)).toEqual({
      uuid: 'somevalue',
      tags:[],
      platform: {},
      watchdog:{},
      timestamp: jasmine.any(Number)
    });
  });
  it('creates parameters without watchdog', () => {
    expect(subject.params(dataWithoutWatchdog)).toEqual({
      uuid: 'somevalue',
      tags:[],
      platform: {},
      timestamp: jasmine.any(Number)
    });
  });
});