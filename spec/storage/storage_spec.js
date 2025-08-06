import {
  resetLocal,
  resetSession,
  retrieveLocal,
  retrieveSession,
  storeLocal,
  storeSession
} from "../../src/storage/storage";

globalThis.api = null;

describe('storeLocal', () => {
  describe('when no existing value', () => {
    beforeEach(() => {
      localStorage.clear();
      storeLocal('testString', 'test');
      storeLocal('testObject', {test: 'test'});
    });
    it('then stores a string', () => {
      expect(localStorage.getItem('testString')).toEqual('"test"');
      expect(localStorage.getItem('testObject')).toEqual('{"test":"test"}');
    });
  });
  describe('when existing value', () => {
    beforeEach(() => {
      localStorage.clear();
      storeLocal('testString', 'test');
      storeLocal('testString', 'testAltered');
    });
    it('then modifies value', () => {
      expect(localStorage.getItem('testString')).toEqual('"testAltered"');
      expect(localStorage.getItem('testString')).not.toEqual('"test"');
    });
  });
});
describe('retrieveLocal', () => {
  describe('when no existing value', () => {
    beforeEach(() => {
      localStorage.clear()
    });
    it('then gets null', () => {
      expect(retrieveLocal('testString')).toBeNull();
    });
  });
  describe('when existing value', () => {
    beforeEach(() => {
      localStorage.clear();
      storeLocal('testString', 'test');
      storeLocal('testObject', {test: 'test'});
    });
    it('then retrieves values', () => {
      expect(retrieveLocal('testString')).toEqual('test');
      expect(retrieveLocal('testObject')).toEqual({test: 'test'});
    });
  });
});
describe('resetLocal', () => {
  describe('when no existing value', () => {
    beforeEach(() => {
      localStorage.clear();
      resetLocal('testString');
    });
    it('then gets null', () => {
      expect(retrieveLocal('testString')).toBeNull();
    });
  });
  describe('when existing value', () => {
    beforeEach(() => {
      localStorage.clear()
      storeLocal('testString', 'test');
      resetLocal('testString');
    });
    it('then gets null', () => {
      expect(retrieveLocal('testString')).toBeNull();
    })
  });
});

describe('storeSession', () => {
  describe('when no existing value', () => {
    beforeEach(() => {
      sessionStorage.clear();
      storeSession('testString', 'test');
      storeSession('testObject', {test: 'test'});
    });
    it('then stores a string', () => {
      expect(sessionStorage.getItem('testString')).toEqual('"test"');
      expect(sessionStorage.getItem('testObject')).toEqual('{"test":"test"}');
    });
  });
  describe('when existing value', () => {
    beforeEach(() => {
      sessionStorage.clear();
      storeSession('testString', 'test');
      storeSession('testString', 'testAltered');
    });
    it('then modifies value', () => {
      expect(sessionStorage.getItem('testString')).toEqual('"testAltered"');
      expect(sessionStorage.getItem('testString')).not.toEqual('"test"');
    });
  });
});
describe('retrieveSession', () => {
  describe('when no existing value', () => {
    beforeEach(() => {
      sessionStorage.clear()
    });
    it('then gets null', () => {
      expect(retrieveSession('testString')).toBeNull();
    });
  });
  describe('when existing value', () => {
    beforeEach(() => {
      sessionStorage.clear();
      storeSession('testString', 'test');
      storeSession('testObject', {test: 'test'});
    });
    it('then retrieves values', () => {
      expect(retrieveSession('testString')).toEqual('test');
      expect(retrieveSession('testObject')).toEqual({test: 'test'});
    });
  });
});
describe('resetSession', () => {
  describe('when no existing value', () => {
    beforeEach(() => {
      sessionStorage.clear();
      resetSession('testString');
    });
    it('then gets null', () => {
      expect(retrieveSession('testString')).toBeNull();
    });
  });
  describe('when existing value', () => {
    beforeEach(() => {
      sessionStorage.clear();
      storeSession('testString', 'test');
      resetSession('testString');
    });
    it('then gets null', () => {
      expect(retrieveSession('testString')).toBeNull();
    })
  });
});
describe('when non browser style session/local storage', () => {
  let session_;
  let local_;
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    session_ = global.sessionStorage;
    local_ = global.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: null
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: null
    });
  });
  describe('when shopify style', () => {
    beforeEach(() => {
      globalThis.api = {browser: {
        sessionStorage: session_,
        localStorage: local_
      }};
      storeLocal('testing', 'helloWorld');
      storeSession('testing', 'helloWorld');
    });
    it('then sets and gets', () => {
      expect(retrieveLocal('testing')).toEqual('helloWorld');
      expect(retrieveSession('testing')).toEqual('helloWorld');
    });
    describe('when cleared', () => {
      beforeEach(() => {
        resetSession('testing');
        resetLocal('testing');
      });
      it('then cannot get', () => {
        expect(retrieveLocal('testing')).toBeNull();
        expect(retrieveSession('testing')).toBeNull();
      });
    });
    afterEach(() => {
      globalThis.api = null;
    });
  });
  describe('when default node style', () => {
    beforeEach(() => {
      storeLocal('testing', 'helloWorld');
      storeSession('testing', 'helloWorld');
    });
    it('then sets and gets', () => {
      expect(retrieveLocal('testing')).toEqual('helloWorld');
      expect(retrieveSession('testing')).toEqual('helloWorld');
    });
    describe('when cleared', () => {
      beforeEach(() => {
        resetSession('testing');
        resetLocal('testing');
      });
      it('then cannot get', () => {
        expect(retrieveLocal('testing')).toBeNull();
        expect(retrieveSession('testing')).toBeNull();
      });
    });
  });
  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: local_
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: session_
    });
  });
});

