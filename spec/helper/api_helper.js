require('jasmine-ajax');
const Bluebird = require('bluebird');
const MockPromises = require("mock-promises");
const MockFetch = require("../api/fetch/mock_fetch");

Bluebird.prototype.catch = function(...args) {
  return Bluebird.prototype.then.call(this, i => i, ...args);
};
global.Promise = Bluebird;

export function UnblockPromises() {
  jasmine.clock().tick(1);
  MockPromises.tickAllTheWay();
}
export function ImmediatelyResolvePromise(number) {
  jasmine.clock().tick(1);
  MockPromises.immediateResolve(number);
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

          const stringifiedQueryParams = requestsQueryParams.map(p => JSON.stringify(p)).join(',\n');
          const actualRequestsQueriesMessage = (requests.length === 0) ? ', but it was never requested.' : `, but it was not. Actual requests had query parameters: \n${stringifiedQueryParams}`;

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
            jasmine.Ajax.requests.count() === 0 ? `Expected ${actual} to have been requested with\n\n${JSON.stringify(options, null, 5)}\n\nbut it was not requested.` :
              `Expected ${actual} to have been requested with\n\n${JSON.stringify(options, null, 5)};\n\nactual requests were\n\n${jasmine.Ajax.requests.filter(/.*/).map(function (req) {
                return `${JSON.stringify({
                  method: req.method,
                  url: req.url,
                  data: req.data && req.data(),
                  requestHeaders: req.requestHeaders
                }, null, 5)}`;
              }).join(',\n\n')}`;
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