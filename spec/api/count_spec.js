import CountApi from "../../src/api/count";
import {ImmediatelyResolvePromise, UnblockPromises} from "../helper/api_helper";
import MockPromises from "mock-promises";

require('../helper/api_helper');

describe('CountApi', () => {
  let subject;
  const apiUrl = 'https://counts.xenonlab.ai';
  const data = {
    token: "<testToken>", uid: "uid",
    timestamp: 1234.5,
    outcome: "<outcome>",
    content: {
      leadSource: "<source>",
      leadCampaign: "<identifier>",
      leadGuid: null
    },
    value: 123.31
  };
  beforeEach((done) => {
    (async () => {
      MockPromises.reset();
      subject = new CountApi(apiUrl);
      ImmediatelyResolvePromise(0);
      subject.fetch({data}).then(() => done(), () => done());
      const request = jasmine.Ajax.requests.mostRecent();
      const response = [{'result': 'success'}];
      request.succeed(response);
      UnblockPromises();
    })();
  });
  it('requests count', () => {
    expect(`${apiUrl}/increment_count`).toHaveBeenRequested();
  });
  it('creates parameters', () => {
    expect(subject.params(data)).toEqual({
      uid: 'uid',
      timestamp: 1234.5,
      outcome: '<outcome>',
      leadSource: '<source>',
      leadCampaign: '<identifier>',
      leadGuid: null,
      value: 123.31
    });
  });
  afterEach(() => {
    ImmediatelyResolvePromise(0);
  });
});