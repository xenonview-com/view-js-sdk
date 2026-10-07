require('jasmine-ajax');
const Bluebird = require('bluebird');
const MockPromises = require("mock-promises");
const qs = require('querystring');
const MockFetch = require("../api/fetch/mock_fetch");

Bluebird.prototype.catch = function(...args) {
  return Bluebird.prototype.then.call(this, i => i, ...args);
};
global.Promise = Bluebird;

class SettledPromises {
  static enabled = false;

  static settled(promise) {
    if (promise._returnedMockPromise) return SettledPromises.settled(promise._returnedMockPromise);
    return [promise.isFulfilled(), promise.isRejected()].some(Boolean);
  }

  static execute(promise) {
    if (SettledPromises.enabled) SettledPromises.executeSettled(promise);
  }

  static executeSettled(promise) {
    if (SettledPromises.settled(promise)) MockPromises.executeForPromise(promise);
  }

  static install() {
    const mockedThen = global.Promise.prototype.then;
    global.Promise.prototype.then = function(...args) {
      MockPromises.immediateResolveDisabled();
      const next = mockedThen.apply(this, args);
      SettledPromises.execute(this);
      return next;
    };
  }
}

export function EnableSettledPromises() {
  SettledPromises.install();
}

export function UnblockPromises() {
  jasmine.clock().tick(1);
  MockPromises.tickAllTheWay();
}
export function ImmediatelyResolvePromise(number) {
  jasmine.clock().tick(1);
  SettledPromises.enabled = number > 0;
  MockPromises.immediateResolve(number);
}

export function ImmediatelyResolveAllPromises() {
  jasmine.clock().tick(1);
  SettledPromises.enabled = true;
  MockPromises.immediateResolveAll();
}

export function ResetImmediatelyResolvePromises() {
  jasmine.clock().tick(1);
  SettledPromises.enabled = false;
  MockPromises.immediateResolveDisabled();
}

class RequestMessages {
  static queryDetails(queries) {
    return queries.length === 0 ? ', but it was never requested.' :
      `, but it was not. Actual requests had query parameters: \n${queries.map(query => JSON.stringify(query)).join('\n')}`;
  }

  static requestDetails(actual, options) {
    const prefix = `Expected ${actual} to have been requested with\n\n${JSON.stringify(options, null, 5)}`;
    if (jasmine.Ajax.requests.count() === 0) return `${prefix}\n\nbut it was not requested.`;
    const requests = jasmine.Ajax.requests.filter(/.*/).map(req => JSON.stringify({
      method: req.method, url: req.url, data: req.data && req.data(), requestHeaders: req.requestHeaders
    }, null, 5)).join(',\n\n');
    return `${prefix};\n\nactual requests were\n\n${requests}`;
  }
}

beforeAll(() => {
  MockFetch.install();
});

afterAll(() => {
  MockFetch.uninstall();
});

beforeEach(() => {
  MockPromises.install(global.Promise);
  MockPromises.reset();
  jasmine.clock().install();
  jasmine.Ajax.install();
  Object.assign(XMLHttpRequest.prototype, {
    succeed(data = {}, options = {}) {
      const text = data ? JSON.stringify(data) : '';
      this.respondWith(Object.assign({status: 200, responseText: text, body: text}, options));
    },
    fail(data, options = {}) {
      this.respondWith(Object.assign({status: 400, responseText: JSON.stringify(data)}, options));
    },
    unauthorized(data, options = {}) {
      this.respondWith(Object.assign({status: 401, responseText: JSON.stringify(data)}, options));
    },
    generic(status, statusText, data, options = {}) {
      this.respondWith(Object.assign({status: status, statusText: statusText,responseText: JSON.stringify(data)}, options));
    },
    networkError() {
      this.onerror(null);
    }
  });
  jasmine.addMatchers({
    toHaveBeenRequested() {
      return {
        compare(actual) {
          const pass = jasmine.Ajax.requests.filter(new RegExp(actual)).length > 0;
          const allRequests = jasmine.Ajax.requests.filter(() => true).map(({url}) => url);
          const message = pass ? `Expected ${actual} not to have been requested, but it was.` :
            `Expected ${actual} to have been requested, but it was not.
             Actual requests are ${JSON.stringify(allRequests)}`;
          return {pass, message};
        }
      };
    },

    toHaveBeenRequestedWithQuery(matchersUtil) {
      return {
        compare(actual, query) {
          const requests = jasmine.Ajax.requests.filter(new RegExp(actual));
          query = Object.keys(query).reduce((memo, key) => (memo[key] = query[key].toString(), memo), {});
          const pass = requests.some(request => {
            return request.url.includes('?') && matchersUtil.equals(qs.parse(request.url.replace(/.*\?(.*)$/, '$1')), jasmine.objectContaining(query));
          });

          const requestsQueryParams = requests.map(request => {
            return qs.parse(request.url.replace(/.*\?(.*)$/, '$1'));
          });

          const actualRequestsQueriesMessage = RequestMessages.queryDetails(requestsQueryParams);

          const message = pass ? `Expected ${actual} not to have been requested with query parameters ${JSON.stringify(query)}, but it was.` :
            `Expected ${actual} to have been requested with query parameters ${JSON.stringify(query)}${actualRequestsQueriesMessage}`;
          return {pass, message};
        }
      };
    },

    toHaveBeenRequestedWith(matchersUtil) {
      return {
        compare(actual, options) {
          const requests = jasmine.Ajax.requests.filter(new RegExp(actual));
          const pass = requests.some(request => {
            return Object.keys(options).every(k => {
              const observed = typeof request[k] === 'function' ? request[k]() : request[k];
              return matchersUtil.equals(observed, options[k]);
            });
          });
          options.url = actual;

          const message = pass ?
            `Expected ${actual} not to have been requested with\n\n${JSON.stringify(options, null, 5)}` :
            RequestMessages.requestDetails(actual, options);
          return {pass, message};
        }
      };
    }
  });
});

afterEach(() => {
  UnblockPromises();
  MockPromises.uninstall();
  jasmine.clock().uninstall();
  jasmine.Ajax.uninstall();
});