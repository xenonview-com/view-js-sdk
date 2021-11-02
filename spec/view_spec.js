/**
 * Created by lwoydziak on 09/27/21.
 */
/**
 * view.js
 *
 * Testing: SDK for interacting with the Xenon View service.
 *
 */
import {_View} from "../src/view";
import './helper/api_helper';
import {UnblockPromises} from "./helper/api_helper";



describe('View SDK', () => {
  let unit = null;
  let journeyApi = jasmine.createSpyObj('MyJourneyApi', ['fetch'])
  let JourneyApi = jasmine.createSpy('constructor').and.returnValue(journeyApi);
  let deanonApi = jasmine.createSpyObj('MyDeanonApi', ['fetch'])
  let DeanonApi = jasmine.createSpy('constructor').and.returnValue(deanonApi);
  let apiKey = "<token>";
  let apiUrl = "https://localhost";
  describe('when initialized', () => {
    it('then has default journey', () => {
      expect(JSON.stringify(unit.journey())).toEqual(
        '[{"category":"Landing","action":"New session started"}]'
      );
    });
  });
  describe('when initialized and previous journey', () => {
    it('then has previous journey', () => {
      expect(JSON.stringify(unit.journey())).toEqual(
        '[{"category":"Landing","action":"New session started"},' +
        '{"category":"Page View","action":"test"}]'
      );
    });
    beforeEach(() => {
      unit.pageView('test');
      unit = new _View();
    });
  });
  describe('when adding a page view', () => {
    let page = "test page";
    it('then has a journey with a page view', () => {
      expect(JSON.stringify(unit.journey())).toEqual(
        '[{"category":"Landing","action":"New session started"},' +
        '{"category":"Page View","action":"test page"}]'
      );
    });
    beforeEach(() => {
      unit.pageView(page);
    });
  });
  describe('when adding a funnel stage', () => {
    let stage = "<stage in funnel>";
    let action = "<custom action>";
    it('then has a journey with a funnel stage', () => {
      expect(JSON.stringify(unit.journey())).toEqual(
        '[{"category":"Landing","action":"New session started"},' +
        '{"funnel":"<stage in funnel>","action":"<custom action>"}]'
      );
    });
    beforeEach(() => {
      unit.funnel(stage, action);
    });
  });
  describe('when adding an outcome', () => {
    let outcome = "<outcome>";
    let action = "<custom action>";
    it('then adds an outcome to journey', () => {
      expect(JSON.stringify(unit.journey())).toEqual(
        '[{"category":"Landing","action":"New session started"},' +
        '{"outcome":"<outcome>","action":"<custom action>"}]'
      );
    });
    beforeEach(() => {
      unit.outcome(outcome, action);
    });
  });
  describe('when adding an event', () => {
    let event = {category: 'Event', action: 'test'};
    it('then has a journey with an event', () => {
      expect(JSON.stringify(unit.journey())).toEqual(
        '[{"category":"Landing","action":"New session started"},' +
        '{"category":"Event","action":"test"}]'
      );
    });
    describe('when committing a journey', () => {
      describe('when default', () => {
        it('then calls the view journey API', () => {
          expect(JourneyApi).toHaveBeenCalledWith(apiUrl);
          expect(journeyApi.fetch).toHaveBeenCalledWith({
            data: {
              id: jasmine.any(String),
              journey: [
                {category: 'Landing', action: 'New session started'},
                {category: 'Event', action: 'test'}
              ],
              token: apiKey
            }
          });
        });
        it('then resets journey', () => {
          expect(JSON.stringify(unit.journey())).toEqual('null');
        });
        let resolvePromise = null;
        let rejectPromise = null;
        describe('when API fails', () => {
          it('then restores journey', () => {
            expect(JSON.stringify(unit.journey())).toEqual(
              '[{"category":"Landing","action":"New session started"},' +
              '{"category":"Event","action":"test"}]'
            );
          });
          beforeEach(() => {
            rejectPromise(new Error('failure'));
            UnblockPromises();
          });
        });
        beforeEach(() => {
          let promise = new Promise(function (resolve, reject) {
            resolvePromise = resolve;
            rejectPromise = reject;
          });
          journeyApi.fetch.and.returnValue(promise);
          unit.commit();
        });
      });
      describe('when custom', () => {
        let customKey = '<custom>';
        it('then calls the view journey API', () => {
          expect(journeyApi.fetch).toHaveBeenCalledWith({
            data: {
              id: jasmine.any(String),
              journey: [
                {category: 'Landing', action: 'New session started'},
                {category: 'Event', action: 'test'}
              ],
              token: customKey
            }
          });
        });
        beforeEach(() => {
          let promise = new Promise(function (resolve, reject) {});
          journeyApi.fetch.and.returnValue(promise);
          unit.init(apiKey=customKey);
          unit.commit();
        });
      });
    });
    beforeEach(() => {
      unit.event(event);
    });
  });
  describe('when adding duplicate event', () => {
    let event = {funnel: 'funnel', action: 'test'};
    it('then has a journey with a single event', () => {
      expect(JSON.stringify(unit.journey())).toEqual(
        '[{"category":"Landing","action":"New session started"},' +
        '{"funnel":"funnel","action":"test"}]'
      );
    });
    beforeEach(() => {
      unit.event(event);
      unit.event(event);
    });
  });
  describe('when adding generic event', () => {
    let event = {action: 'test'};
    it('then has a journey with a generic event', () => {
      expect(JSON.stringify(unit.journey())).toEqual(
        '[{"category":"Landing","action":"New session started"},' +
        '{"action":"test"}]'
      );
    });
    beforeEach(() => {
      unit.event(event);
    });
  });
  describe('when adding an event after reset', () => {
    let event = {category: 'Event', action: 'test'};
    it('then has a journey with only event', () => {
      expect(JSON.stringify(unit.journey())).toEqual(
        '[{"category":"Event","action":"test"}]'
      );
    });
    beforeEach(() => {
      unit.reset();
      unit.event(event);
    });
  });
  describe('when resetting', () => {
    let event = {category: 'Event', action: 'test'};
    describe('when restoring', () => {
      beforeEach(() => {
        unit.restore();
      });
      it('then has a journey with added event', () => {
        expect(JSON.stringify(unit.journey())).toEqual(
          '[{"category":"Landing","action":"New session started"},' +
          '{"category":"Event","action":"test"}]'
        );
      });
    });
    describe('when restoring after another event was added', () => {
      let anotherEvent = {category: 'Event', action: 'another'};
      it('then adds new event at end of previous journey', () => {
        expect(JSON.stringify(unit.journey())).toEqual(
          '[{"category":"Landing","action":"New session started"},' +
          '{"category":"Event","action":"test"},' +
          '{"category":"Event","action":"another"}]'
        );
      });
      beforeEach(() => {
        unit.event(anotherEvent);
        unit.restore();
      });
    });
    beforeEach(() => {
      unit.event(event);
      unit.reset();
    });
  });
  describe('when deanonymizing', () => {
    let person = {name:'Test User', email: 'test@example.com'};
    describe('when default', () => {
      it('then calls the view deanon API', () => {
        expect(DeanonApi).toHaveBeenCalledWith(apiUrl);
        expect(deanonApi.fetch).toHaveBeenCalledWith({
          data: {
            id: jasmine.any(String),
            person: person,
            token: apiKey
          }
        });
      });
      beforeEach(() => {
        let promise = new Promise(function (resolve, reject) {});
        deanonApi.fetch.and.returnValue(promise);
        unit.deanonymize(person);
      });
    });
    describe('when custom', () => {
      let customKey = '<custom>';
      it('then calls the view journey API', () => {
        expect(deanonApi.fetch).toHaveBeenCalledWith({
          data: {
            id: jasmine.any(String),
            person: person,
            token: customKey
          }
        });
      });
      beforeEach(() => {
        let promise = new Promise(function (resolve, reject) {});
        deanonApi.fetch.and.returnValue(promise);
        unit.init(apiKey=customKey);
        unit.deanonymize(person);
      });
    });
  });
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    unit = new _View(apiKey, apiUrl, JourneyApi, DeanonApi);
  });
  afterEach(() => {
    unit = null;
    localStorage.clear();
    sessionStorage.clear();
  });
});