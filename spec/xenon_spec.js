/**
 * Created by lwoydziak on 09/27/21.
 */
/**
 * xenon_spec.js
 *
 * Testing: SDK for interacting with the Xenon View service.
 *
 */
import {_Xenon} from "../src/xenon";
import './helper/api_helper';
import {UnblockPromises} from "./helper/api_helper";


describe('View SDK', () => {
  let unit = null;
  let unit2 = null;
  let journeyApi = jasmine.createSpyObj('MyJourneyApi', ['fetch'])
  let JourneyApi = jasmine.createSpy('constructor').and.returnValue(journeyApi);
  let deanonApi = jasmine.createSpyObj('MyDeanonApi', ['fetch'])
  let DeanonApi = jasmine.createSpy('constructor').and.returnValue(deanonApi);
  let apiKey = "<token>";
  let apiUrl = "https://localhost";
  describe('when initialized', () => {
    it('then has default journey', () => {
      expect(JSON.stringify(unit.journey())).toContain(
        '[{"category":"Landing","action":"New session started","timestamp":'
      );
    });
    it('then has default id', () => {
      expect(unit.id()).not.toBeNull();
      expect(unit.id()).not.toEqual('');
    });
    describe('when id set', () => {
      let testId = '<some random uuid>';
      beforeEach(() => {
        unit.id(testId);
      });
      it('then has set id', () => {
        expect(unit.id()).toEqual(testId);
      });
      it('then persists id', () => {
        expect(sessionStorage.getItem('xenon-view')).toEqual(JSON.stringify(testId));
      });
    });
  });
  describe('when initialized and previous journey', () => {
    it('then has previous journey', () => {
      let journeyStr = JSON.stringify(unit.journey());
      expect(journeyStr).toContain(
        '[{"category":"Landing","action":"New session started","timestamp":'
      );
      expect(journeyStr).toContain(
        '{"category":"Page View","action":"test","timestamp":'
      );

    });
    beforeEach(() => {
      unit.pageView('test');
      unit = new _Xenon();
    });
  });
  describe('when initialized with a previous id', () => {
    let testId = '<some random uuid>';
    it('then has previous id', () => {
      expect(unit.id()).toEqual(testId);
    });
    beforeEach(() => {
      unit.id(testId);
      unit = new _Xenon();
    });
  });
  describe('when adding a page view', () => {
    let page = "test page";
    it('then has a journey with a page view', () => {
      let journeyStr = JSON.stringify(unit.journey());
      expect(journeyStr).toContain(
        '[{"category":"Landing","action":"New session started","timestamp":'
      );
      expect(journeyStr).toContain(
        '{"category":"Page View","action":"test page","timestamp":'
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
      let journeyStr = JSON.stringify(unit.journey());
      expect(journeyStr).toContain(
        '[{"category":"Landing","action":"New session started","timestamp":'
      );
      expect(journeyStr).toContain(
        '{"funnel":"<stage in funnel>","action":"<custom action>","timestamp":'
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
      let journeyStr = JSON.stringify(unit.journey());
      expect(journeyStr).toContain(
        '[{"category":"Landing","action":"New session started","timestamp":'
      );
      expect(journeyStr).toContain(
        '{"outcome":"<outcome>","action":"<custom action>","timestamp":'
      );
    });
    beforeEach(() => {
      unit.outcome(outcome, action);
    });
  });
  describe('when adding an event', () => {
    let event = {category: 'Event', action: 'test'};
    it('then has a journey with an event', () => {
      let journeyStr = JSON.stringify(unit.journey());
      expect(journeyStr).toContain(
        '[{"category":"Landing","action":"New session started","timestamp":'
      );
      expect(journeyStr).toContain(
        '{"category":"Event","action":"test","timestamp":'
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
                {category: 'Landing', action: 'New session started', timestamp: jasmine.any(Number)},
                {category: 'Event', action: 'test', timestamp: jasmine.any(Number)}
              ],
              token: apiKey,
              timestamp: jasmine.any(Number)
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
            let journeyStr = JSON.stringify(unit.journey());
            expect(journeyStr).toContain(
              '[{"category":"Landing","action":"New session started","timestamp":'
            );
            expect(journeyStr).toContain(
              '{"category":"Event","action":"test","timestamp":'
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
                {category: 'Landing', action: 'New session started', timestamp: jasmine.any(Number)},
                {category: 'Event', action: 'test', timestamp: jasmine.any(Number)}
              ],
              token: customKey,
              timestamp: jasmine.any(Number)
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
      let journeyStr = JSON.stringify(unit.journey());
      expect(journeyStr).toContain(
        '[{"category":"Landing","action":"New session started","timestamp":'
      );
      expect(journeyStr).toContain(
        '{"funnel":"funnel","action":"test","timestamp":'
      );
      expect(unit.journey().length).toEqual(2);
    });
    beforeEach(() => {
      unit.event(event);
      unit.event(event);
    });
  });
  describe('when adding generic event', () => {
    let event = {action: 'test'};
    it('then has a journey with a generic event', () => {
      let journeyStr = JSON.stringify(unit.journey());
      expect(journeyStr).toContain(
        '[{"category":"Landing","action":"New session started","timestamp":'
      );
      expect(journeyStr).toContain(
        '{"action":"test","category":"Event","timestamp":'
      );
    });
    beforeEach(() => {
      unit.event(event);
    });
  });
  describe('when adding custom event', () => {
    let event = {custom: 'test'};
    it('then has a journey with a generic event', () => {
      let journeyStr = JSON.stringify(unit.journey());
      expect(journeyStr).toContain(
        '[{"category":"Landing","action":"New session started","timestamp":'
      );
      expect(journeyStr).toContain(
        '{"action":{"custom":"test"},"category":"Event","timestamp":'
      );
    });
    beforeEach(() => {
      unit.event(event);
    });
  });
  describe('when adding an event after reset', () => {
    let event = {category: 'Event', action: 'test'};
    it('then has a journey with only event', () => {
      let journeyStr = JSON.stringify(unit.journey());
      expect(journeyStr).toContain(
        '[{"category":"Event","action":"test","timestamp":'
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
        let journeyStr = JSON.stringify(unit.journey());
        expect(journeyStr).toContain(
          '[{"category":"Landing","action":"New session started","timestamp":'
        );
        expect(journeyStr).toContain(
          '{"category":"Event","action":"test","timestamp":'
        );
      });
    });
    describe('when restoring after another event was added', () => {
      let anotherEvent = {category: 'Event', action: 'another'};
      it('then adds new event at end of previous journey', () => {
        let journeyStr = JSON.stringify(unit.journey());
        expect(journeyStr).toContain(
          '[{"category":"Landing","action":"New session started","timestamp":'
        );
        expect(journeyStr).toContain(
          '{"category":"Event","action":"test","timestamp":'
        );
        expect(journeyStr).toContain(
          '{"category":"Event","action":"another","timestamp":'
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
            token: apiKey,
            timestamp: jasmine.any(Number)
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
            token: customKey,
            timestamp: jasmine.any(Number)
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
    unit = new _Xenon(apiKey, apiUrl, JourneyApi, DeanonApi);
    unit2 = new _Xenon(apiKey, apiUrl, JourneyApi, DeanonApi);
  });
  afterEach(() => {
    unit = null;
    unit2 = null;
    localStorage.clear();
    sessionStorage.clear();
  });
});