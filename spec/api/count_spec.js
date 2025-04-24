import CountApi from "../../src/api/count";
require('../helper/api_helper');
import {UnblockPromises} from "../helper/api_helper";

describe('CountApi', () => {
  let subject;
  const apiUrl = 'https://counts.xenonlab.ai';
  const data = {token: "<testToken>", uid: "uid",
    timestamp: 1234.5,
    outcome: "<outcome>",
    content: {
      leadSource: "<source>",
      leadCampaign: "<identifier>",
      leadGuid: null
    },
    value: 123.31
  };
  beforeEach(() => {
    subject = new CountApi(apiUrl);
    subject.fetch({data});
    UnblockPromises();
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
});