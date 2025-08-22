import '../helper/api_helper';
import MockPromises from "mock-promises";
import {
  resetLocal,
  resetSession,
  retrieveLocal,
  retrieveSession,
  storeLocal,
  storeSession
} from "../../src/storage/storage";


self.browser = null;
describe('Storage', () => {
  beforeEach((done) => {
    (async () => {
      MockPromises.reset();
      MockPromises.uninstall();
      done();
    })();
  });
  afterEach(() => {
    MockPromises.install(global.Promise);
    MockPromises.reset();
  });
  describe('storeLocal', () => {
    describe('when no existing value', () => {
      beforeEach((done) => {
        localStorage.clear();
        (async () => {
          await storeLocal('testString', 'test');
          await storeLocal('testObject', {test: 'test'});
          done();
        })();
      });
      it('then stores a string', (done) => {
        (async () => {
          expect(await localStorage.getItem('testString')).toEqual('"test"');
          expect(await localStorage.getItem('testObject')).toEqual('{"test":"test"}');
          done();
        })();
      });
    });
    describe('when existing value', () => {
      beforeEach((done) => {
        localStorage.clear();
        (async () => {
          await storeLocal('testString', 'test');
          await storeLocal('testString', 'testAltered');
          done();
        })();
      });
      it('then modifies value', (done) => {
        (async () => {
          expect(await localStorage.getItem('testString')).toEqual('"testAltered"');
          expect(await localStorage.getItem('testString')).not.toEqual('"test"');
          done();
        })();
      });
    });
  });
  describe('retrieveLocal', () => {
    describe('when no existing value', () => {
      beforeEach(() => {
        localStorage.clear()
      });
      it('then gets null', (done) => {
        (async () => {
          expect(await retrieveLocal('testString')).toBeNull();
          done();
        })();
      });
    });
    describe('when existing value', () => {
      beforeEach((done) => {
        localStorage.clear();
        (async () => {
          await storeLocal('testString', 'test');
          await storeLocal('testObject', {test: 'test'});
          done();
        })();
      });
      it('then retrieves values', (done) => {
        (async () => {
          expect(await retrieveLocal('testString')).toEqual('test');
          expect(await retrieveLocal('testObject')).toEqual({test: 'test'});
          done();
        })();
      });
    });
  });
  describe('resetLocal', () => {
    describe('when no existing value', () => {
      beforeEach((done) => {
        localStorage.clear();
        (async () => {
          await resetLocal('testString');
          done();
        })();
      });
      it('then gets null', (done) => {
        (async () => {
          expect(await retrieveLocal('testString')).toBeNull();
          done();
        })();
      });
    });
    describe('when existing value', () => {
      beforeEach((done) => {
        localStorage.clear();
        (async () => {
          await storeLocal('testString', 'test');
          await resetLocal('testString');
          done();
        })();
      });
      it('then gets null', (done) => {
        (async () => {
          expect(await retrieveLocal('testString')).toBeNull();
          done();
        })();
      })
    });
  });
  describe('storeSession', () => {
    describe('when no existing value', () => {
      beforeEach((done) => {
        sessionStorage.clear();
        (async () => {
          await storeSession('testString', 'test');
          await storeSession('testObject', {test: 'test'});
          done();
        })();
      });
      it('then stores a string', (done) => {
        (async () => {
          expect(await sessionStorage.getItem('testString')).toEqual('"test"');
          expect(await sessionStorage.getItem('testObject')).toEqual('{"test":"test"}');
          done();
        })();
      });
    });
    describe('when existing value', () => {
      beforeEach((done) => {
        sessionStorage.clear();
        (async () => {
          await storeSession('testString', 'test');
          await storeSession('testString', 'testAltered');
          done();
        })();
      });
      it('then modifies value', (done) => {
        (async () => {
          expect(await sessionStorage.getItem('testString')).toEqual('"testAltered"');
          expect(await sessionStorage.getItem('testString')).not.toEqual('"test"');
          done();
        })();
      });
    });
  });
  describe('retrieveSession', () => {
    describe('when no existing value', () => {
      beforeEach(() => {
        sessionStorage.clear()
      });
      it('then gets null', (done) => {
        (async () => {
          expect(await retrieveSession('testString')).toBeNull();
          done();
        })();
      });
    });
    describe('when existing value', () => {
      beforeEach((done) => {
        sessionStorage.clear();
        (async () => {
          await storeSession('testString', 'test');
          await storeSession('testObject', {test: 'test'});
          done();
        })();
      });
      it('then retrieves values', (done) => {
        (async () => {
          expect(await retrieveSession('testString')).toEqual('test');
          expect(await retrieveSession('testObject')).toEqual({test: 'test'});
          done();
        })();
      });
    });
  });
  describe('resetSession', () => {
    describe('when no existing value', () => {
      beforeEach((done) => {
        sessionStorage.clear();
        (async () => {
          await resetSession('testString');
          done();
        })();
      });
      it('then gets null', (done) => {
        (async () => {
          expect(await retrieveSession('testString')).toBeNull();
          done();
        })();
      });
    });
    describe('when existing value', () => {
      beforeEach((done) => {
        sessionStorage.clear();
        (async () => {
          await storeSession('testString', 'test');
          await resetSession('testString');
          done();
        })();
      });
      it('then gets null', (done) => {
        (async () => {
          expect(await retrieveSession('testString')).toBeNull();
          done();
        })();
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
      beforeEach((done) => {
        self.browser = {
          sessionStorage: session_,
          localStorage: local_
        };
        (async () => {
          await storeLocal('testing', 'helloWorld');
          await storeSession('testing', 'helloWorld');
          done();
        })();
      });
      it('then sets and gets', (done) => {
        (async () => {
          expect(await retrieveLocal('testing')).toEqual('helloWorld');
          expect(await retrieveSession('testing')).toEqual('helloWorld');
          done();
        })();
      });
      describe('when cleared', () => {
        beforeEach((done) => {
          (async () => {
            await resetSession('testing');
            await resetLocal('testing');
            done();
          })();
        });
        it('then cannot get', (done) => {
          (async () => {
            expect(await retrieveLocal('testing')).toBeNull();
            expect(await retrieveSession('testing')).toBeNull();
            done();
          })();
        });
      });
      afterEach(() => {
        self.browser = null;
      });
    });
    describe('when default node style', () => {
      beforeEach((done) => {
        (async () => {
          await storeLocal('testing', 'helloWorld');
          await storeSession('testing', 'helloWorld');
          done();
        })();
      });
      it('then sets and gets', (done) => {
        (async () => {
          expect(await retrieveLocal('testing')).toEqual('helloWorld');
          expect(await retrieveSession('testing')).toEqual('helloWorld');
          done();
        })();
      });
      describe('when cleared', () => {
        beforeEach((done) => {
          (async () => {
            await resetSession('testing');
            await resetLocal('testing');
            done();
          })();
        });
        it('then cannot get', (done) => {
          (async () => {
            expect(await retrieveLocal('testing')).toBeNull();
            expect(await retrieveSession('testing')).toBeNull();
            done();
          })();
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
})
;
