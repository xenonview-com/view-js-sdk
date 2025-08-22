import DeanonApi from "../../src/api/deanonymize";
import {ImmediatelyResolvePromise, UnblockPromises} from "../helper/api_helper";
import MockPromises from "mock-promises";

require('../helper/api_helper');

describe('DeanonApi', () => {
  let subject;
  const apiUrl = 'https://app.xenonview.com';
  let dataWithoutPerson = {id: 'somevalue', token: "<testToken>", timestamp: 0.1}
  let dataWithPerson = {...dataWithoutPerson, person: {name: 'Test Name', email: 'test@example.com'}};
  beforeEach((done) => {
    (async () => {
      MockPromises.reset();
      subject = new DeanonApi(apiUrl);
      const data = dataWithPerson;
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
  it('requests deanonymize', () => {
    expect(`${apiUrl}/deanonymize`).toHaveBeenRequested();
  });
  it('creates parameters with person', () => {
    expect(subject.params(dataWithPerson)).toEqual({
      uuid: 'somevalue',
      person: {name: 'Test Name', email: 'test@example.com'},
      timestamp: jasmine.any(Number)
    });
  });
  it('throws when no person', () => {
    expect(() => subject.params(dataWithoutPerson)).toThrow(
      new Error("No person data received.")
    )
  });
});