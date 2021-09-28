/**
 * Created by lwoydziak on 09/27/21.
 */
/**
 * view.js
 *
 * Testing: SDK for interacting with the Xenon View service.
 *
 */
import View from "../src/view";

describe('View SDK', () => {
  let unit = null;


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
      unit = new View();
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


  describe('when adding an event', () => {
    let event = {category: 'Event', action: 'test'};
    it('then has a journey with an event', () => {
      expect(JSON.stringify(unit.journey())).toEqual(
        '[{"category":"Landing","action":"New session started"},' +
        '{"category":"Event","action":"test"}]'
      );
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

  describe('when restoring after reset', () => {
    let event = {category: 'Event', action: 'test'};
    it('then has a journey with added event', () => {
      expect(JSON.stringify(unit.journey())).toEqual(
        '[{"category":"Landing","action":"New session started"},' +
        '{"category":"Event","action":"test"}]'
      );
    });
    beforeEach(() => {
      unit.event(event);
      unit.reset();
      unit.restore();
    });
  });

  beforeEach(() => {
    localStorage.clear();
    unit = new View();
  });

  afterEach(() => {
    unit = null;
    localStorage.clear();
  });
});