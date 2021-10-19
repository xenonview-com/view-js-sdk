import {
  resetLocal,
  resetSession,
  retrieveLocal,
  retrieveSession,
  storeLocal,
  storeSession
} from "../../src/storage/storage";

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
      sessionStorage.clear()
      storeSession('testString', 'test');
      resetSession('testString');
    });
    it('then gets null', () => {
      expect(retrieveSession('testString')).toBeNull();
    })
  });
});

