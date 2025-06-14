var Xenon = (function () {
            'use strict';

            var global$1 = (typeof global !== "undefined" ? global :
                        typeof self !== "undefined" ? self :
                        typeof window !== "undefined" ? window : {});

            /* eslint-disable no-prototype-builtins */
            var g =
              (typeof globalThis !== 'undefined' && globalThis) ||
              (typeof self !== 'undefined' && self) ||
              // eslint-disable-next-line no-undef
              (typeof global$1 !== 'undefined' && global$1) ||
              {};

            var support = {
              searchParams: 'URLSearchParams' in g,
              iterable: 'Symbol' in g && 'iterator' in Symbol,
              blob:
                'FileReader' in g &&
                'Blob' in g &&
                (function() {
                  try {
                    new Blob();
                    return true
                  } catch (e) {
                    return false
                  }
                })(),
              formData: 'FormData' in g,
              arrayBuffer: 'ArrayBuffer' in g
            };

            function isDataView(obj) {
              return obj && DataView.prototype.isPrototypeOf(obj)
            }

            if (support.arrayBuffer) {
              var viewClasses = [
                '[object Int8Array]',
                '[object Uint8Array]',
                '[object Uint8ClampedArray]',
                '[object Int16Array]',
                '[object Uint16Array]',
                '[object Int32Array]',
                '[object Uint32Array]',
                '[object Float32Array]',
                '[object Float64Array]'
              ];

              var isArrayBufferView =
                ArrayBuffer.isView ||
                function(obj) {
                  return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
                };
            }

            function normalizeName(name) {
              if (typeof name !== 'string') {
                name = String(name);
              }
              if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
                throw new TypeError('Invalid character in header field name: "' + name + '"')
              }
              return name.toLowerCase()
            }

            function normalizeValue(value) {
              if (typeof value !== 'string') {
                value = String(value);
              }
              return value
            }

            // Build a destructive iterator for the value list
            function iteratorFor(items) {
              var iterator = {
                next: function() {
                  var value = items.shift();
                  return {done: value === undefined, value: value}
                }
              };

              if (support.iterable) {
                iterator[Symbol.iterator] = function() {
                  return iterator
                };
              }

              return iterator
            }

            function Headers(headers) {
              this.map = {};

              if (headers instanceof Headers) {
                headers.forEach(function(value, name) {
                  this.append(name, value);
                }, this);
              } else if (Array.isArray(headers)) {
                headers.forEach(function(header) {
                  if (header.length != 2) {
                    throw new TypeError('Headers constructor: expected name/value pair to be length 2, found' + header.length)
                  }
                  this.append(header[0], header[1]);
                }, this);
              } else if (headers) {
                Object.getOwnPropertyNames(headers).forEach(function(name) {
                  this.append(name, headers[name]);
                }, this);
              }
            }

            Headers.prototype.append = function(name, value) {
              name = normalizeName(name);
              value = normalizeValue(value);
              var oldValue = this.map[name];
              this.map[name] = oldValue ? oldValue + ', ' + value : value;
            };

            Headers.prototype['delete'] = function(name) {
              delete this.map[normalizeName(name)];
            };

            Headers.prototype.get = function(name) {
              name = normalizeName(name);
              return this.has(name) ? this.map[name] : null
            };

            Headers.prototype.has = function(name) {
              return this.map.hasOwnProperty(normalizeName(name))
            };

            Headers.prototype.set = function(name, value) {
              this.map[normalizeName(name)] = normalizeValue(value);
            };

            Headers.prototype.forEach = function(callback, thisArg) {
              for (var name in this.map) {
                if (this.map.hasOwnProperty(name)) {
                  callback.call(thisArg, this.map[name], name, this);
                }
              }
            };

            Headers.prototype.keys = function() {
              var items = [];
              this.forEach(function(value, name) {
                items.push(name);
              });
              return iteratorFor(items)
            };

            Headers.prototype.values = function() {
              var items = [];
              this.forEach(function(value) {
                items.push(value);
              });
              return iteratorFor(items)
            };

            Headers.prototype.entries = function() {
              var items = [];
              this.forEach(function(value, name) {
                items.push([name, value]);
              });
              return iteratorFor(items)
            };

            if (support.iterable) {
              Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
            }

            function consumed(body) {
              if (body._noBody) return
              if (body.bodyUsed) {
                return Promise.reject(new TypeError('Already read'))
              }
              body.bodyUsed = true;
            }

            function fileReaderReady(reader) {
              return new Promise(function(resolve, reject) {
                reader.onload = function() {
                  resolve(reader.result);
                };
                reader.onerror = function() {
                  reject(reader.error);
                };
              })
            }

            function readBlobAsArrayBuffer(blob) {
              var reader = new FileReader();
              var promise = fileReaderReady(reader);
              reader.readAsArrayBuffer(blob);
              return promise
            }

            function readBlobAsText(blob) {
              var reader = new FileReader();
              var promise = fileReaderReady(reader);
              var match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
              var encoding = match ? match[1] : 'utf-8';
              reader.readAsText(blob, encoding);
              return promise
            }

            function readArrayBufferAsText(buf) {
              var view = new Uint8Array(buf);
              var chars = new Array(view.length);

              for (var i = 0; i < view.length; i++) {
                chars[i] = String.fromCharCode(view[i]);
              }
              return chars.join('')
            }

            function bufferClone(buf) {
              if (buf.slice) {
                return buf.slice(0)
              } else {
                var view = new Uint8Array(buf.byteLength);
                view.set(new Uint8Array(buf));
                return view.buffer
              }
            }

            function Body() {
              this.bodyUsed = false;

              this._initBody = function(body) {
                /*
                  fetch-mock wraps the Response object in an ES6 Proxy to
                  provide useful test harness features such as flush. However, on
                  ES5 browsers without fetch or Proxy support pollyfills must be used;
                  the proxy-pollyfill is unable to proxy an attribute unless it exists
                  on the object before the Proxy is created. This change ensures
                  Response.bodyUsed exists on the instance, while maintaining the
                  semantic of setting Request.bodyUsed in the constructor before
                  _initBody is called.
                */
                // eslint-disable-next-line no-self-assign
                this.bodyUsed = this.bodyUsed;
                this._bodyInit = body;
                if (!body) {
                  this._noBody = true;
                  this._bodyText = '';
                } else if (typeof body === 'string') {
                  this._bodyText = body;
                } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
                  this._bodyBlob = body;
                } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
                  this._bodyFormData = body;
                } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                  this._bodyText = body.toString();
                } else if (support.arrayBuffer && support.blob && isDataView(body)) {
                  this._bodyArrayBuffer = bufferClone(body.buffer);
                  // IE 10-11 can't handle a DataView body.
                  this._bodyInit = new Blob([this._bodyArrayBuffer]);
                } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
                  this._bodyArrayBuffer = bufferClone(body);
                } else {
                  this._bodyText = body = Object.prototype.toString.call(body);
                }

                if (!this.headers.get('content-type')) {
                  if (typeof body === 'string') {
                    this.headers.set('content-type', 'text/plain;charset=UTF-8');
                  } else if (this._bodyBlob && this._bodyBlob.type) {
                    this.headers.set('content-type', this._bodyBlob.type);
                  } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                    this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
                  }
                }
              };

              if (support.blob) {
                this.blob = function() {
                  var rejected = consumed(this);
                  if (rejected) {
                    return rejected
                  }

                  if (this._bodyBlob) {
                    return Promise.resolve(this._bodyBlob)
                  } else if (this._bodyArrayBuffer) {
                    return Promise.resolve(new Blob([this._bodyArrayBuffer]))
                  } else if (this._bodyFormData) {
                    throw new Error('could not read FormData body as blob')
                  } else {
                    return Promise.resolve(new Blob([this._bodyText]))
                  }
                };
              }

              this.arrayBuffer = function() {
                if (this._bodyArrayBuffer) {
                  var isConsumed = consumed(this);
                  if (isConsumed) {
                    return isConsumed
                  } else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
                    return Promise.resolve(
                      this._bodyArrayBuffer.buffer.slice(
                        this._bodyArrayBuffer.byteOffset,
                        this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
                      )
                    )
                  } else {
                    return Promise.resolve(this._bodyArrayBuffer)
                  }
                } else if (support.blob) {
                  return this.blob().then(readBlobAsArrayBuffer)
                } else {
                  throw new Error('could not read as ArrayBuffer')
                }
              };

              this.text = function() {
                var rejected = consumed(this);
                if (rejected) {
                  return rejected
                }

                if (this._bodyBlob) {
                  return readBlobAsText(this._bodyBlob)
                } else if (this._bodyArrayBuffer) {
                  return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
                } else if (this._bodyFormData) {
                  throw new Error('could not read FormData body as text')
                } else {
                  return Promise.resolve(this._bodyText)
                }
              };

              if (support.formData) {
                this.formData = function() {
                  return this.text().then(decode)
                };
              }

              this.json = function() {
                return this.text().then(JSON.parse)
              };

              return this
            }

            // HTTP methods whose capitalization should be normalized
            var methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE'];

            function normalizeMethod(method) {
              var upcased = method.toUpperCase();
              return methods.indexOf(upcased) > -1 ? upcased : method
            }

            function Request(input, options) {
              if (!(this instanceof Request)) {
                throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
              }

              options = options || {};
              var body = options.body;

              if (input instanceof Request) {
                if (input.bodyUsed) {
                  throw new TypeError('Already read')
                }
                this.url = input.url;
                this.credentials = input.credentials;
                if (!options.headers) {
                  this.headers = new Headers(input.headers);
                }
                this.method = input.method;
                this.mode = input.mode;
                this.signal = input.signal;
                if (!body && input._bodyInit != null) {
                  body = input._bodyInit;
                  input.bodyUsed = true;
                }
              } else {
                this.url = String(input);
              }

              this.credentials = options.credentials || this.credentials || 'same-origin';
              if (options.headers || !this.headers) {
                this.headers = new Headers(options.headers);
              }
              this.method = normalizeMethod(options.method || this.method || 'GET');
              this.mode = options.mode || this.mode || null;
              this.signal = options.signal || this.signal || (function () {
                if ('AbortController' in g) {
                  var ctrl = new AbortController();
                  return ctrl.signal;
                }
              }());
              this.referrer = null;

              if ((this.method === 'GET' || this.method === 'HEAD') && body) {
                throw new TypeError('Body not allowed for GET or HEAD requests')
              }
              this._initBody(body);

              if (this.method === 'GET' || this.method === 'HEAD') {
                if (options.cache === 'no-store' || options.cache === 'no-cache') {
                  // Search for a '_' parameter in the query string
                  var reParamSearch = /([?&])_=[^&]*/;
                  if (reParamSearch.test(this.url)) {
                    // If it already exists then set the value with the current time
                    this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
                  } else {
                    // Otherwise add a new '_' parameter to the end with the current time
                    var reQueryString = /\?/;
                    this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
                  }
                }
              }
            }

            Request.prototype.clone = function() {
              return new Request(this, {body: this._bodyInit})
            };

            function decode(body) {
              var form = new FormData();
              body
                .trim()
                .split('&')
                .forEach(function(bytes) {
                  if (bytes) {
                    var split = bytes.split('=');
                    var name = split.shift().replace(/\+/g, ' ');
                    var value = split.join('=').replace(/\+/g, ' ');
                    form.append(decodeURIComponent(name), decodeURIComponent(value));
                  }
                });
              return form
            }

            function parseHeaders(rawHeaders) {
              var headers = new Headers();
              // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
              // https://tools.ietf.org/html/rfc7230#section-3.2
              var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
              // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
              // https://github.com/github/fetch/issues/748
              // https://github.com/zloirock/core-js/issues/751
              preProcessedHeaders
                .split('\r')
                .map(function(header) {
                  return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header
                })
                .forEach(function(line) {
                  var parts = line.split(':');
                  var key = parts.shift().trim();
                  if (key) {
                    var value = parts.join(':').trim();
                    try {
                      headers.append(key, value);
                    } catch (error) {
                      console.warn('Response ' + error.message);
                    }
                  }
                });
              return headers
            }

            Body.call(Request.prototype);

            function Response(bodyInit, options) {
              if (!(this instanceof Response)) {
                throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
              }
              if (!options) {
                options = {};
              }

              this.type = 'default';
              this.status = options.status === undefined ? 200 : options.status;
              if (this.status < 200 || this.status > 599) {
                throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].")
              }
              this.ok = this.status >= 200 && this.status < 300;
              this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
              this.headers = new Headers(options.headers);
              this.url = options.url || '';
              this._initBody(bodyInit);
            }

            Body.call(Response.prototype);

            Response.prototype.clone = function() {
              return new Response(this._bodyInit, {
                status: this.status,
                statusText: this.statusText,
                headers: new Headers(this.headers),
                url: this.url
              })
            };

            Response.error = function() {
              var response = new Response(null, {status: 200, statusText: ''});
              response.ok = false;
              response.status = 0;
              response.type = 'error';
              return response
            };

            var redirectStatuses = [301, 302, 303, 307, 308];

            Response.redirect = function(url, status) {
              if (redirectStatuses.indexOf(status) === -1) {
                throw new RangeError('Invalid status code')
              }

              return new Response(null, {status: status, headers: {location: url}})
            };

            var DOMException = g.DOMException;
            try {
              new DOMException();
            } catch (err) {
              DOMException = function(message, name) {
                this.message = message;
                this.name = name;
                var error = Error(message);
                this.stack = error.stack;
              };
              DOMException.prototype = Object.create(Error.prototype);
              DOMException.prototype.constructor = DOMException;
            }

            function fetch$1(input, init) {
              return new Promise(function(resolve, reject) {
                var request = new Request(input, init);

                if (request.signal && request.signal.aborted) {
                  return reject(new DOMException('Aborted', 'AbortError'))
                }

                var xhr = new XMLHttpRequest();

                function abortXhr() {
                  xhr.abort();
                }

                xhr.onload = function() {
                  var options = {
                    statusText: xhr.statusText,
                    headers: parseHeaders(xhr.getAllResponseHeaders() || '')
                  };
                  // This check if specifically for when a user fetches a file locally from the file system
                  // Only if the status is out of a normal range
                  if (request.url.indexOf('file://') === 0 && (xhr.status < 200 || xhr.status > 599)) {
                    options.status = 200;
                  } else {
                    options.status = xhr.status;
                  }
                  options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
                  var body = 'response' in xhr ? xhr.response : xhr.responseText;
                  setTimeout(function() {
                    resolve(new Response(body, options));
                  }, 0);
                };

                xhr.onerror = function() {
                  setTimeout(function() {
                    reject(new TypeError('Network request failed'));
                  }, 0);
                };

                xhr.ontimeout = function() {
                  setTimeout(function() {
                    reject(new TypeError('Network request timed out'));
                  }, 0);
                };

                xhr.onabort = function() {
                  setTimeout(function() {
                    reject(new DOMException('Aborted', 'AbortError'));
                  }, 0);
                };

                function fixUrl(url) {
                  try {
                    return url === '' && g.location.href ? g.location.href : url
                  } catch (e) {
                    return url
                  }
                }

                xhr.open(request.method, fixUrl(request.url), true);

                if (request.credentials === 'include') {
                  xhr.withCredentials = true;
                } else if (request.credentials === 'omit') {
                  xhr.withCredentials = false;
                }

                if ('responseType' in xhr) {
                  if (support.blob) {
                    xhr.responseType = 'blob';
                  } else if (
                    support.arrayBuffer
                  ) {
                    xhr.responseType = 'arraybuffer';
                  }
                }

                if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers || (g.Headers && init.headers instanceof g.Headers))) {
                  var names = [];
                  Object.getOwnPropertyNames(init.headers).forEach(function(name) {
                    names.push(normalizeName(name));
                    xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
                  });
                  request.headers.forEach(function(value, name) {
                    if (names.indexOf(name) === -1) {
                      xhr.setRequestHeader(name, value);
                    }
                  });
                } else {
                  request.headers.forEach(function(value, name) {
                    xhr.setRequestHeader(name, value);
                  });
                }

                if (request.signal) {
                  request.signal.addEventListener('abort', abortXhr);

                  xhr.onreadystatechange = function() {
                    // DONE (success or failure)
                    if (xhr.readyState === 4) {
                      request.signal.removeEventListener('abort', abortXhr);
                    }
                  };
                }

                xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
              })
            }

            fetch$1.polyfill = true;

            if (!g.fetch) {
              g.fetch = fetch$1;
              g.Headers = Headers;
              g.Request = Request;
              g.Response = Response;
            }

            // the whatwg-fetch polyfill installs the fetch() function
            // on the global object (window or self)
            //
            // Return that as the export for use in Webpack, Browserify etc.

            self.fetch.bind(self);

            async function checkStatus(response) {
              if (response.status >= 200 && response.status < 400) {
                return response;
              }
              if (response.status >= 400 && response.status < 500) {
                const details = await response.json();
                const error = new Error(details.error_message);
                error.response = response;
                error.details = details;
                error.authIssue = true;
                return Promise.reject(error);
              }
              const error = new Error(response.statusText);
              error.response = response;
              return Promise.reject(error);
            }

            function fetchJson(url, {accessToken, headers, ...options} = {}) {
              const acceptHeaders = {accept: 'application/json'};
              const authorizationHeaders = accessToken ? {authorization: `Bearer ${accessToken}`} : {};
              options = {credentials: 'same-origin', keepalive: true, headers:
                    {...acceptHeaders, ...authorizationHeaders, ...headers}, ...options};
              return fetch(url, options)
                .then(checkStatus)
                .then((response) => {
                  return [204, 304].includes(response.status) ? {} : response.json();
                })
                .catch((error) =>{
                  if (error instanceof TypeError) {
                    const newError = new Error('Your internet connection appears to have gone down.');
                    newError.noNet = true;
                    return Promise.reject(newError);
                  }
                  return Promise.reject(error);
                });
            }

            const apiHost = 'app.xenonview.com';
            const apiUrl_ = `https://${apiHost}`;


            class ApiBase {
              constructor(props = {}) {
                const {name, method, headers, url: path, skipName, authenticated, apiUrl} = props;
                this.authenticated = (authenticated) ? authenticated : false;
                this.skipName = (skipName) ? skipName : false;
                this.name = (name) ? name : 'ApiBase';
                this.method = (method) ? method : 'POST';
                this.headers = (headers) ? headers : {
                  'content-type': 'application/json'
                };
                this.apiUrl = (apiUrl || apiUrl != undefined) ? apiUrl : apiUrl_;
                this.path_ = (path) ? path : '';
              }

              params(data) {
                return {};
              };

              path(data){
                return this.path_;
              }

              fetch({data} = {}) {
                let parameters = {};
                try {
                  parameters = this.params(data);
                } catch (error) {
                  return Promise.reject(error);
                }
                let fetchParameters = {
                  method: this.method,
                  headers: this.headers,
                };

                if (Object.keys(parameters).length || !this.skipName) {
                  let bodyObject = {
                    parameters: parameters
                  };
                  if (!this.skipName) bodyObject.name = this.name;
                  const body = JSON.stringify(bodyObject);
                  fetchParameters.body = body;
                }

                if (this.authenticated) {
                  const {token} = data;
                  if (token) fetchParameters.accessToken = token;
                  else return Promise.reject(new Error("No token and authenticated!"))
                }
                const fetchUrl = `${this.apiUrl}/${this.path(data)}`;
                return fetchJson(fetchUrl, fetchParameters);
              }
            }

            function journeyParams(data) {
              const {journey: journey} = data;
              if (journey) return { journey: journey};
              return {};
            }

            class journeyApi extends ApiBase {
              constructor(apiUrl) {
                let props = {
                  name: 'ApiJourney',
                  url: 'journey',
                  apiUrl: apiUrl,
                  authenticated: true
                };
                super(props);
              }
              params(data) {
                let params = journeyParams(data);
                const {id, timestamp} = data;
                params.uuid = id;
                params.timestamp = timestamp;
                return params;
              }
            }

            function JourneyApi(apiUrl){
              return new journeyApi(apiUrl);
            }

            function heartbeatParams(data) {
              const {journey: journey} = data;
              if (journey) return { journey: journey};
              return {};
            }

            class heartbeatApi extends ApiBase {
              constructor(apiUrl) {
                let props = {
                  name: 'ApiHeartbeat',
                  url: 'heartbeat',
                  apiUrl: apiUrl,
                  authenticated: true
                };
                super(props);
              }
              params(data) {
                let params = heartbeatParams(data);
                const {id, tags, platform, timestamp, watchdog} = data;
                params.uuid = id;
                params.timestamp = timestamp;
                params.tags = tags;
                params.platform = platform;
                if (watchdog) {
                  params.watchdog = watchdog;
                }
                return params;
              }
            }

            function HeartbeatApi(apiUrl){
              return new heartbeatApi(apiUrl);
            }

            class deanonApi extends ApiBase {
              constructor(apiUrl) {
                let props = {
                  name: 'ApiDeanonymize',
                  url: 'deanonymize',
                  apiUrl: apiUrl,
                  authenticated: true
                };
                super(props);
              }
              params(data) {
                const {id, person, timestamp} = data;
                if (!person) throw new Error("No person data received.")
                let params = {};
                params.uuid = id;
                params.person = person;
                params.timestamp = timestamp;
                return params;
              }
            }
            function DeanonApi(apiUrl){
              return new deanonApi(apiUrl);
            }

            class sampleApi extends ApiBase {
              constructor(apiUrl) {
                let props = {
                  name: 'ApiSample',
                  url: 'sample',
                  apiUrl: apiUrl,
                  authenticated: true
                };
                super(props);
              }
              params(data) {
                const {id} = data;
                let params = {};
                params.uuid = id;
                return params;
              }
            }
            function SampleApi(apiUrl){
              return new sampleApi(apiUrl);
            }

            class countApi extends ApiBase {
              constructor(apiUrl) {
                let props = {
                  name: 'ApiIncrementCount',
                  url: 'increment_count',
                  apiUrl: apiUrl,
                  authenticated: true
                };
                super(props);
              }
              params(data) {
                const {uid, timestamp, outcome, content, value} = data;
                const {leadSource, leadCampaign, leadGuid} = content;
                let params = {};
                params.uid = uid;
                params.timestamp = timestamp;
                params.outcome = outcome;
                params.leadSource = leadSource;
                params.leadCampaign = leadCampaign;
                params.leadGuid = leadGuid;
                params.value = value;
                return params;
              }
            }
            function CountApi(apiUrl){
              return new countApi(apiUrl);
            }

            class errorLogApi extends ApiBase {
              constructor(apiUrl) {
                let props = {
                  name: 'ApiErrorLog',
                  url: 'error_log',
                  apiUrl: apiUrl,
                  authenticated: true
                };
                super(props);
              }
              params(data) {
                const {log} = data;
                let params = {};
                params.log = log;
                return params;
              }
            }
            function ErrorLogApi(apiUrl){
              return new errorLogApi(apiUrl);
            }

            const _defaultSessionStorage = {};
            const _sessionStorage = {
              setItem: (key, value) => _defaultSessionStorage[key] = value,
              getItem: (key) => _defaultSessionStorage[key],
              removeItem: (key) => delete _defaultSessionStorage[key],
            };

            const _defaultLocalStorage = {};
            const _localStorage = {
              setItem: (key, value) => _defaultLocalStorage[key] = value,
              getItem: (key) => _defaultLocalStorage[key],
              removeItem: (key) => delete _defaultLocalStorage[key],
            };
            function getLocalStorage(){
              if (typeof window != 'undefined' && window !== undefined && window && window.localStorage) return window.localStorage;
              if (typeof browser != 'undefined' && browser !== undefined && browser && browser.localStorage) return browser.localStorage;
              return _localStorage;
            }
            function getSessionStorage(){
              if (typeof window != 'undefined' && window !== undefined && window && window.sessionStorage) return window.sessionStorage;
              if (typeof browser != 'undefined' && browser !== undefined && browser && browser.sessionStorage) return browser.sessionStorage;
              return _sessionStorage;
            }

            function storeLocal(name, objectToStore) {
              getLocalStorage().setItem(name, JSON.stringify(objectToStore));
            }

            function retrieveLocal(name) {
              const value = getLocalStorage().getItem(name);
              return (value) ? JSON.parse(value) : null;
            }

            function resetLocal(name) {
              getLocalStorage().removeItem(name);
            }

            function storeSession(name, objectToStore) {
              getSessionStorage().setItem(name, JSON.stringify(objectToStore));
            }

            function retrieveSession(name) {
              const value = getSessionStorage().getItem(name);
              return (value) ? JSON.parse(value) : null;
            }

            function resetSession(name) {
              getSessionStorage().removeItem(name);
            }

            /**
             * Created by lwoydziak on 09/27/21.
             */
            /**
             * xenon.js
             *
             * SDK for interacting with the Xenon View service.
             *
             */

            class _Xenon {
              constructor(apiKey = null, apiUrl = 'https://app.xenonview.com',
                          countApiUrl = 'https://counts.xenonlab.ai',
                          journeyApi = JourneyApi, deanonApi = DeanonApi, heartbeatApi = HeartbeatApi,
                          sampleApi = SampleApi, countApi = CountApi, errorLogApi = ErrorLogApi) {
                this.JourneyApi = journeyApi;
                this.DeanonApi = deanonApi;
                this.HeartbeatApi = heartbeatApi;
                this.SampleApi = sampleApi;
                this.CountApi = countApi;
                this.ErrorLogApi = errorLogApi;
                this.pageURL_ = null;
                this.id();
                let journey = this.journey();
                if (!journey) {
                  this.storeJourney([]);
                }
                this.restoreJourney = [];
                this.apiCallPending = false;
                this.apiUrl = apiUrl;
                this.countApiUrl = countApiUrl;
                if (apiKey) {
                  this.init(apiKey, apiUrl);
                }
              }

              version() {
                return 'v0.1.40.0';
              }

              init(apiKey, apiUrl = 'https://app.xenonview.com', onApiKeyFailure = null) {
                this.apiUrl = apiUrl;
                this.apiKey = apiKey;
                this.sampleDecision(null, onApiKeyFailure);
                this.apiCallPending = false;
              }

              ecomAbandonment() {
                storeLocal('heartbeat_type', 'ecom');
                this.heartbeatState(0);
              }

              customAbandonment(outcome) {
                storeLocal('heartbeat_type', 'custom');
                storeLocal('heartbeat_outcome', outcome);
                this.heartbeatState(0);
              }

              cancelAbandonment() {
                storeLocal('heartbeat_type', 'custom');
                storeLocal('heartbeat_outcome', {
                  remove: true
                });
                this.heartbeatState(0);
              }

              platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion) {
                const platform = {
                  softwareVersion: softwareVersion,
                  deviceModel: deviceModel,
                  operatingSystemName: operatingSystemName,
                  operatingSystemVersion: operatingSystemVersion
                };
                storeSession('view-platform', platform);
              }

              removePlatform() {
                resetSession('view-platform');
              }

              variant(variantNames) {
                storeSession('view-tags', variantNames);
              }

              resetVariants() {
                resetSession('view-tags');
              }

              startVariant(variantName) {
                let variantNames = retrieveSession('view-tags');
                if (!variantNames || !variantNames.includes(variantName)) {
                  this.resetVariants();
                  this.variant([variantName]);
                }
              }

              addVariant(variantName) {
                let variantNames = retrieveSession('view-tags');
                if (!variantNames || !variantNames.includes(variantName)) {
                  (variantNames) ? variantNames.push(variantName) : variantNames = [variantName];
                  this.variant(variantNames);
                }
              }

              // Stock Business Outcomes:
              leadAttributed(source, identifier=null) {
                this.count("Attribution");
              }

              leadUnattributed() {
                this.count("Attribution");
              }

              leadCaptured(specifier) {
                const content = {
                  superOutcome: 'Lead Capture',
                  outcome: specifier,
                  result: 'success'
                };
                this.outcomeAdd(content);
              }

              leadCaptureDeclined(specifier) {
                const content = {
                  superOutcome: 'Lead Capture',
                  outcome: specifier,
                  result: 'fail'
                };
                this.outcomeAdd(content);
              }

              accountSignup(specifier) {
                const content = {
                  superOutcome: 'Account Signup',
                  outcome: specifier,
                  result: 'success'
                };
                this.outcomeAdd(content);
              }

              accountSignupDeclined(specifier) {
                const content = {
                  superOutcome: 'Account Signup',
                  outcome: specifier,
                  result: 'fail'
                };
                this.outcomeAdd(content);
              }

              applicationInstalled() {
                let content = {
                  superOutcome: 'Application Installation',
                  outcome: 'Installed',
                  result: 'success'
                };
                this.outcomeAdd(content);
              }

              applicationNotInstalled() {
                const content = {
                  superOutcome: 'Application Installation',
                  outcome: 'Not Installed',
                  result: 'fail'
                };
                this.outcomeAdd(content);
              }

              initialSubscription(tier, method = null, price = null, term = null) {
                const content = {
                  superOutcome: 'Initial Subscription',
                  outcome: 'Subscribe - ' + tier,
                  result: 'success'
                };
                if (method) {
                  content['method'] = method;
                }
                if (price) {
                  content['price'] = price;
                }
                if (term) {
                  content['term'] = term;
                }
                this.outcomeAdd(content);
              }

              subscriptionDeclined(tier, method = null, price = null, term = null) {
                const content = {
                  superOutcome: 'Initial Subscription',
                  outcome: 'Decline - ' + tier,
                  result: 'fail'
                };
                if (method) {
                  content['method'] = method;
                }
                if (price) {
                  content['price'] = price;
                }
                if (term) {
                  content['term'] = term;
                }
                this.outcomeAdd(content);
              }

              subscriptionRenewed(tier, method = null, price = null, term = null) {
                const content = {
                  superOutcome: 'Subscription Renewal',
                  outcome: 'Renew - ' + tier,
                  result: 'success'
                };
                if (method) {
                  content['method'] = method;
                }
                if (price) {
                  content['price'] = price;
                }
                if (term) {
                  content['term'] = term;
                }
                this.outcomeAdd(content);
              }

              subscriptionPaused(tier, method = null, price = null, term = null) {
                const content = {
                  superOutcome: 'Subscription Renewal',
                  outcome: 'Paused - ' + tier,
                  result: 'fail'
                };
                if (method) {
                  content['method'] = method;
                }
                if (price) {
                  content['price'] = price;
                }
                if (term) {
                  content['term'] = term;
                }
                this.outcomeAdd(content);
              }

              subscriptionCanceled(tier, method = null, price = null, term = null) {
                const content = {
                  superOutcome: 'Subscription Renewal',
                  outcome: 'Cancel - ' + tier,
                  result: 'fail'
                };
                if (method) {
                  content['method'] = method;
                }
                if (price) {
                  content['price'] = price;
                }
                if (term) {
                  content['term'] = term;
                }
                this.outcomeAdd(content);
              }

              subscriptionUpsold(tier, method = null, price = null, term = null) {
                const content = {
                  superOutcome: 'Subscription Upsold',
                  outcome: 'Upsold - ' + tier,
                  result: 'success'
                };
                if (method) {
                  content['method'] = method;
                }
                if (price) {
                  content['price'] = price;
                }
                if (term) {
                  content['term'] = term;
                }
                this.outcomeAdd(content);
              }

              subscriptionUpsellDeclined(tier, method = null, price = null, term = null) {
                const content = {
                  superOutcome: 'Subscription Upsold',
                  outcome: 'Declined - ' + tier,
                  result: 'fail'
                };
                if (method) {
                  content['method'] = method;
                }
                if (price) {
                  content['price'] = price;
                }
                if (term) {
                  content['term'] = term;
                }
                this.outcomeAdd(content);
              }

              subscriptionDownsell(tier, method = null, price = null, term = null) {
                const content = {
                  superOutcome: 'Subscription Upsold',
                  outcome: 'Downsell - ' + tier,
                  result: 'fail'
                };
                if (method) {
                  content['method'] = method;
                }
                if (price) {
                  content['price'] = price;
                }
                if (term) {
                  content['term'] = term;
                }
                this.outcomeAdd(content);
              }

              adClicked(provider, id = null, price = null) {
                const content = {
                  superOutcome: 'Advertisement',
                  outcome: 'Ad Click - ' + provider,
                  result: 'success'
                };
                if (id) {
                  content['id'] = id;
                }
                if (price) {
                  content['price'] = price;
                }
                this.outcomeAdd(content);
              }

              adIgnored(provider, id = null, price = null) {
                const content = {
                  superOutcome: 'Advertisement',
                  outcome: 'Ad Ignored - ' + provider,
                  result: 'fail'
                };
                if (id) {
                  content['id'] = id;
                }
                if (price) {
                  content['price'] = price;
                }
                this.outcomeAdd(content);
              }

              referral(kind, detail = null) {
                const content = {
                  superOutcome: 'Referral',
                  outcome: 'Referred - ' + kind,
                  result: 'success'
                };
                if (detail) {
                  content['details'] = detail;
                }
                this.outcomeAdd(content);
              }

              referralDeclined(kind, detail = null) {
                const content = {
                  superOutcome: 'Referral',
                  outcome: 'Declined - ' + kind,
                  result: 'fail'
                };
                if (detail) {
                  content['details'] = detail;
                }
                this.outcomeAdd(content);
              }

              productAddedToCart(product, price = null) {
                const content = {
                  superOutcome: 'Add Product To Cart',
                  outcome: 'Add - ' + product,
                  result: 'success'
                };
                if (price) {
                  content['price'] = price;
                } else {
                  price = 0.0;
                }
                this.outcomeAdd(content);
                this.heartbeatState(1);
                this.count("Add To Cart", price);
              }

              productNotAddedToCart(product) {
                const content = {
                  superOutcome: 'Add Product To Cart',
                  outcome: 'Ignore - ' + product,
                  result: 'fail'
                };
                this.outcomeAdd(content);
              }

              upsold(product, price = null) {
                const content = {
                  superOutcome: 'Upsold Product',
                  outcome: 'Upsold - ' + product,
                  result: 'success'
                };
                if (price) {
                  content['price'] = price;
                } else {
                  price = 0.0;
                }
                this.outcomeAdd(content);
                this.count("Upsell", price);
              }

              upsellDismissed(product, price = null) {
                const content = {
                  superOutcome: 'Upsold Product',
                  outcome: 'Dismissed - ' + product,
                  result: 'fail'
                };
                if (price) {
                  content['price'] = price;
                }
                this.outcomeAdd(content);
              }

              checkOut(member=null) {
                let outcome = "Check Out";
                let countSting = "Check Out";

                if (member != null) {
                  outcome = "Check Out - " + member;
                  countSting = "Checkout:" + member;
                }

                const content = {
                  superOutcome: 'Customer Checkout',
                  outcome: outcome,
                  result: 'success'
                };
                this.outcomeAdd(content);
                this.heartbeatState(2);
                this.count(countSting);
              }

              checkoutCanceled() {
                const content = {
                  superOutcome: 'Customer Checkout',
                  outcome: 'Canceled',
                  result: 'fail'
                };
                this.outcomeAdd(content);
              }

              productRemoved(product) {
                const content = {
                  superOutcome: 'Customer Checkout',
                  outcome: 'Product Removed - ' + product,
                  result: 'fail'
                };
                this.outcomeAdd(content);
              }

              purchase(SKUs, price = null, discount=null, shipping=null, member=null) {
                let outcome = "Purchase";
                let purchaseSting = "Purchase";

                if (member != null) {
                  outcome = "Purchase - " + member;
                  purchaseSting = "Purchase:"+member;
                }

                const content = {
                  superOutcome: 'Customer Purchase',
                  outcome: outcome,
                  skus: SKUs,
                  result: 'success'
                };
                if (price) {
                  content['price'] = price;
                } else {
                  price = 0.0;
                }
                if (discount) {
                  content['discount'] = discount;
                }
                if (shipping) {
                  content['shipping'] = shipping;
                }

                this.outcomeAdd(content);

                this.heartbeatState(3);
                this.count(purchaseSting, price);
              }

              purchaseCancel(SKUs = null, price = null) {
                const outcome = 'Canceled' + (SKUs ? ' - ' + SKUs : '');
                const content = {
                  superOutcome: 'Customer Purchase',
                  outcome: outcome,
                  result: 'fail'
                };
                if (price) {
                  content['price'] = price;
                }
                this.outcomeAdd(content);
              }

              promiseFulfilled() {
                const content = {
                  superOutcome: 'Promise Fulfillment',
                  outcome: 'Fulfilled',
                  result: 'success'
                };
                this.outcomeAdd(content);
              }

              promiseUnfulfilled() {
                const content = {
                  superOutcome: 'Promise Fulfillment',
                  outcome: 'Unfulfilled',
                  result: 'fail'
                };
                this.outcomeAdd(content);
              }

              productKept(product) {
                const content = {
                  superOutcome: 'Product Disposition',
                  outcome: 'Kept - ' + product,
                  result: 'success'
                };
                this.outcomeAdd(content);
              }

              productReturned(product) {
                const content = {
                  superOutcome: 'Product Disposition',
                  outcome: 'Returned - ' + product,
                  result: 'fail'
                };
                this.outcomeAdd(content);
              }

            // Stock Milestones:

              featureAttempted(name, detail = null) {
                const event = {
                  category: 'Feature',
                  action: 'Attempted',
                  name: name
                };
                if (detail) {
                  event['details'] = detail;
                }
                this.journeyAdd(event);
              }

              featureCompleted(name, detail = null) {
                const event = {
                  category: 'Feature',
                  action: 'Completed',
                  name: name
                };
                if (detail) {
                  event['details'] = detail;
                }
                this.journeyAdd(event);
              }

              featureFailed(name, detail = null) {
                const event = {
                  category: 'Feature',
                  action: 'Failed',
                  name: name
                };
                if (detail) {
                  event['details'] = detail;
                }
                this.journeyAdd(event);
              }

              contentViewed(contentType, identifier = null) {
                const event = {
                  category: 'Content',
                  action: 'Viewed',
                  type: contentType,
                };
                if (identifier) {
                  event['identifier'] = identifier;
                }
                this.journeyAdd(event);
              }

              contentEdited(contentType, identifier = null, detail = null) {
                const event = {
                  category: 'Content',
                  action: 'Edited',
                  type: contentType,
                };
                if (identifier) {
                  event['identifier'] = identifier;
                }
                if (detail) {
                  event['details'] = detail;
                }
                this.journeyAdd(event);
              }

              contentCreated(contentType, identifier = null) {
                const event = {
                  category: 'Content',
                  action: 'Created',
                  type: contentType,
                };
                if (identifier) {
                  event['identifier'] = identifier;
                }
                this.journeyAdd(event);
              }

              contentDeleted(contentType, identifier = null) {
                const event = {
                  category: 'Content',
                  action: 'Deleted',
                  type: contentType,
                };
                if (identifier) {
                  event['identifier'] = identifier;
                }
                this.journeyAdd(event);
              }

              contentArchived(contentType, identifier = null) {
                const event = {
                  category: 'Content',
                  action: 'Archived',
                  type: contentType,
                };
                if (identifier) {
                  event['identifier'] = identifier;
                }
                this.journeyAdd(event);
              }

              contentRequested(contentType, identifier = null) {
                const event = {
                  category: 'Content',
                  action: 'Requested',
                  type: contentType,
                };
                if (identifier) {
                  event['identifier'] = identifier;
                }
                this.journeyAdd(event);
              }

              contentSearched(contentType) {
                const event = {
                  category: 'Content',
                  action: 'Searched',
                  type: contentType,
                };
                this.journeyAdd(event);
              }

              pageLoadTime(loadTime, url) {
                const event = {
                  category: 'Webpage Load Time',
                  time: loadTime.toString(),
                  identifier: url,
                };
                this.journeyAdd(event);
              }

              // Custom Milestones

              milestone(category, operation, name, detail) {
                const event = {
                  category: category,
                  action: operation,
                  name: name,
                  details: detail
                };
                this.journeyAdd(event);
              }

              // API Communication:

              count(outcome, value= 0.0, surfaceErrors = false) {
                const attribution = retrieveSession('view-attribution');
                if (!attribution) return Promise.resolve(true);
                const replayLog = retrieveSession('view-count-replay');
                if (replayLog) {
                  for (const params in replayLog) {
                    this.countInternal(params, surfaceErrors);
                  }
                }
                let params = {
                  data: {
                    uid: this.id(),
                    token: this.apiKey,
                    timestamp: (new Date()).getTime() / 1000,
                    outcome: outcome,
                    content: attribution,
                    value: value
                  }
                };
                return this.countInternal(params, surfaceErrors);
              }

              countInternal(params, surfaceErrors) {
                return this.CountApi(this.countApiUrl)
                  .fetch(params)
                  .catch((err) => {
                    const replayLog = retrieveSession('view-count-replay');
                    if (replayLog) {
                      replayLog.push(params);
                      storeSession('view-count-replay', replayLog);
                    } else {
                      storeSession('view-count-replay', [params]);
                    }
                    return (surfaceErrors ? Promise.reject(err) : Promise.resolve(true));
                  });
              }

              commit(surfaceErrors = false) {
                if (!this.sampleDecision() || this.apiCallPending) {
                  return Promise.resolve(true);
                }
                this.apiCallPending = true;
                let params = {
                  data: {
                    id: this.id(),
                    journey: this.journey(),
                    token: this.apiKey,
                    timestamp: (new Date()).getTime() / 1000
                  }
                };
                const saved = this.reset();
                return this.JourneyApi(this.apiUrl)
                  .fetch(params)
                  .then((value) => {
                    this.apiCallPending = false;
                    return Promise.resolve(value);
                  })
                  .catch((err) => {
                    this.restore(saved);
                    this.apiCallPending = false;
                    this.apiCallPending = false;
                    return (surfaceErrors ? Promise.reject(err) : Promise.resolve(true));
                  });
              }

              heartbeatState(stage = null) {
                const previousStage = retrieveLocal('heartbeat_stage');
                if (stage && stage > previousStage) {
                  storeLocal('heartbeat_stage', stage);
                }
                if (!stage && !previousStage) {
                  storeLocal('heartbeat_stage', 0);
                }
                return Number(retrieveLocal('heartbeat_stage'));
              }

              heartbeatMessage(type) {
                const stage = this.heartbeatState();
                const messages = {
                  ecom: {
                    0: {
                      expires_in_seconds: 600,
                      if_abandoned: {
                        superOutcome: 'Add Product To Cart',
                        outcome: 'Abandoned',
                        result: 'fail'
                      }
                    },
                    1: {
                      expires_in_seconds: 600,
                      if_abandoned: {
                        superOutcome: 'Customer Checkout',
                        outcome: 'Abandoned',
                        result: 'fail'
                      }
                    },
                    2: {
                      expires_in_seconds: 600,
                      if_abandoned: {
                        superOutcome: 'Customer Purchase',
                        outcome: 'Abandoned',
                        result: 'fail'
                      }
                    },
                    3: {
                      remove: true
                    },
                  }
                };
                if (Object.keys(messages).includes(type)) {
                  return messages[type][stage];
                }
                return retrieveLocal('heartbeat_outcome')
              }

              heartbeat(surfaceErrors = false) {
                const platform = retrieveSession('view-platform');
                const tags = retrieveSession('view-tags');
                let params = {
                  data: {
                    id: this.id(),
                    journey: this.journey(),
                    token: this.apiKey,
                    platform: platform ? platform : {},
                    tags: tags ? tags : [],
                    timestamp: (new Date()).getTime() / 1000
                  }
                };

                const heartbeatType = retrieveLocal('heartbeat_type');
                if (heartbeatType) {
                  params.data['watchdog'] = this.heartbeatMessage(heartbeatType);
                }

                if (!this.sampleDecision() || this.apiCallPending) {
                  return Promise.resolve(true);
                }
                this.apiCallPending = true;

                const saved = this.reset();
                return this.HeartbeatApi(this.apiUrl)
                  .fetch(params)
                  .then((value) => {
                    if (heartbeatType && Object.keys(params.data['watchdog']).includes('remove')) {
                      resetLocal('heartbeat_stage');
                      resetLocal('heartbeat_type');
                      resetLocal('heartbeat_outcome');
                    }
                    this.apiCallPending = false;
                    return Promise.resolve(value);
                  })
                  .catch((err) => {
                    this.restore(saved);
                    this.apiCallPending = false;
                    return (surfaceErrors ? Promise.reject(err) : Promise.resolve(true));
                  });
              }

              deanonymize(person) {
                if (!this.sampleDecision()) {
                  return Promise.resolve(true);
                }

                let params = {
                  data: {
                    id: this.id(),
                    person: person,
                    token: this.apiKey,
                    timestamp: (new Date()).getTime() / 1000
                  }
                };
                return this.DeanonApi(this.apiUrl)
                  .fetch(params);
              }

              recordError(log) {
                if (!this.sampleDecision()) {
                  return Promise.resolve(true);
                }

                let params = {
                  data: {
                    log: log,
                    token: this.apiKey,
                  }
                };
                return this.ErrorLogApi(this.apiUrl)
                  .fetch(params);
              }

              // Internals:

              id(id) {
                if (id) {
                  storeSession('xenon-view', id);
                }
                id = retrieveSession('xenon-view');
                if (!id || id === '') {
                  return this.newId();
                }
                return id;
              }

              newId() {
                storeSession('xenon-view', crypto.randomUUID());
                return retrieveSession('xenon-view');
              }

              sampleDecision(decision = null, onApiKeyFailure = null) {
                if (decision !== null) {
                  storeSession('xenon-will-sample', decision);
                }
                decision = retrieveSession('xenon-will-sample');
                if (decision === null || decision === '') {
                  let params = {data: {id: this.id(), token: this.apiKey}};
                  this.SampleApi(this.apiUrl).fetch(params).then((json) => {
                    decision = this.sampleDecision(json['sample'], onApiKeyFailure);
                  }).catch((error) => {
                    if (error.authIssue && onApiKeyFailure) {
                      onApiKeyFailure(error);
                      return;
                    }
                    decision = this.sampleDecision(true, onApiKeyFailure);
                  });
                }
                decision = (decision !== null) ? Boolean(decision) : null;
                return decision;
              }

              outcomeAdd(content) {
                let platform = retrieveSession('view-platform');
                if (platform) content['platform'] = platform;
                let tags = retrieveSession('view-tags');
                if (tags) content['tags'] = tags;
                this.journeyAdd(content);
              }

              journeyAdd(content) {
                let journey = this.journey();
                content.timestamp = (new Date()).getTime() / 1000;
                if (this.pageURL_) {
                  content.url = this.pageURL_;
                }
                if (journey && journey.length) {
                  let last = journey[journey.length - 1];
                  if (this.isDuplicate(last, content)) {
                    let count = last.hasOwnProperty('count') ? last.count : 1;
                    last.count = count + 1;
                  } else {
                    journey.push(content);
                  }
                } else {
                  journey = [content];
                }
                this.storeJourney(journey);
              }


              isDuplicate(last, content) {
                const lastKeys = Object.keys(last);
                const contentKeys = Object.keys(content);
                const isSuperset = (set, subset) => {
                  for (const elem of subset) {
                    if (!set.has(elem)) {
                      return false;
                    }
                  }
                  return true;
                };
                if (!isSuperset(new Set(lastKeys), new Set(contentKeys))) return false;
                if (!contentKeys.includes('category') || !lastKeys.includes('category')) return false;
                if (content.category !== last.category) return false;
                if (!contentKeys.includes('action') || !lastKeys.includes('action')) return false;
                if (content.action !== last.action) return false;
                return (this.duplicateFeature(last, content, lastKeys, contentKeys) ||
                  this.duplicateContent(last, content, lastKeys, contentKeys) ||
                  this.duplicateMilestone(last, content, lastKeys, contentKeys));
              }

              duplicateFeature(last, content, lastKeys, contentKeys) {
                if (content.category !== 'Feature' || last.category !== 'Feature') return false;
                return content.name === last.name;
              }

              duplicateContent(last, content, lastKeys, contentKeys) {
                if (content.category !== 'Content' || last.category !== 'Content') return false;
                if (!contentKeys.includes('type') && !lastKeys.includes('type')) return true;
                if (content.type !== last.type) return false;
                if (!contentKeys.includes('identifier') && !lastKeys.includes('identifier')) return true;
                if (content.identifier !== last.identifier) return false;
                if (!contentKeys.includes('details') && !lastKeys.includes('details')) return true;
                return content.details === last.details;
              }

              duplicateMilestone(last, content, lastKeys, contentKeys) {
                if (content.category === 'Feature' || last.category === 'Feature') return false;
                if (content.category === 'Content' || last.category === 'Content') return false;
                if (content.name !== last.name) return false;
                return content.details === last.details;
              }

              journey() {
                return retrieveLocal('view-journey');
              }

              storeJourney(journey) {
                storeLocal('view-journey', journey);
              }

              reset() {
                this.restoreJourney = this.journey();
                resetLocal('view-journey');
                this.storeJourney([]);
                return this.restoreJourney
              }

              restore(journey = null) {
                let currentJourney = this.journey();
                let restoreJourney = journey ? journey : this.restoreJourney;
                if (currentJourney !== null && currentJourney.length) {
                  restoreJourney = restoreJourney.concat(currentJourney);
                }

                function compare( a, b ) {
                  if ( a.timestamp < b.timestamp ){
                    return -1;
                  }
                  if ( a.timestamp > b.timestamp ){
                    return 1;
                  }
                  return 0;
                }
                restoreJourney.sort( compare );
                this.storeJourney(restoreJourney);
                this.restoreJourney = [];
              }

              hasClassInHierarchy(target, className, maxDepth) {
                const searcher = (node, className, maxDepth, currentDepth) => {
                  if (currentDepth >= maxDepth)
                    return false;
                  if (node.className.toString().includes(className))
                    return true;
                  if (!node.parentElement)
                    return false;
                  return searcher(node.parentElement, className, maxDepth, currentDepth + 1);
                };

                return searcher(target, className, maxDepth, 0);
              }

              decipherParamsPerLibrary(params) {
                if (params.has('xenonSrc')) {
                  return [params.get('xenonSrc'), params.get('xenonId')];
                }
                if (params.has('cr_campaignid')) {
                  return ['Cerebro', params.get('cr_campaignid')];
                }
                if (params.has('utm_source') && params.get('utm_source').toLowerCase() === 'klaviyo') {
                  const source = 'Klaviyo' + (params.has('utm_medium') ? ' - ' + params.get('utm_medium') : '');
                  return [source, params.get('utm_campaign')];
                }
                if (params.has('g_campaignid')) {
                  return ['Google Ad', params.get('g_campaignid')]
                }
                if (params.has('utm_source') && params.get('utm_source').toLowerCase() === 'shareasale') {
                  return ['Share-a-sale', params.get('sscid')]
                }
                if (params.has('sscid')) {
                  return ['Share-a-sale', params.get('sscid')]
                }
                if (params.has('g_adtype') && params.get('g_adtype') === 'none') {
                  return ['Google Organic', params.get('g_campaign')]
                }
                if (params.has('g_adtype') && params.get('g_adtype') === 'search') {
                  return ['Google Paid Search', params.get('g_campaign')]
                }
                if (params.has('utm_source') && params.get('utm_source') === 'facebook') {
                  return ['Facebook Ad', params.get('utm_campaign')]
                }
                if (params.has('utm_source') && params.get('utm_source').toLowerCase() === 'email-broadcast') {
                  return ['Email', params.get('utm_campaign')]
                }
                if (params.has('utm_source') && params.get('utm_source').toLowerCase() === 'youtube') {
                  return ['YouTube', params.get('utm_campaign')]
                }
                if (params.has('utm_source')) {
                  return [params.get('utm_source'), params.get('utm_campaign')]
                }
                return ['Unattributed']
              }

              autodiscoverLeadFrom(queryFromUrl) {
                if (queryFromUrl && queryFromUrl !== '' && queryFromUrl !== '?') {
                  const params = new URLSearchParams(queryFromUrl);
                  const [source, identifier] = this.decipherParamsPerLibrary(params);
                  let attribution = retrieveSession('view-attribution');
                  if (attribution) return queryFromUrl;
                  storeSession('view-attribution', {
                    leadSource: source,
                    leadCampaign: identifier,
                    leadGuid: null
                  });
                  let variantNames = retrieveSession('view-tags');
                  if (source && (!variantNames || !variantNames.includes(source))) {
                    if (variantNames) {
                      variantNames.push(source);
                      if (identifier) {
                        variantNames.push(identifier);
                      }
                    } else {
                      variantNames = [source];
                      if (identifier) {
                        variantNames.push(identifier);
                      }
                    }
                    this.variant(variantNames);
                    (source === 'Unattributed') ?
                      this.leadUnattributed() :
                      this.leadAttributed(source, identifier);
                  }
                  params.delete('xenonId');
                  params.delete('xenonSrc');
                  let query = "";
                  if (params.size) {
                    query = "?" + params.toString();
                  }
                  return query;
                } else {
                  let variantNames = retrieveSession('view-tags');
                  const source = 'Unattributed';
                  let attribution = retrieveSession('view-attribution');
                  if (attribution) return queryFromUrl;
                  storeSession('view-attribution', {
                    leadSource: source,
                    leadCampaign: null,
                    leadGuid: null
                  });
                  if (!variantNames || !variantNames.includes(source)) {
                    (variantNames) ? variantNames.push(source) : variantNames = [source];
                    this.variant(variantNames);
                    this.leadUnattributed();
                  }
                  return queryFromUrl;
                }
              }

              pageURL(url) {
                this.pageURL_ = url;
              }
            }

            const Xenon = new _Xenon();

            return Xenon;

})();
