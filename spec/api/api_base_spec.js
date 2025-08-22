import ApiBase from '../../src/api/api_base';
import {ImmediatelyResolvePromise, UnblockPromises} from "../helper/api_helper";

const MockPromises = require("mock-promises");
require('../helper/api_helper');

describe('ApiBase', () => {
  let Subject;
  let doneSpy, failSpy, request;
  const apiUrl = 'https://app.xenonview.com';
  beforeEach((done) => {
    (async () => {
      MockPromises.reset();
      Subject = ApiBase;
      done();
    })();
  });
  afterEach(() => {
    UnblockPromises();
    ImmediatelyResolvePromise(0);
  });
  describe('when calling fetch with default api', () => {
    beforeEach(() => {
      let subject = new Subject({apiUrl: apiUrl});
      doneSpy = jasmine.createSpy('done');
      failSpy = jasmine.createSpy('fail');
      subject.fetch({data: {}}).then(doneSpy, failSpy);
      request = jasmine.Ajax.requests.mostRecent();
    });
    it('requests base url', () => {
      expect(`${apiUrl}/`).toHaveBeenRequestedWith({
        'method': 'POST',
        'url': `${apiUrl}/`,
        'data': {
          'parameters': {},
          'name': 'ApiBase'
        },
        'requestHeaders': {
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      });
    });
  });
  describe('when calling fetch with api parameters', () => {
    beforeEach(() => {
      let params = {
        name: 'name',
        method: 'OPTIONS',
        headers: {header: 'header', 'content-type': 'application/json'},
        url: 'url',
        apiUrl: apiUrl
      };
      let subject = new Subject(params);
      doneSpy = jasmine.createSpy('done');
      failSpy = jasmine.createSpy('fail');
      subject.fetch({data: {}}).then(doneSpy, failSpy);
    });
    it('requests custom url', () => {
      expect(`${apiUrl}/url`).toHaveBeenRequestedWith({
        'method': 'OPTIONS',
        'url': `${apiUrl}/url`,
        'data': {
          'name': 'name',
          'parameters': {}
        },
        'requestHeaders': {
          'accept': 'application/json',
          'content-type': 'application/json',
          'header': 'header'
        }
      });
    });
  });
  describe('when calling fetch with authentication', () => {
    describe('when token', () => {
      beforeEach(() => {
        let params = {
          authenticated: true
        };
        let subject = new Subject(params);
        doneSpy = jasmine.createSpy('done');
        failSpy = jasmine.createSpy('fail');
        subject.fetch({data: {token: '<anAccessToken>'}}).then(doneSpy, failSpy);
      });

      it('requests url', () => {
        expect(`${apiUrl}/`).toHaveBeenRequestedWith({
          'method': 'POST',
          'url': `${apiUrl}/`,
          'data': {
            'parameters': {},
            'name': 'ApiBase'
          },
          'requestHeaders': {
            'accept': 'application/json',
            'authorization': 'Bearer <anAccessToken>',
            'content-type': 'application/json'
          }
        });
      });
    });
    describe('when no token', () => {
      beforeEach(() => {
        let params = {
          authenticated: true
        };
        let subject = new Subject(params);
        doneSpy = jasmine.createSpy('done');
        failSpy = jasmine.createSpy('fail');
        subject.fetch({data: {}}).then(doneSpy, failSpy);
        UnblockPromises();
      });
      it('rejects the promise', () => {
        expect(failSpy).toHaveBeenCalled();
      });
    });
  });
  describe('when calling fetch with no body and get method', () => {
    beforeEach(() => {
      let params = {
        method: 'GET',
        skipName: true,
        headers: {}
      };
      let subject = new Subject(params);
      subject.fetch();
    });

    it('requests url', () => {
      expect(`${apiUrl}/`).toHaveBeenRequestedWith({
        'method': 'GET',
        'url': `${apiUrl}/`,
        'requestHeaders': {
          'accept': 'application/json',
        }
      });
    });
  });
  describe('when calling fetch with custom host', () => {
    beforeEach(() => {
      let params = {
        apiUrl: 'https://example.com',
      };
      let subject = new Subject(params);
      subject.fetch();
    });

    it('requests url', () => {
      expect('https://example.com/').toHaveBeenRequested();
    });
  });
  describe('when calling fetch with no name', () => {
    let params_ = {'hello': 'world'};
    beforeEach(() => {
      class TestApi extends ApiBase {
        constructor() {
          super({
            skipName: true
          });
        }

        params(data) {
          return params_;
        }
      }

      let subject = new TestApi();
      subject.fetch();
    });
    it('requests base url with no name', () => {
      expect(`${apiUrl}/`).toHaveBeenRequestedWith({
        'method': 'POST',
        'url': `${apiUrl}/`,
        'data': {
          'parameters': params_
        },
        'requestHeaders': {
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      });
    });
  });
  describe('when calling fetch and params throws error', () => {
    class TestApi extends ApiBase {
      params(data) {
        throw (Error('This is a test!'));
      }
    }

    beforeEach(() => {
      let subject = new TestApi();
      doneSpy = jasmine.createSpy('done');
      failSpy = jasmine.createSpy('fail');
      subject.fetch({data: {}}).then(doneSpy, failSpy);
      UnblockPromises();
    });
    it('rejects the promise', () => {
      expect(failSpy).toHaveBeenCalled();
    });
  });
});