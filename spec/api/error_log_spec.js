import ErrorLogApi from "../../src/api/error_log";
require('../helper/api_helper');
import {UnblockPromises} from "../helper/api_helper";

describe('ErrorLogApi', () => {
  let subject;
  const apiUrl = 'https://app.xenonview.com';
  let data = {log: ["<line>"], token: "<testToken>"};
  beforeEach(() => {
    subject = new ErrorLogApi(apiUrl);
    subject.fetch({data});
    UnblockPromises();
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