import '../../helper/api_helper';
import {UnblockPromises} from "../../helper/api_helper";
import {fetchJson} from '../../../src/api/fetch/json';
import MockPromises from "mock-promises";


describe('fetchJson', () => {
  let doneSpy, failSpy, request;
  describe('when default fetch', () => {
    beforeEach((done) => {
      (async () => {
        MockPromises.reset();
        doneSpy = jasmine.createSpy('done');
        failSpy = jasmine.createSpy('fail');
        fetchJson('http://localhost',).then(doneSpy, failSpy);
        request = jasmine.Ajax.requests.mostRecent();
        done();
      })();
    });
    it('requests base url', () => {
      expect(`http://localhost`).toHaveBeenRequestedWith({
        'method': 'GET',
        'url': 'http://localhost',
        'data': {},
        'requestHeaders': {
          'accept': 'application/json'
        }
      });
    });
    describe('when the request is successful', () => {
      let response;
      beforeEach(() => {
        response = [{'result': 'success'}];
        request.succeed(response);
        UnblockPromises();
      });
      it('resolves the promise with the response', () => {
        expect(doneSpy).toHaveBeenCalledWith(response);
      });
    });
    describe('when the request is not successful', () => {
      beforeEach(() => {
        request.fail();
        UnblockPromises();
      });
      it('rejects the promise', () => {
        expect(failSpy).toHaveBeenCalled();
      });
    })
    describe('when the request unauthorized', () => {
      let response;
      beforeEach(() => {
        response = {'error_message': 'unauthorized'};
        request.unauthorized(response);
        UnblockPromises();
      });
      it('rejects the promise', () => {
        const error = new Error('unauthorized');
        expect(failSpy).toHaveBeenCalledWith(error);
        expect(failSpy.calls.mostRecent().args[0].authIssue).toBeTrue();
      });
    });
    describe('when the request generally errors', () => {
      const errorString = 'Service Unavailable';
      beforeEach(() => {
        request.generic(503, errorString, {});
        UnblockPromises();
      });
      it('rejects the promise', () => {
        const error = new Error('Service Unavailable');
        expect(failSpy).toHaveBeenCalledWith(error);
      });
    });
    describe('when the request has no data', () => {
      beforeEach(() => {
        request.generic(204, "No Content", {});
        UnblockPromises();
      });
      it('resolves the promise with the response', () => {
        expect(doneSpy).toHaveBeenCalled();
      });
    });
    describe('when the request errors', () => {
      beforeEach(() => {
        request.networkError();
        UnblockPromises();
      });
      it('rejects the promise', () => {
        const error = new Error('Your internet connection appears to have gone down.');
        expect(failSpy).toHaveBeenCalledWith(error);
      });
    });
  });
  describe('when authorized fetch', () => {
    let token = '<token>';
    beforeEach(() => {
      doneSpy = jasmine.createSpy('done');
      failSpy = jasmine.createSpy('fail');
      fetchJson('http://localhost', {accessToken: token}).then(doneSpy, failSpy);
      request = jasmine.Ajax.requests.mostRecent();
    });
    it('requests base url with authorization header', () => {
      expect(`http://localhost`).toHaveBeenRequestedWith({
        'method': 'GET',
        'url': 'http://localhost',
        'data': {},
        'requestHeaders': {
          'accept': 'application/json',
          'authorization': 'Bearer ' + token
        }
      });
    });
  });
});