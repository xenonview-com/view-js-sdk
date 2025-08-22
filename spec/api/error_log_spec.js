import ErrorLogApi from "../../src/api/error_log";

const MockPromises = require("mock-promises");
import {ImmediatelyResolvePromise, UnblockPromises} from "../helper/api_helper";

require('../helper/api_helper');


describe('ErrorLogApi', () => {
  let subject;
  const apiUrl = 'https://app.xenonview.com';
  let data = {log: ["<line>"], token: "<testToken>"};
  beforeEach((done) => {
    (async () => {
      MockPromises.reset();
      subject = new ErrorLogApi(apiUrl);
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
  it('requests error log', () => {
    expect(`${apiUrl}/error_log`).toHaveBeenRequested();
  });
  it('creates parameters with log', () => {
    expect(subject.params(data)).toEqual({
      log: data.log
    });
  });
});