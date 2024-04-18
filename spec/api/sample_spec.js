import SampleApi from "../../src/api/sample";
require('../helper/api_helper');
import {UnblockPromises} from "../helper/api_helper";

describe('SampleApi', () => {
  let subject;
  const apiUrl = 'https://app.xenonview.com';
  const data = {id: 'somevalue', token: "<testToken>"};
  beforeEach(() => {
    subject = new SampleApi(apiUrl);
    subject.fetch({data});
    UnblockPromises();
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