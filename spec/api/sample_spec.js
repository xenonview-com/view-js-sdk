import SampleApi from "../../src/api/sample";
import {ImmediatelyResolvePromise, UnblockPromises} from "../helper/api_helper";
import MockPromises from "mock-promises";

require('../helper/api_helper');

describe('SampleApi', () => {
  let subject;
  const apiUrl = 'https://app.xenonview.com';
  const data = {id: 'somevalue', token: "<testToken>"};
  beforeEach((done) => {
    (async () => {
      MockPromises.reset();
      subject = new SampleApi(apiUrl);
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
  it('requests sample', () => {
    expect(`${apiUrl}/sample`).toHaveBeenRequested();
  });
  it('creates parameters', () => {
    expect(subject.params(data)).toEqual({
      uuid: 'somevalue'
    });
  });
});