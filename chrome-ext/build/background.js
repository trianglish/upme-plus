(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    chrome.webRequest.onBeforeSendHeaders.addListener(
        function(info) {
          // xhr.js:126 Refused to set unsafe header "User-Agent"
          // xhr.js:126 Refused to set unsafe header "Connection"
          // xhr.js:126 Refused to set unsafe header "Accept-Encoding"
          // xhr.js:126 Refused to set unsafe header "Cookie2"


            let headers = info.requestHeaders;

            console.log('headers', headers);

            const new_headers = headers
              .filter(header => header.name.includes('X-Instaweb'))
              .map(header => {
                return {
                  name: header.name.replace('X-Instaweb-', ''),
                  value: header.value,
                }
              });

            console.log('new headers', new_headers);

            headers.forEach(header => {
              const new_header = new_headers.find(_ => _.name == header.name);

              if (new_header) {
                console.log(`changing header '${header.name}' to '${new_header.name}':`, header.value, new_header.value);
                header.value = new_header.value;
              }
            });

            console.log('edited headers', headers);

            return {
              requestHeaders: headers
            };

        },
        // Request filter
        {
            // Modify the headers for these pages
            urls: [
              "https://caffeinum.github.io/*",
              "https://instagrambot.github.io/*",
              "https://dashboard.gramup.me/*",
              "https://api.gramup.me/*",
              "https://gramup.me/*",
              "*://localhost/*",
              "file://*/*",
              "chrome-extension://*/*",
              // TODO: remove wildcard
              "*://*/*"
            ],
            // In the main window and frames
            types: ["main_frame", "sub_frame", "xmlhttprequest"]
        },
        ["blocking", "requestHeaders"]
    );

    chrome.runtime.onInstalled.addListener(async function (object) {
      const { username, password } = await getCredentials();

      chrome.tabs.create({ url: "popup.html" }, function (tab) {});
    });

    const API_URL = 'https://i.instagram.com/api/v1/';
    const API_URL_v2 = 'https://i.instagram.com/api/v2/';

    // # I have more devices here:
    // # https://github.com/instagrambot/instabot/blob/72d10447986db39ac95f3d0980936d9c08428b02/instabot/api/devices.py
    // # idk which to use, let's for now use this one, because it is just works

    const DEFAULT_DEVICE = 'one_plus_7';

    const DEVICES = {
    	// Released on August 2019
        'one_plus_7': {
            'instagram_version': '103.1.0.15.119',
            'android_version': 28,
            'android_release': '9.0',
            'dpi': '420dpi',
            'resolution': '1080x2260',
            'manufacturer': 'OnePlus',
            'device': 'GM1903',
            'model': 'OnePlus7',
            'cpu': 'qcom'
        },
        // Released on March 2016
        'samsung_galaxy_s7': {
            'instagram_version': '26.0.0.10.86',
            'android_version': 24,
            'android_release': '7.0',
            'dpi': '640dpi',
            'resolution': '1440x2560',
            'manufacturer': 'samsung',
            'device': 'SM-G930F',
            'model': 'herolte',
            'cpu': 'samsungexynos8890',
        },
        // Released on January 2017
        'huawei_mate_9_pro': {
            'instagram_version': '26.0.0.10.86',
            'android_version': 24,
            'android_release': '7.0',
            'dpi': '640dpi',
            'resolution': '1440x2560',
            'manufacturer': 'HUAWEI',
            'device': 'LON-L29',
            'model': 'HWLON',
            'cpu': 'hi3660'
        },
        // Released on February 2018
        'samsung_galaxy_s9_plus': {
            'instagram_version': '96.0.0.28.114',
            'android_version': 24,
            'android_release': '7.0',
            'dpi': '640dpi',
            'resolution': '1440x2560',
            'manufacturer': 'samsung',
            'device': 'SM-G965F',
            'model': 'star2qltecs',
            'cpu': 'samsungexynos9810'
        },
        // Released on November 2016
        'one_plus_3t': {
            'instagram_version': '26.0.0.10.86',
            'android_version': 24,
            'android_release': '7.0',
            'dpi': '380dpi',
            'resolution': '1080x1920',
            'manufacturer': 'OnePlus',
            'device': 'ONEPLUS A3010',
            'model': 'OnePlus3T',
            'cpu': 'qcom'
        },
        // Released on April 2016
        'lg_g5': {
            'instagram_version': '26.0.0.10.86',
            'android_version': 23,
            'android_release': '6.0.1',
            'dpi': '640dpi',
            'resolution': '1440x2392',
            'manufacturer': 'LGE/lge',
            'device': 'RS988',
            'model': 'h1',
            'cpu': 'h1'
        },
        // Released on June 2016
        'zte_axon_7': {
            'instagram_version': '26.0.0.10.86',
            'android_version': 23,
            'android_release': '6.0.1',
            'dpi': '640dpi',
            'resolution': '1440x2560',
            'manufacturer': 'ZTE',
            'device': 'ZTE A2017U',
            'model': 'ailsa_ii',
            'cpu': 'qcom'
        },
        // Released on March 2016
        'samsung_galaxy_s7_edge': {
            'instagram_version': '26.0.0.10.86',
            'android_version': 23,
            'android_release': '6.0.1',
            'dpi': '640dpi',
            'resolution': '1440x2560',
            'manufacturer': 'samsung',
            'device': 'SM-G935',
            'model': 'hero2lte',
            'cpu': 'samsungexynos8890'
        },
    };

    const DEVICE = DEVICES[DEFAULT_DEVICE];

    const REQUEST_HEADERS = {
        'X-IG-Capabilities': '3brTBw==', // base64.b64encode(struct.pack('<i', 131316445)).decode('ascii')
        'X-IG-Connection-Type': 'WIFI',
        'X-FB-HTTP-Engine': 'Liger',
        'Accept': '*/*',
        'Accept-Language': 'en-US',
        'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',

        'Accept-Encoding': 'gzip,deflate',
        'Connection': 'Keep-Alive',
        'Cookie2': '$Version=1',

          // xhr.js:126 Refused to set unsafe header "User-Agent"
          // xhr.js:126 Refused to set unsafe header "Connection"
          // xhr.js:126 Refused to set unsafe header "Accept-Encoding"
          // xhr.js:126 Refused to set unsafe header "Cookie2"

          // 'X-Instaweb-Accept-Encoding': 'gzip,deflate',
          // 'X-Instaweb-Connection': 'Keep-Alive',
          // 'X-Instaweb-Cookie2': '$Version=1',
    };

    // Instagram Signature Key (v117.0.0.28.123) ARM and x86
    // from https://github.com/itsMoji/Instagram_SSL_Pinning
    // v117.0.0.28.123: a86109795736d73c9a94172cd9b736917d7d94ca61c9101164894b3f0d43bef4
    // v130.0.0.31.121: f0bdfd5332d66a64d5e04965e6a7ade67c4e2cfc57ea38f0083c0400640a5e20
    const IG_SIG_KEY = "f0bdfd5332d66a64d5e04965e6a7ade67c4e2cfc57ea38f0083c0400640a5e20";

    const IG_VERSION = "130.0.0.31.121";

    // console.log(" ---> Preparing consts:")

    const USER_AGENT_BASE = (params) =>
        `Instagram ${IG_VERSION} `
      + `Android (${params.android_version}/${params.android_release}; `
      + `${params.dpi}; ${params.resolution}; ${params.manufacturer}; `
      + `${params.device}; ${params.model}; ${params.cpu}; en_US)`;

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*!
     * Determine if an object is a Buffer
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     */

    var isBuffer = function isBuffer (obj) {
      return obj != null && obj.constructor != null &&
        typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = merge(result[key], val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim
    };

    var global$1 = (typeof global !== "undefined" ? global :
      typeof self !== "undefined" ? self :
      typeof window !== "undefined" ? window : {});

    // shim for using process in browser
    // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    var cachedSetTimeout = defaultSetTimout;
    var cachedClearTimeout = defaultClearTimeout;
    if (typeof global$1.setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
    }
    if (typeof global$1.clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
    }

    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }


    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }



    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    function nextTick(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    }
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    var title = 'browser';
    var platform = 'browser';
    var browser = true;
    var env = {};
    var argv = [];
    var version = ''; // empty string to avoid regexp issues
    var versions = {};
    var release = {};
    var config = {};

    function noop() {}

    var on = noop;
    var addListener = noop;
    var once = noop;
    var off = noop;
    var removeListener = noop;
    var removeAllListeners = noop;
    var emit = noop;

    function binding(name) {
        throw new Error('process.binding is not supported');
    }

    function cwd () { return '/' }
    function chdir (dir) {
        throw new Error('process.chdir is not supported');
    }function umask() { return 0; }

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global$1.performance || {};
    var performanceNow =
      performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    // generate timestamp or delta
    // see http://nodejs.org/api/process.html#process_process_hrtime
    function hrtime(previousTimestamp){
      var clocktime = performanceNow.call(performance)*1e-3;
      var seconds = Math.floor(clocktime);
      var nanoseconds = Math.floor((clocktime%1)*1e9);
      if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds<0) {
          seconds--;
          nanoseconds += 1e9;
        }
      }
      return [seconds,nanoseconds]
    }

    var startTime = new Date();
    function uptime() {
      var currentTime = new Date();
      var dif = currentTime - startTime;
      return dif / 1000;
    }

    var browser$1 = {
      nextTick: nextTick,
      title: title,
      browser: browser,
      env: env,
      argv: argv,
      version: version,
      versions: versions,
      on: on,
      addListener: addListener,
      once: once,
      off: off,
      removeListener: removeListener,
      removeAllListeners: removeAllListeners,
      emit: emit,
      binding: binding,
      cwd: cwd,
      chdir: chdir,
      umask: umask,
      hrtime: hrtime,
      platform: platform,
      release: release,
      config: config,
      uptime: uptime
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }
      error.request = request;
      error.response = response;
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      // Note: status is not exposed by XDomainRequest
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        var msie = /(msie|trident)/i.test(navigator.userAgent);
        var urlParsingNode = document.createElement('a');
        var originURL;

        /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
        function resolveURL(url) {
          var href = url;

          if (msie) {
            // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                      urlParsingNode.pathname :
                      '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
        return function isURLSameOrigin(requestURL) {
          var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
        };
      })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })()
    );

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            var cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },

          read: function read(name) {
            var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return (match ? decodeURIComponent(match[3]) : null);
          },

          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :

      // Non standard browser env (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password || '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          var cookies$1 = cookies;

          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
              cookies$1.read(config.xsrfCookieName) :
              undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (config.withCredentials) {
          request.withCredentials = true;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (requestData === undefined) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof browser$1 !== 'undefined') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Support baseURL config
      if (config.baseURL && !isAbsoluteURL(config.url)) {
        config.url = combineURLs(config.baseURL, config.url);
      }

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers || {}
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = utils.merge({
          url: arguments[0]
        }, arguments[1]);
      }

      config = utils.merge(defaults_1, {method: 'get'}, this.defaults, config);
      config.method = config.method.toLowerCase();

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(utils.merge(defaults_1, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var default_1 = axios;
    axios_1.default = default_1;

    var axios$1 = axios_1;

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var md5 = createCommonjsModule(function (module) {
    (function ($) {

      /*
      * Add integers, wrapping at 2^32. This uses 16-bit operations internally
      * to work around bugs in some JS interpreters.
      */
      function safeAdd (x, y) {
        var lsw = (x & 0xffff) + (y & 0xffff);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff)
      }

      /*
      * Bitwise rotate a 32-bit number to the left.
      */
      function bitRotateLeft (num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt))
      }

      /*
      * These functions implement the four basic operations the algorithm uses.
      */
      function md5cmn (q, a, b, x, s, t) {
        return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
      }
      function md5ff (a, b, c, d, x, s, t) {
        return md5cmn((b & c) | (~b & d), a, b, x, s, t)
      }
      function md5gg (a, b, c, d, x, s, t) {
        return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
      }
      function md5hh (a, b, c, d, x, s, t) {
        return md5cmn(b ^ c ^ d, a, b, x, s, t)
      }
      function md5ii (a, b, c, d, x, s, t) {
        return md5cmn(c ^ (b | ~d), a, b, x, s, t)
      }

      /*
      * Calculate the MD5 of an array of little-endian words, and a bit length.
      */
      function binlMD5 (x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[((len + 64) >>> 9 << 4) + 14] = len;

        var i;
        var olda;
        var oldb;
        var oldc;
        var oldd;
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;

        for (i = 0; i < x.length; i += 16) {
          olda = a;
          oldb = b;
          oldc = c;
          oldd = d;

          a = md5ff(a, b, c, d, x[i], 7, -680876936);
          d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
          b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

          a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = md5gg(b, c, d, a, x[i], 20, -373897302);
          a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

          a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
          d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = md5hh(d, a, b, c, x[i], 11, -358537222);
          c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

          a = md5ii(a, b, c, d, x[i], 6, -198630844);
          d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

          a = safeAdd(a, olda);
          b = safeAdd(b, oldb);
          c = safeAdd(c, oldc);
          d = safeAdd(d, oldd);
        }
        return [a, b, c, d]
      }

      /*
      * Convert an array of little-endian words to a string
      */
      function binl2rstr (input) {
        var i;
        var output = '';
        var length32 = input.length * 32;
        for (i = 0; i < length32; i += 8) {
          output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff);
        }
        return output
      }

      /*
      * Convert a raw string to an array of little-endian words
      * Characters >255 have their high-byte silently ignored.
      */
      function rstr2binl (input) {
        var i;
        var output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
          output[i] = 0;
        }
        var length8 = input.length * 8;
        for (i = 0; i < length8; i += 8) {
          output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32);
        }
        return output
      }

      /*
      * Calculate the MD5 of a raw string
      */
      function rstrMD5 (s) {
        return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
      }

      /*
      * Calculate the HMAC-MD5, of a key and some data (raw strings)
      */
      function rstrHMACMD5 (key, data) {
        var i;
        var bkey = rstr2binl(key);
        var ipad = [];
        var opad = [];
        var hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
          bkey = binlMD5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5c5c5c5c;
        }
        hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binlMD5(opad.concat(hash), 512 + 128))
      }

      /*
      * Convert a raw string to a hex string
      */
      function rstr2hex (input) {
        var hexTab = '0123456789abcdef';
        var output = '';
        var x;
        var i;
        for (i = 0; i < input.length; i += 1) {
          x = input.charCodeAt(i);
          output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
        }
        return output
      }

      /*
      * Encode a string as utf-8
      */
      function str2rstrUTF8 (input) {
        return unescape(encodeURIComponent(input))
      }

      /*
      * Take string arguments and return either raw or hex encoded strings
      */
      function rawMD5 (s) {
        return rstrMD5(str2rstrUTF8(s))
      }
      function hexMD5 (s) {
        return rstr2hex(rawMD5(s))
      }
      function rawHMACMD5 (k, d) {
        return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
      }
      function hexHMACMD5 (k, d) {
        return rstr2hex(rawHMACMD5(k, d))
      }

      function md5 (string, key, raw) {
        if (!key) {
          if (!raw) {
            return hexMD5(string)
          }
          return rawMD5(string)
        }
        if (!raw) {
          return hexHMACMD5(key, string)
        }
        return rawHMACMD5(key, string)
      }

      if ( module.exports) {
        module.exports = md5;
      } else {
        $.md5 = md5;
      }
    })(commonjsGlobal);
    });

    var sha256 = createCommonjsModule(function (module) {
    /**
     * [js-sha256]{@link https://github.com/emn178/js-sha256}
     *
     * @version 0.9.0
     * @author Chen, Yi-Cyuan [emn178@gmail.com]
     * @copyright Chen, Yi-Cyuan 2014-2017
     * @license MIT
     */
    /*jslint bitwise: true */
    (function () {

      var ERROR = 'input is invalid type';
      var WINDOW = typeof window === 'object';
      var root = WINDOW ? window : {};
      if (root.JS_SHA256_NO_WINDOW) {
        WINDOW = false;
      }
      var WEB_WORKER = !WINDOW && typeof self === 'object';
      var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof browser$1 === 'object' && browser$1.versions && browser$1.versions.node;
      if (NODE_JS) {
        root = commonjsGlobal;
      } else if (WEB_WORKER) {
        root = self;
      }
      var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && 'object' === 'object' && module.exports;
      var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
      var HEX_CHARS = '0123456789abcdef'.split('');
      var EXTRA = [-2147483648, 8388608, 32768, 128];
      var SHIFT = [24, 16, 8, 0];
      var K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
      ];
      var OUTPUT_TYPES = ['hex', 'array', 'digest', 'arrayBuffer'];

      var blocks = [];

      if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
        Array.isArray = function (obj) {
          return Object.prototype.toString.call(obj) === '[object Array]';
        };
      }

      if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
        ArrayBuffer.isView = function (obj) {
          return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
        };
      }

      var createOutputMethod = function (outputType, is224) {
        return function (message) {
          return new Sha256(is224, true).update(message)[outputType]();
        };
      };

      var createMethod = function (is224) {
        var method = createOutputMethod('hex', is224);
        if (NODE_JS) {
          method = nodeWrap(method, is224);
        }
        method.create = function () {
          return new Sha256(is224);
        };
        method.update = function (message) {
          return method.create().update(message);
        };
        for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
          var type = OUTPUT_TYPES[i];
          method[type] = createOutputMethod(type, is224);
        }
        return method;
      };

      var nodeWrap = function (method, is224) {
        var crypto = eval("require('crypto')");
        var Buffer = eval("require('buffer').Buffer");
        var algorithm = is224 ? 'sha224' : 'sha256';
        var nodeMethod = function (message) {
          if (typeof message === 'string') {
            return crypto.createHash(algorithm).update(message, 'utf8').digest('hex');
          } else {
            if (message === null || message === undefined) {
              throw new Error(ERROR);
            } else if (message.constructor === ArrayBuffer) {
              message = new Uint8Array(message);
            }
          }
          if (Array.isArray(message) || ArrayBuffer.isView(message) ||
            message.constructor === Buffer) {
            return crypto.createHash(algorithm).update(new Buffer(message)).digest('hex');
          } else {
            return method(message);
          }
        };
        return nodeMethod;
      };

      var createHmacOutputMethod = function (outputType, is224) {
        return function (key, message) {
          return new HmacSha256(key, is224, true).update(message)[outputType]();
        };
      };

      var createHmacMethod = function (is224) {
        var method = createHmacOutputMethod('hex', is224);
        method.create = function (key) {
          return new HmacSha256(key, is224);
        };
        method.update = function (key, message) {
          return method.create(key).update(message);
        };
        for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
          var type = OUTPUT_TYPES[i];
          method[type] = createHmacOutputMethod(type, is224);
        }
        return method;
      };

      function Sha256(is224, sharedMemory) {
        if (sharedMemory) {
          blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
            blocks[4] = blocks[5] = blocks[6] = blocks[7] =
            blocks[8] = blocks[9] = blocks[10] = blocks[11] =
            blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
          this.blocks = blocks;
        } else {
          this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        if (is224) {
          this.h0 = 0xc1059ed8;
          this.h1 = 0x367cd507;
          this.h2 = 0x3070dd17;
          this.h3 = 0xf70e5939;
          this.h4 = 0xffc00b31;
          this.h5 = 0x68581511;
          this.h6 = 0x64f98fa7;
          this.h7 = 0xbefa4fa4;
        } else { // 256
          this.h0 = 0x6a09e667;
          this.h1 = 0xbb67ae85;
          this.h2 = 0x3c6ef372;
          this.h3 = 0xa54ff53a;
          this.h4 = 0x510e527f;
          this.h5 = 0x9b05688c;
          this.h6 = 0x1f83d9ab;
          this.h7 = 0x5be0cd19;
        }

        this.block = this.start = this.bytes = this.hBytes = 0;
        this.finalized = this.hashed = false;
        this.first = true;
        this.is224 = is224;
      }

      Sha256.prototype.update = function (message) {
        if (this.finalized) {
          return;
        }
        var notString, type = typeof message;
        if (type !== 'string') {
          if (type === 'object') {
            if (message === null) {
              throw new Error(ERROR);
            } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
              message = new Uint8Array(message);
            } else if (!Array.isArray(message)) {
              if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
                throw new Error(ERROR);
              }
            }
          } else {
            throw new Error(ERROR);
          }
          notString = true;
        }
        var code, index = 0, i, length = message.length, blocks = this.blocks;

        while (index < length) {
          if (this.hashed) {
            this.hashed = false;
            blocks[0] = this.block;
            blocks[16] = blocks[1] = blocks[2] = blocks[3] =
              blocks[4] = blocks[5] = blocks[6] = blocks[7] =
              blocks[8] = blocks[9] = blocks[10] = blocks[11] =
              blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
          }

          if (notString) {
            for (i = this.start; index < length && i < 64; ++index) {
              blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
            }
          } else {
            for (i = this.start; index < length && i < 64; ++index) {
              code = message.charCodeAt(index);
              if (code < 0x80) {
                blocks[i >> 2] |= code << SHIFT[i++ & 3];
              } else if (code < 0x800) {
                blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
                blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
              } else if (code < 0xd800 || code >= 0xe000) {
                blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
                blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
              } else {
                code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
                blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
                blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
                blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
              }
            }
          }

          this.lastByteIndex = i;
          this.bytes += i - this.start;
          if (i >= 64) {
            this.block = blocks[16];
            this.start = i - 64;
            this.hash();
            this.hashed = true;
          } else {
            this.start = i;
          }
        }
        if (this.bytes > 4294967295) {
          this.hBytes += this.bytes / 4294967296 << 0;
          this.bytes = this.bytes % 4294967296;
        }
        return this;
      };

      Sha256.prototype.finalize = function () {
        if (this.finalized) {
          return;
        }
        this.finalized = true;
        var blocks = this.blocks, i = this.lastByteIndex;
        blocks[16] = this.block;
        blocks[i >> 2] |= EXTRA[i & 3];
        this.block = blocks[16];
        if (i >= 56) {
          if (!this.hashed) {
            this.hash();
          }
          blocks[0] = this.block;
          blocks[16] = blocks[1] = blocks[2] = blocks[3] =
            blocks[4] = blocks[5] = blocks[6] = blocks[7] =
            blocks[8] = blocks[9] = blocks[10] = blocks[11] =
            blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        }
        blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
        blocks[15] = this.bytes << 3;
        this.hash();
      };

      Sha256.prototype.hash = function () {
        var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6,
          h = this.h7, blocks = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;

        for (j = 16; j < 64; ++j) {
          // rightrotate
          t1 = blocks[j - 15];
          s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
          t1 = blocks[j - 2];
          s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
          blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
        }

        bc = b & c;
        for (j = 0; j < 64; j += 4) {
          if (this.first) {
            if (this.is224) {
              ab = 300032;
              t1 = blocks[0] - 1413257819;
              h = t1 - 150054599 << 0;
              d = t1 + 24177077 << 0;
            } else {
              ab = 704751109;
              t1 = blocks[0] - 210244248;
              h = t1 - 1521486534 << 0;
              d = t1 + 143694565 << 0;
            }
            this.first = false;
          } else {
            s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
            s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
            ab = a & b;
            maj = ab ^ (a & c) ^ bc;
            ch = (e & f) ^ (~e & g);
            t1 = h + s1 + ch + K[j] + blocks[j];
            t2 = s0 + maj;
            h = d + t1 << 0;
            d = t1 + t2 << 0;
          }
          s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
          s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
          da = d & a;
          maj = da ^ (d & b) ^ ab;
          ch = (h & e) ^ (~h & f);
          t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
          t2 = s0 + maj;
          g = c + t1 << 0;
          c = t1 + t2 << 0;
          s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
          s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
          cd = c & d;
          maj = cd ^ (c & a) ^ da;
          ch = (g & h) ^ (~g & e);
          t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
          t2 = s0 + maj;
          f = b + t1 << 0;
          b = t1 + t2 << 0;
          s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
          s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
          bc = b & c;
          maj = bc ^ (b & d) ^ cd;
          ch = (f & g) ^ (~f & h);
          t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
          t2 = s0 + maj;
          e = a + t1 << 0;
          a = t1 + t2 << 0;
        }

        this.h0 = this.h0 + a << 0;
        this.h1 = this.h1 + b << 0;
        this.h2 = this.h2 + c << 0;
        this.h3 = this.h3 + d << 0;
        this.h4 = this.h4 + e << 0;
        this.h5 = this.h5 + f << 0;
        this.h6 = this.h6 + g << 0;
        this.h7 = this.h7 + h << 0;
      };

      Sha256.prototype.hex = function () {
        this.finalize();

        var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
          h6 = this.h6, h7 = this.h7;

        var hex = HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F] +
          HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F] +
          HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F] +
          HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
          HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F] +
          HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F] +
          HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F] +
          HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
          HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F] +
          HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F] +
          HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F] +
          HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
          HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F] +
          HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F] +
          HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F] +
          HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
          HEX_CHARS[(h4 >> 28) & 0x0F] + HEX_CHARS[(h4 >> 24) & 0x0F] +
          HEX_CHARS[(h4 >> 20) & 0x0F] + HEX_CHARS[(h4 >> 16) & 0x0F] +
          HEX_CHARS[(h4 >> 12) & 0x0F] + HEX_CHARS[(h4 >> 8) & 0x0F] +
          HEX_CHARS[(h4 >> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F] +
          HEX_CHARS[(h5 >> 28) & 0x0F] + HEX_CHARS[(h5 >> 24) & 0x0F] +
          HEX_CHARS[(h5 >> 20) & 0x0F] + HEX_CHARS[(h5 >> 16) & 0x0F] +
          HEX_CHARS[(h5 >> 12) & 0x0F] + HEX_CHARS[(h5 >> 8) & 0x0F] +
          HEX_CHARS[(h5 >> 4) & 0x0F] + HEX_CHARS[h5 & 0x0F] +
          HEX_CHARS[(h6 >> 28) & 0x0F] + HEX_CHARS[(h6 >> 24) & 0x0F] +
          HEX_CHARS[(h6 >> 20) & 0x0F] + HEX_CHARS[(h6 >> 16) & 0x0F] +
          HEX_CHARS[(h6 >> 12) & 0x0F] + HEX_CHARS[(h6 >> 8) & 0x0F] +
          HEX_CHARS[(h6 >> 4) & 0x0F] + HEX_CHARS[h6 & 0x0F];
        if (!this.is224) {
          hex += HEX_CHARS[(h7 >> 28) & 0x0F] + HEX_CHARS[(h7 >> 24) & 0x0F] +
            HEX_CHARS[(h7 >> 20) & 0x0F] + HEX_CHARS[(h7 >> 16) & 0x0F] +
            HEX_CHARS[(h7 >> 12) & 0x0F] + HEX_CHARS[(h7 >> 8) & 0x0F] +
            HEX_CHARS[(h7 >> 4) & 0x0F] + HEX_CHARS[h7 & 0x0F];
        }
        return hex;
      };

      Sha256.prototype.toString = Sha256.prototype.hex;

      Sha256.prototype.digest = function () {
        this.finalize();

        var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
          h6 = this.h6, h7 = this.h7;

        var arr = [
          (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,
          (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,
          (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,
          (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,
          (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,
          (h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF,
          (h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, h6 & 0xFF
        ];
        if (!this.is224) {
          arr.push((h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF);
        }
        return arr;
      };

      Sha256.prototype.array = Sha256.prototype.digest;

      Sha256.prototype.arrayBuffer = function () {
        this.finalize();

        var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
        var dataView = new DataView(buffer);
        dataView.setUint32(0, this.h0);
        dataView.setUint32(4, this.h1);
        dataView.setUint32(8, this.h2);
        dataView.setUint32(12, this.h3);
        dataView.setUint32(16, this.h4);
        dataView.setUint32(20, this.h5);
        dataView.setUint32(24, this.h6);
        if (!this.is224) {
          dataView.setUint32(28, this.h7);
        }
        return buffer;
      };

      function HmacSha256(key, is224, sharedMemory) {
        var i, type = typeof key;
        if (type === 'string') {
          var bytes = [], length = key.length, index = 0, code;
          for (i = 0; i < length; ++i) {
            code = key.charCodeAt(i);
            if (code < 0x80) {
              bytes[index++] = code;
            } else if (code < 0x800) {
              bytes[index++] = (0xc0 | (code >> 6));
              bytes[index++] = (0x80 | (code & 0x3f));
            } else if (code < 0xd800 || code >= 0xe000) {
              bytes[index++] = (0xe0 | (code >> 12));
              bytes[index++] = (0x80 | ((code >> 6) & 0x3f));
              bytes[index++] = (0x80 | (code & 0x3f));
            } else {
              code = 0x10000 + (((code & 0x3ff) << 10) | (key.charCodeAt(++i) & 0x3ff));
              bytes[index++] = (0xf0 | (code >> 18));
              bytes[index++] = (0x80 | ((code >> 12) & 0x3f));
              bytes[index++] = (0x80 | ((code >> 6) & 0x3f));
              bytes[index++] = (0x80 | (code & 0x3f));
            }
          }
          key = bytes;
        } else {
          if (type === 'object') {
            if (key === null) {
              throw new Error(ERROR);
            } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
              key = new Uint8Array(key);
            } else if (!Array.isArray(key)) {
              if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
                throw new Error(ERROR);
              }
            }
          } else {
            throw new Error(ERROR);
          }
        }

        if (key.length > 64) {
          key = (new Sha256(is224, true)).update(key).array();
        }

        var oKeyPad = [], iKeyPad = [];
        for (i = 0; i < 64; ++i) {
          var b = key[i] || 0;
          oKeyPad[i] = 0x5c ^ b;
          iKeyPad[i] = 0x36 ^ b;
        }

        Sha256.call(this, is224, sharedMemory);

        this.update(iKeyPad);
        this.oKeyPad = oKeyPad;
        this.inner = true;
        this.sharedMemory = sharedMemory;
      }
      HmacSha256.prototype = new Sha256();

      HmacSha256.prototype.finalize = function () {
        Sha256.prototype.finalize.call(this);
        if (this.inner) {
          this.inner = false;
          var innerHash = this.array();
          Sha256.call(this, this.is224, this.sharedMemory);
          this.update(this.oKeyPad);
          this.update(innerHash);
          Sha256.prototype.finalize.call(this);
        }
      };

      var exports = createMethod();
      exports.sha256 = exports;
      exports.sha224 = createMethod(true);
      exports.sha256.hmac = createHmacMethod();
      exports.sha224.hmac = createHmacMethod(true);

      if (COMMON_JS) {
        module.exports = exports;
      } else {
        root.sha256 = exports.sha256;
        root.sha224 = exports.sha224;
      }
    })();
    });

    /*
     * UUID-js: A js library to generate and parse UUIDs, TimeUUIDs and generate
     * TimeUUID based on dates for range selections.
     * @see http://www.ietf.org/rfc/rfc4122.txt
     **/

    function UUIDjs() {
    }
    UUIDjs.maxFromBits = function(bits) {
      return Math.pow(2, bits);
    };

    UUIDjs.limitUI04 = UUIDjs.maxFromBits(4);
    UUIDjs.limitUI06 = UUIDjs.maxFromBits(6);
    UUIDjs.limitUI08 = UUIDjs.maxFromBits(8);
    UUIDjs.limitUI12 = UUIDjs.maxFromBits(12);
    UUIDjs.limitUI14 = UUIDjs.maxFromBits(14);
    UUIDjs.limitUI16 = UUIDjs.maxFromBits(16);
    UUIDjs.limitUI32 = UUIDjs.maxFromBits(32);
    UUIDjs.limitUI40 = UUIDjs.maxFromBits(40);
    UUIDjs.limitUI48 = UUIDjs.maxFromBits(48);

    // Returns a random integer between min and max
    // Using Math.round() will give you a non-uniform distribution!
    // @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/random
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    UUIDjs.randomUI04 = function() {
      return getRandomInt(0, UUIDjs.limitUI04-1);
    };
    UUIDjs.randomUI06 = function() {
      return getRandomInt(0, UUIDjs.limitUI06-1);
    };
    UUIDjs.randomUI08 = function() {
      return getRandomInt(0, UUIDjs.limitUI08-1);
    };
    UUIDjs.randomUI12 = function() {
      return getRandomInt(0, UUIDjs.limitUI12-1);
    };
    UUIDjs.randomUI14 = function() {
      return getRandomInt(0, UUIDjs.limitUI14-1);
    };
    UUIDjs.randomUI16 = function() {
      return getRandomInt(0, UUIDjs.limitUI16-1);
    };
    UUIDjs.randomUI32 = function() {
      return getRandomInt(0, UUIDjs.limitUI32-1);
    };
    UUIDjs.randomUI40 = function() {
      return (0 | Math.random() * (1 << 30)) + (0 | Math.random() * (1 << 40 - 30)) * (1 << 30);
    };
    UUIDjs.randomUI48 = function() {
      return (0 | Math.random() * (1 << 30)) + (0 | Math.random() * (1 << 48 - 30)) * (1 << 30);
    };

    UUIDjs.paddedString = function(string, length, z) {
      string = String(string);
      z = (!z) ? '0' : z;
      var i = length - string.length;
      for (; i > 0; i >>>= 1, z += z) {
        if (i & 1) {
          string = z + string;
        }
      }
      return string;
    };

    UUIDjs.prototype.fromParts = function(timeLow, timeMid, timeHiAndVersion, clockSeqHiAndReserved, clockSeqLow, node) {
      this.version = (timeHiAndVersion >> 12) & 0xF;
      this.hex = UUIDjs.paddedString(timeLow.toString(16), 8)
                 + '-'
                 + UUIDjs.paddedString(timeMid.toString(16), 4)
                 + '-'
                 + UUIDjs.paddedString(timeHiAndVersion.toString(16), 4)
                 + '-'
                 + UUIDjs.paddedString(clockSeqHiAndReserved.toString(16), 2)
                 + UUIDjs.paddedString(clockSeqLow.toString(16), 2)
                 + '-'
                 + UUIDjs.paddedString(node.toString(16), 12);
      return this;
    };

    UUIDjs.prototype.toString = function() {
      return this.hex;
    };
    UUIDjs.prototype.toURN = function() {
      return 'urn:uuid:' + this.hex;
    };

    UUIDjs.prototype.toBytes = function() {
      var parts = this.hex.split('-');
      var ints = [];
      var intPos = 0;
      for (var i = 0; i < parts.length; i++) {
        for (var j = 0; j < parts[i].length; j+=2) {
          ints[intPos++] = parseInt(parts[i].substr(j, 2), 16);
        }
      }
      return ints;
    };

    UUIDjs.prototype.equals = function(uuid) {
      if (!(uuid instanceof UUID)) {
        return false;
      }
      if (this.hex !== uuid.hex) {
        return false;
      }
      return true;
    };

    UUIDjs.getTimeFieldValues = function(time) {
      var ts = time - Date.UTC(1582, 9, 15);
      var hm = ((ts / 0x100000000) * 10000) & 0xFFFFFFF;
      return { low: ((ts & 0xFFFFFFF) * 10000) % 0x100000000,
                mid: hm & 0xFFFF, hi: hm >>> 16, timestamp: ts };
    };

    UUIDjs._create4 = function() {
      return new UUIDjs().fromParts(
        UUIDjs.randomUI32(),
        UUIDjs.randomUI16(),
        0x4000 | UUIDjs.randomUI12(),
        0x80   | UUIDjs.randomUI06(),
        UUIDjs.randomUI08(),
        UUIDjs.randomUI48()
      );
    };

    UUIDjs._create1 = function() {
      var now = new Date().getTime();
      var sequence = UUIDjs.randomUI14();
      var node = (UUIDjs.randomUI08() | 1) * 0x10000000000 + UUIDjs.randomUI40();
      var tick = UUIDjs.randomUI04();
      var timestamp = 0;
      var timestampRatio = 1/4;

      if (now != timestamp) {
        if (now < timestamp) {
          sequence++;
        }
        timestamp = now;
        tick = UUIDjs.randomUI04();
      } else if (Math.random() < timestampRatio && tick < 9984) {
        tick += 1 + UUIDjs.randomUI04();
      } else {
        sequence++;
      }

      var tf = UUIDjs.getTimeFieldValues(timestamp);
      var tl = tf.low + tick;
      var thav = (tf.hi & 0xFFF) | 0x1000;

      sequence &= 0x3FFF;
      var cshar = (sequence >>> 8) | 0x80;
      var csl = sequence & 0xFF;

      return new UUIDjs().fromParts(tl, tf.mid, thav, cshar, csl, node);
    };

    UUIDjs.create = function(version) {
      version = version || 4;
      return this['_create' + version]();
    };

    UUIDjs.fromTime = function(time, last) {
      last = (!last) ? false : last;
      var tf = UUIDjs.getTimeFieldValues(time);
      var tl = tf.low;
      var thav = (tf.hi & 0xFFF) | 0x1000;  // set version '0001'
      if (last === false) {
        return new UUIDjs().fromParts(tl, tf.mid, thav, 0, 0, 0);
      } else {
        return new UUIDjs().fromParts(tl, tf.mid, thav, 0x80 | UUIDjs.limitUI06, UUIDjs.limitUI08 - 1, UUIDjs.limitUI48 - 1);
      }
    };

    UUIDjs.firstFromTime = function(time) {
      return UUIDjs.fromTime(time, false);
    };
    UUIDjs.lastFromTime = function(time) {
      return UUIDjs.fromTime(time, true);
    };

    UUIDjs.fromURN = function(strId) {
      var r, p = /^(?:urn:uuid:|\{)?([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{2})([0-9a-f]{2})-([0-9a-f]{12})(?:\})?$/i;
      if ((r = p.exec(strId))) {
        return new UUIDjs().fromParts(parseInt(r[1], 16), parseInt(r[2], 16),
                                parseInt(r[3], 16), parseInt(r[4], 16),
                                parseInt(r[5], 16), parseInt(r[6], 16));
      }
      return null;
    };

    UUIDjs.fromBytes = function(ints) {
      if (ints.length < 5) {
        return null;
      }
      var str = '';
      var pos = 0;
      var parts = [4, 2, 2, 2, 6];
      for (var i = 0; i < parts.length; i++) {
        for (var j = 0; j < parts[i]; j++) {
          var octet = ints[pos++].toString(16);
          if (octet.length == 1) {
            octet = '0' + octet;
          }
          str += octet;
        }
        if (parts[i] !== 6) {
          str += '-';
        }
      }
      return UUIDjs.fromURN(str);
    };

    UUIDjs.fromBinary = function(binary) {
      var ints = [];
      for (var i = 0; i < binary.length; i++) {
        ints[i] = binary.charCodeAt(i);
        if (ints[i] > 255 || ints[i] < 0) {
          throw new Error('Unexpected byte in binary data.');
        }
      }
      return UUIDjs.fromBytes(ints);
    };

    // Aliases to support legacy code. Do not use these when writing new code as
    // they may be removed in future versions!
    UUIDjs.new = function() {
      return this.create(4);
    };
    UUIDjs.newTS = function() {
      return this.create(1);
    };

    var uuid = UUIDjs;

    const generate_uuid = () => uuid.create(4).hex;

    // ################################################
    // # device_id = properly hashed login and password

    const generate_device_id = (seed) => {
      const volatile_seed = "12345"; // # Important ! :) :)

      const hex = md5(seed + volatile_seed);

      return `android-${hex.slice(0,16)}`
    };

    const generate_device_id_from_username = (username) => {
      return generate_device_id(md5(`${username}${username}`))
    };

    const generate_signature = (data) => {
      if (typeof data != 'string' && !(data instanceof String)) {
        data = JSON.stringify(data);
      }
      // body = hmac.new(IG_SIG_KEY.encode('utf-8'), data.encode('utf-8'), hashlib.sha256).hexdigest()
      // + '.' + urllib.parse.quote(data)
      const header = sha256.hmac(IG_SIG_KEY, data);
      const body = header + `.` + encodeURIComponent(data);
      const signature = `ig_sig_key_version=4&signed_body=${body}`;

      return signature
    };

    const random_from = (arr) => {
      const index = Math.floor( Math.random() * arr.length );

      return arr[index]
    };

    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.


    // If obj.hasOwnProperty has been overridden, then calling
    // obj.hasOwnProperty(prop) will break.
    // See: https://github.com/joyent/node/issues/1707
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    var isArray$1 = Array.isArray || function (xs) {
      return Object.prototype.toString.call(xs) === '[object Array]';
    };
    function stringifyPrimitive(v) {
      switch (typeof v) {
        case 'string':
          return v;

        case 'boolean':
          return v ? 'true' : 'false';

        case 'number':
          return isFinite(v) ? v : '';

        default:
          return '';
      }
    }

    function stringify (obj, sep, eq, name) {
      sep = sep || '&';
      eq = eq || '=';
      if (obj === null) {
        obj = undefined;
      }

      if (typeof obj === 'object') {
        return map(objectKeys(obj), function(k) {
          var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
          if (isArray$1(obj[k])) {
            return map(obj[k], function(v) {
              return ks + encodeURIComponent(stringifyPrimitive(v));
            }).join(sep);
          } else {
            return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
          }
        }).join(sep);

      }

      if (!name) return '';
      return encodeURIComponent(stringifyPrimitive(name)) + eq +
             encodeURIComponent(stringifyPrimitive(obj));
    }
    function map (xs, f) {
      if (xs.map) return xs.map(f);
      var res = [];
      for (var i = 0; i < xs.length; i++) {
        res.push(f(xs[i], i));
      }
      return res;
    }

    var objectKeys = Object.keys || function (obj) {
      var res = [];
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
      }
      return res;
    };

    function parse(qs, sep, eq, options) {
      sep = sep || '&';
      eq = eq || '=';
      var obj = {};

      if (typeof qs !== 'string' || qs.length === 0) {
        return obj;
      }

      var regexp = /\+/g;
      qs = qs.split(sep);

      var maxKeys = 1000;
      if (options && typeof options.maxKeys === 'number') {
        maxKeys = options.maxKeys;
      }

      var len = qs.length;
      // maxKeys <= 0 means that we should not limit keys count
      if (maxKeys > 0 && len > maxKeys) {
        len = maxKeys;
      }

      for (var i = 0; i < len; ++i) {
        var x = qs[i].replace(regexp, '%20'),
            idx = x.indexOf(eq),
            kstr, vstr, k, v;

        if (idx >= 0) {
          kstr = x.substr(0, idx);
          vstr = x.substr(idx + 1);
        } else {
          kstr = x;
          vstr = '';
        }

        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);

        if (!hasOwnProperty(obj, k)) {
          obj[k] = v;
        } else if (isArray$1(obj[k])) {
          obj[k].push(v);
        } else {
          obj[k] = [obj[k], v];
        }
      }

      return obj;
    }var querystring = {
      encode: stringify,
      stringify: stringify,
      decode: parse,
      parse: parse
    };

    // Inspired with Instabot API:

    function is_user_id(user_id_or_username){
      return !isNaN(user_id_or_username)
    }

    const get_user_info = (self, user_id_or_username) => {
      if (is_user_id(user_id_or_username)) {
        const user_id = user_id_or_username;
        return self.send_request(`users/${user_id}/info/`)
      } else {
        const username = user_id_or_username;
        return self.send_request(`users/${username}/usernameinfo/`)
      }
    };

    const logout = async (self) => {
      if (!self.is_logged_in) {
        return true
      }

      const result = await self.send_request('accounts/logout/');

      self.is_logged_in = !result;
      return result
    };

    const get_user_followers = (self, user_id, search_query='', max_id='') => {
      const rank_token = self.rank_token();

      const query_str = querystring.stringify({
        max_id,
        rank_token,
        query: search_query,
      });

      const url = `friendships/${user_id}/followers/?${query_str}`;

      // const url = `friendships/${user_id}/followers/?max_id=${max_id}&rank_token=${rank_token}&`
      return self.send_request(url)
    };

    const get_user_followings = (self, user_id, search_query='', max_id='') => {
      const rank_token = self.rank_token();
      const query_str = querystring.stringify({
        max_id,
        rank_token,
        query: search_query,
      });

      // `max_id=${max_id}&rank_token=${rank_token}&`
      // console.log('query_str', query_str)

      const url = `friendships/${user_id}/following/?${query_str}`;

      return self.send_request(url)
    };

    const get_user_feed = (self, user_id, max_id='') => {
      const rank_token = self.rank_token();
      const url = `feed/user/${user_id}/?max_id=${max_id}&rank_token=${rank_token}&ranked_content=true&`;
      return self.send_request(url)
    };

    const get_hashtag_feed = (self, hashtag, max_id='') => {
        const rank_token = self.rank_token();
        const url = `feed/tag/${hashtag}/?max_id=${max_id}&rank_token=${rank_token}&ranked_content=true&`;
        return self.send_request(url)
    };

    const get_location_feed = (self, location_id, max_id='') => {
        const rank_token = self.rank_token();
        const url = `feed/location/${location_id}/?max_id=${max_id}&rank_token=${rank_token}&ranked_content=true&`;
        return self.send_request(url)
    };

    const media_info = (self, media_id) => {
      return self.send_request(`media/${media_id}/info/`)
    };

    const like = (self, media_id) => {
      return self.send_request(`media/${media_id}/like/`, {})
    };

    const unlike = (self, media_id) => {
      return self.send_request(`media/${media_id}/unlike/`, {})
    };

    const follow = (self, user_id) => {
      return self.send_request(`friendships/create/${user_id}/`, {})
    };

    const unfollow = (self, user_id) => {
      return self.send_request(`friendships/destroy/${user_id}/`, {})
    };

    const user_friendship = (self, user_id) => {
      return self.send_request(`friendships/show/${user_id}/`, { user_id })
    };

    const user_friendships = async (self, user_ids = []) => {
      const data = { user_ids: user_ids.join(',') };

      const default_data = await self.default_data();

      const _data = {
        ...default_data,
        ...data,
      };

      return self.send_request(`friendships/show_many/`, _data, { with_signature: false, form: true })
    };

    const comment = (self, media_id, comment_text) => {
      return self.send_request(`media/${media_id}/comment/`, { comment_text })
    };

    const reply_to_comment = (self, media_id, comment_text, replied_to_comment_id) => {
      return self.send_request(`media/${media_id}/comment/`, { comment_text, replied_to_comment_id })
    };

    const delete_comment = (self, media_id, comment_id) => {
      return self.send_request(`media/${media_id}/comment/${comment_id}/delete/`, {})
    };

    const get_user_story_feed = (self, user_id) => {
      return self.send_request(`feed/user/${user_id}/story/`)
    };

    const search_location = (self, query, lat = '', lng = '') => {
      const rank_token = self.rank_token();
      return self.send_request(`fbsearch/places/?rank_token=${rank_token}&query=${query}&lat=${lat}&lng=${lng}`)
    };

    const __DEPRECATED__get_timeline = (self) => {
      return self.send_request(`feed/timeline/?rank_token=${self.rank_token()}&ranked_content=true`)
    };

    const get_timeline = (self) => {
      const data = {is_prefetch: '0', is_pull_to_refresh: '0'};
      return self.send_request('feed/timeline/', data, { with_signature: false })
    };

    const get_popular_feed = (self) => {
      return self.send_request(`feed/popular/?people_teaser_supported=1&rank_token=${self.rank_token()}&ranked_content=true`)
    };

    const get_comment_likers = (self, comment_id) => {
      return self.send_request(`media/${comment_id}/comment_likers`)
    };

    const get_media_likers = (self, media_id) => {
      return self.send_request(`media/${media_id}/likers`)
    };


    // DIRECT
    const get_inbox = (self) => {
      return self.send_request(`direct_v2/inbox/?`)
    };

    const get_thread = (self, thread_id, cursor_id = '') => {
      return self.send_request(`direct_v2/threads/${thread_id}/?use_unified_inbox=true&${cursor_id ? `cursor=${cursor_id}` : ''}`)
    };

    const get_direct_share = (self) => {
      return self.send_request(`direct_share/inbox/?`)
    };


    const get_pending_inbox = (self) => {
      return self.send_request(`direct_v2/pending_inbox/?persistentBadging=true&use_unified_inbox=true`)
    };

    const approve_pending_thread = async (self, thread_id) => {
      const data = await self.default_data();

      return self.send_request(`direct_v2/threads/${thread_id}/approve/`, data)
    };


    const _prepare_recipients = (users, thread_id = null, use_quotes = false) => {
      const result = {};

      if (users && users.join) {
        result.users = `[[${users.join(',')}]]`;
      }

      if (thread_id) {
        result.thread = use_quotes ? `["${thread_id}"]` : `[${thread_id}]`;
      }

      return result
    };

    const send_direct_item = async (self, item_type = 'text', options = {}) => {

      const mutation_token = generate_uuid();

      const data = {
        // mutation_token,
        'client_context': mutation_token,
        'action': 'send_item',
      };

      const text = options['text'] || '';

      if (item_type == 'link') {
        data['link_text'] = text;
        data['link_urls'] = JSON.stringify(options.urls); // json.dumps(options.get('urls'))
      } else if (item_type == 'text') {
        data['text'] = text;
      } else if (item_type == 'media_share') {
        data['text'] = text;
        data['media_type'] = options.media_type || 'photo'; // options.get('media_type', 'photo')
        data['media_id'] = options.media_id || '';
      } else if (item_type == 'hashtag') {
        data['text'] = text;
        data['Hashtag'] = options.hashtag || '';
      } else if (item_type == 'profile') {
        data['text'] = text;
        data['profile_user_id'] = options.profile_user_id || '';
      }

      const { thread, users } = _prepare_recipients(options.users, options.thread, false);

      if (thread) {
        data['thread_ids'] = thread;
      } else if (users) {
        data['recipient_users'] = users;
      } else {
        return false
      }

      // data.update(self.default_data)
      const default_data = await self.default_data();

      const _data = {
        ...default_data,
        ...data,
      };

      console.log('_data', _data);

      return self.send_request(`direct_v2/threads/broadcast/${item_type}/`, _data, { with_signature: false, form: true })
    };

    const mark_direct_seen = async (self, thread_id, thread_item_id) => {
      const data = {
        action: 'mark_seen',
        use_unified_inbox: true,
        thread_id: thread_id,
        item_id: thread_item_id,
      };

      const default_data = await self.default_data();

      const _data = {
        ...default_data,
        ...data,
      };

      return self.send_request(`direct_v2/threads/${thread_id}/items/${thread_item_id}/seen/`, _data, { with_signature: false, form: true })
    };

    // STORIES
    const get_user_reel = (self, user_id) => {
      const url = `feed/user/${user_id}/reel_media/`;
      return self.send_request(url)
    };

    const get_users_reel = async (self, user_ids) => {
      /*
      Input: user_ids - a list of user_id
      Output: dictionary: user_id - stories data.
      Basically, for each user output the same as after self.get_user_reel
      */
      const url = `feed/reels_media/`;
      user_ids = user_ids.map(id => `${id}`);
      return self.send_request(url, { user_ids })
    };
      //
      // if (res) {
      //   if (res.reels) {
      //     return res.reels
      //   } else {
      //     return []
      //   }
      // } else {}
      // if res:
      //     if "reels" in self.last_json:
      //         return self.last_json["reels"]
      //     return []
      // return []

    const see_reels = async (self, reels = []) => {
      /*
      Input - the list of reels jsons
      They can be aquired by using get_users_reel() or get_user_reel() methods
      */
      if (reels && !reels.join) {
        reels = [reels];
      }

      const story_seen = {};
      // now = int(time.time())
      const now = Math.floor(Date.now() / 1000);
      const randint = (a, b) => Math.floor(a + (b-a) * Math.random());

      // for i, story in enumerate(sorted(reels, key=lambda m: m['taken_at'], reverse=True)):
      //   story_seen_at = now - min(i + 1 + random.randint(0, 2), max(0, now - story['taken_at']))

      reels
        .sort((story1, story2) => story1['taken_at'] - story2['taken_at'])
        .forEach((story, index) => {
          const story_seen_at = now - Math.min(index + 1 + randint(0,2), Math.max(0, now - story['taken_at']));

          story_seen[
            `${story['id']}_${story['user']['pk']}`
            // '{0!s}_{1!s}'.format(story['id'], story['user']['pk'])
          ] = [
            `${story['taken_at']}_${story_seen_at}`
            // '{0!s}_{1!s}'.format(story['taken_at'], story_seen_at)
          ];
        });

      const default_data = await self.default_data();

      const _data = {
        ...default_data,
        reels: story_seen,
      };

      // data = self.json_data({
      //     'reels': story_seen,
      //     '_csrftoken': self.token,
      //     '_uuid': self.uuid,
      //     '_uid': self.user_id
      // })

      return self.send_request('media/seen/', _data, { with_signature: true, v2: true })
    };

    const get_user_stories = (self, user_id) => {
      const url = `feed/user/${user_id}/story/`;
      return self.send_request(url)
    };

    const get_self_story_viewers = (self, story_id) => {
      const config = {}; // ???
      const url = `media/${story_id}/list_reel_media_viewer/?supported_capabilities_new=${config.SUPPORTED_CAPABILITIES}`;
      return self.send_request(url)
    };

    const get_tv_suggestions = (self) => {
      const url = 'igtv/tv_guide/';
      return self.send_request(url)
    };

    const get_hashtag_stories = (self, hashtag) => {
      const url = `tags/${hashtag}/story/`;
      return self.send_request(url)
    };

    const report = async (self, user_id, source_name = 'profile') => {
      const default_data = await self.default_data();

      const _data = {
        ...default_data,
        reason_id: 1,
        user_id: user_id,
        source_name: source_name,
        is_spam: true,
      };

      return self.send_request(`users/${user_id}/flag_user/`, _data, { with_signature: false, form: true })
    };
    //
    // const search_users = (self, query) => {
    //
    //   url = (
    //   "users/search/?ig_sig_key_version={sig_key}"
    //   "&is_typeahead=true&query={query}&rank_token={rank_token}"
    //   )
    //   return self.send_request(
    //   url.format(
    //   sig_key=config.SIG_KEY_VERSION,
    //   query=query,
    //   rank_token=self.rank_token
    //   )
    // )
    // }

    var methods = /*#__PURE__*/Object.freeze({
        __proto__: null,
        get_user_info: get_user_info,
        logout: logout,
        get_user_followers: get_user_followers,
        get_user_followings: get_user_followings,
        get_user_feed: get_user_feed,
        get_hashtag_feed: get_hashtag_feed,
        get_location_feed: get_location_feed,
        media_info: media_info,
        like: like,
        unlike: unlike,
        follow: follow,
        unfollow: unfollow,
        user_friendship: user_friendship,
        user_friendships: user_friendships,
        comment: comment,
        reply_to_comment: reply_to_comment,
        delete_comment: delete_comment,
        get_user_story_feed: get_user_story_feed,
        search_location: search_location,
        __DEPRECATED__get_timeline: __DEPRECATED__get_timeline,
        get_timeline: get_timeline,
        get_popular_feed: get_popular_feed,
        get_comment_likers: get_comment_likers,
        get_media_likers: get_media_likers,
        get_inbox: get_inbox,
        get_thread: get_thread,
        get_direct_share: get_direct_share,
        get_pending_inbox: get_pending_inbox,
        approve_pending_thread: approve_pending_thread,
        send_direct_item: send_direct_item,
        mark_direct_seen: mark_direct_seen,
        get_user_reel: get_user_reel,
        get_users_reel: get_users_reel,
        see_reels: see_reels,
        get_user_stories: get_user_stories,
        get_self_story_viewers: get_self_story_viewers,
        get_tv_suggestions: get_tv_suggestions,
        get_hashtag_stories: get_hashtag_stories,
        report: report
    });

    const FORBIDDEN_HEADERS = [
      'Accept-Encoding',
      'Connection',
      'Cookie2',
      'User-Agent',
    ];

    const PREFIX = 'X-Instaweb-';

    const prefixUnsecureHeaders = (headers, params) => {
      for (const header in headers) {
        if (FORBIDDEN_HEADERS.includes(header)) {
          const prefixedHeader = PREFIX + header;

          headers[prefixedHeader] = headers[header];

          if (params === 'replace') {
            delete headers[header];
          }
        }
      }
      return headers
    };

    const get_locale = () => {
        try {
            if (window.navigator.languages) {
                return window.navigator.languages[0];
            } else {
                return window.navigator.userLanguage || window.navigator.language;
            }
        } catch (err) {
            console.error(err);
            return null
        }
    };

    const print = console.log;

    class Instagram {
      
      constructor(username, password) {

        this.is_logged_in = false;
        this.user_id = null;
        this.user = null;
        this.history = null;
        this.confirmator = null; // new Confirmator()

        this.locale = get_locale();

        this.device = random_from(Object.values(DEVICES)) || DEVICE;
        this.user_agent = USER_AGENT_BASE(this.device); // just insert params

        print("USER_AGENT:", this.user_agent);

        this.phone_id = generate_uuid();
        print("PHONE_ID (just another uuid):", this.phone_id);

        this.uuid = generate_uuid();
        print("UUID:", this.uuid);

        this.rank_token = () => `${this.user_id}_${this.uuid}`;

        this.username = username;
        this.password = password;

        this.total_requests = 0;
        this.last_response = {};

        this.methods = methods;

        this.constants = {
          DEVICE: this.device,
          LOCALE: this.locale,
          IG_SIG_KEY,
        };

        // if (username && password) {
        //   this.login(username, password)
        // }
      }

      async default_data () {
        return {
          '_uuid': this.uuid,
          '_uid': this.user_id,
        }
      }

      async login_via_cookie() {
        if (this.is_logged_in) {
          throw new Error(`Already logged in`);
        }

        console.log('login via cookie');

        const { viewer } = await this.send_request(`direct_v2/inbox/?`, null, { doLogin: true });

        const user_id = viewer.pk;

        const { user, status } = await this.send_request(`users/${user_id}/info/`, null, {
          doLogin: true
        });

        console.log('logged_in', user);

        this.history &&
          this.history.save("login", [user.username, "__from_cookie__"], { status });

        try {
          if (user) {
            this.is_logged_in = true;
            this.user_id = user.pk;
            this.user = user;
            return user;
          } else {
            throw new Error(`Could not log in: ${response}`);
          }
        } catch (err) {
          console.error(`LoginError: ${err.message}`);
          throw err
        }
      }

      async login(username, password, forceLogin = false) {
        if (this.is_logged_in && !forceLogin) {
          throw new Error(`Already logged in`)
        }

        const USERNAME = username || this.username;
        const PASSWORD = password || this.password;

        try {
          const { logged_in_user, status } = await this._login(USERNAME, PASSWORD);

          const MASKED_PASSWORD = PASSWORD.split('').fill('*').join('');
          this.history && this.history.save('login', [USERNAME, MASKED_PASSWORD], { status });

          if (logged_in_user) {
            this.is_logged_in = true;
            this.user_id = logged_in_user.pk;
            this.user = logged_in_user;
            return logged_in_user
          } else {
            throw new Error(`Could not log in: ${response}`)
          }
        } catch (err) {
          console.error(`LoginError: ${err.message}`);
          throw err
        }
      }

      async verify_2fa(username, password, two_factor_code, two_factor_data) {
        const two_factor_id = two_factor_data['two_factor_info']['two_factor_identifier'];

        if (!this.device_id) {
          console.error(`this.device_id uninitialized! You need to call .login first`);
          return false
        }

        const data = {
          device_id: this.device_id,
          username,
          password,
          verification_code: two_factor_code,
          two_factor_identifier: two_factor_id,
          ig_sig_key_version: 4,
        };

        try {
          const { logged_in_user, status } = await this.send_request('accounts/two_factor_login/', data, { doLogin: true });

          const MASKED_PASSWORD = password.split('').fill('*').join('');
          this.history && this.history.save('login', [username, MASKED_PASSWORD], { status });

          if (logged_in_user) {
            this.is_logged_in = true;
            this.user_id = logged_in_user.pk;
            this.user = logged_in_user;
            return logged_in_user
          } else {
            throw new Error(`Could not log in: ${response}`)
          }
        } catch (err) {
          console.error(`LoginError: ${err.message}`);
          throw err
        }
      }

      async _login(username, password) {
        this.device_id = generate_device_id_from_username(username);
        print("DEVICE_ID:", this.device_id);

        const data = JSON.stringify({
            'phone_id': this.phone_id,
            'username': username,
            'guid': this.uuid,
            'device_id': this.device_id,
            'password': password,
            'login_attempt_count': '0',
        });

        print("Final POST DATA before signing:\n", data);
        const signed_data = generate_signature(data);
        print("Final POST DATA after signing:\n", signed_data);

        const response = await this.send_request('accounts/login/', data, { doLogin: true });

        if (response['message'] == 'checkpoint_required') {
          // In case of 'suspicious activity'
          console.log('Checkpoing required:', response['checkpoint_url']);
        }

        return response
      }

      async _request(endpoint, method = 'GET', post_data, extra_headers = {}, { v2 = false, form = false } = {}) {
        const headers = prefixUnsecureHeaders({
          'User-Agent': this.user_agent,
          ...REQUEST_HEADERS,
          ...extra_headers,
        }, 'replace');

        if (form) {
          const bodyFormData = new FormData();

          Object.keys(post_data).forEach(key => {
            bodyFormData.set(key, post_data[key]);
          });

          post_data = bodyFormData;
        }

        const root = v2 ? API_URL_v2 : API_URL;

        const response = await axios$1({
          url: root + endpoint,
          method,
          data: post_data,
          headers,
        });

        const { data, status } = response;

        if (status == 200) {
          this.last_response = response;
          return data
        }

        console.error(`Request returns error! Status: ${status}`);


        if (data.message.includes('feedback_required')) {
          console.error(`ATTENTION! 'feedback_required', your action could have been blocked`);
          throw new Error('feedback_required')
        }

        if (status === 429) {
          const sleep_minutes = 5;

          console.error(
            `That means 'too many requests'. I'll go to sleep
        for ${sleep_minutes} minutes`);

          await sleep(5 * 60 * 1000);

        } else if (status === 400) {

          const error_message = data.message;
          const error_type = data.error_type;

          console.log(`Instagram's error message: ${error_message}, Error type: ${error_type}`);
          throw new Error(`InstagramError: ${error_type}: ${error_message}`)
        }

        return false
      }

      _get(endpoint, extra_headers = {}, options = {}) {
        return this._request(endpoint, 'GET', null, extra_headers, options)
      }

      _post(endpoint, data, extra_headers = {}, options = {}) {
        return this._request(endpoint, 'POST', data, extra_headers, options)
      }

      async send_request(endpoint, data = null, { doLogin = false, with_signature = true, ...options } = {}) {
        if (!this.is_logged_in && !doLogin) {
          throw new Error(`Not logged in! Tried to call ${endpoint}`)
        }

        if (!this.user_id && !doLogin) {
          console.warn(`'user_id' is undefined! Endpoints that need rank_token will not work. Try to relogin.`);
        }

        const _data = with_signature ? generate_signature(data) : data;

        try {
          if (data) {
            return await this._post(endpoint, _data, {}, { ...options })
          } else {
            return await this._get(endpoint, {}, { ...options })
          }
        } catch (err) {
          console.error(`Request failed:`, err, `Data:`, endpoint, data, );
          throw err
        }
      }

      async callMethod(name, ...args) {
        const _method = methods[name];

        if (typeof _method != 'function') {
          throw new Error(`No method: ${name}. Available methods: ${Object.keys(methods).join()}`)
        }

        if (this.confirmator) {
          const ok = await this.confirmator.confirm(`${name} ${args.join(' ')}?`);

          if (!ok) throw new Error(`User rejected request`)
        }

        const result = await _method(this, ...args);

        this.history && this.history.save(name, args, result);

        return result
      }

    }

    const AVAILABLE_METHODS = Object.keys(methods);


    class History {
      static get AVAILABLE_METHODS() {
        return AVAILABLE_METHODS
      }

      save (method, params, result) {
        console.log(method, params, result);

        return {}
      }

      get (...args) {
        return {}
      }

    }

    window.Instagram = Instagram;
    window.History = History;

    const instagram = new Instagram();

    class ChromeStorage {
      static set(key, value) {
        return new Promise((resolve, reject) => {
          setTimeout(() => reject("Storage Error: Cant save"), 1000);

          chrome.storage.local.set({ [key]: value }, () => {
            resolve(value);
          });
        });
      }

      static get(...keys) {
        return new Promise((resolve, reject) => {
          setTimeout(() => reject("Storage Error: Cant fetch"), 1000);

          chrome.storage.local.get(keys, obj => {
            resolve(obj);
          });
        });
      }

      static async append(key, newValue) {
        const { [key]: arr } = await ChromeStorage.get(key);

        const newArr = [...(arr || []), newValue];

        return ChromeStorage.set(key, newArr);
      }
    }

    class Collection {

      get default_key() {
        return 'misc'
      }

      constructor(name, available_keys) {
        this.name = name || 'collection';
        this.available_keys = available_keys;
      }

      async save (key, values) {
        const savedAt = Date.now();

        if (!this.available_keys.includes(key)) {
          key = this.default_key;
        }

        const entry = { savedAt, ...values };

        return ChromeStorage.append(`${this.name}.${key}`, entry)
      }

      async set(key, values) {
        const savedAt = Date.now();

        if (!this.available_keys.includes(key)) {
          key = this.default_key;
        }

        const entry = { savedAt, ...values };

        return ChromeStorage.set(`${this.name}.${key}`, entry)
      }

      async get (...keys) {
        keys = keys.length ? keys : this.available_keys;

        const _keys = keys.map(key => `${this.name}.${key}`);

        const result = await ChromeStorage.get(..._keys);

        return keys.reduce((obj, key) => ({
          ...obj,
          [key]: result[`${this.name}.${key}`] || [],
        }), {})
      }

    }

    class ChromeHistory extends History {

      constructor () {
        super();

        this.collection = new Collection('history', [
          ...History.AVAILABLE_METHODS, 'login', 'misc'
        ]);
      }

      async save (method, params, result) {
        const { status } = result;

        const entry = { params, status };

        return this.collection.save(method, entry)
      }

      async get (...methods) {
        return this.collection.get(...methods)
      }

    }

    class InstagramStats extends Collection {

      constructor(instagram) {
        super();

        this.available_keys = ['follower_count', 'following_count', 'average_like_count', 'user', 'current', 'misc'];

        this.instagram = instagram;
      }

      async updateValues() {
        if (!instagram.is_logged_in) {
          throw new Error(`Instagram not logged in`)
        }

        const { user } = await this.instagram.callMethod('get_user_info', this.instagram.user.pk);
        const { items } = await this.instagram.callMethod('get_user_feed', this.instagram.user.pk);
        const average_like_count = !items.length ? 0 : (items.reduce((sum, item) => sum + item.like_count, 0) / items.length);

        user.average_like_count = Math.floor(average_like_count);

        await this.save('user', user);
        await this.set('current', user);

        await this.save('follower_count', { followers: user.follower_count, pk: user.pk });
        await this.save('following_count', { followers: user.following_count, pk: user.pk });
        await this.save('average_like_count', { likes: user.average_like_count, pk: user.pk });

        return user
      }

      async getInfo() {
        const { like } = await this.instagram.history.get('like');
        const { follow } = await this.instagram.history.get('follow');

        const { follower_count } = await this.get('follower_count');
        const { following_count } = await this.get('following_count');
        const { average_like_count } = await this.get('average_like_count');

        const { current } = await this.get('current');

        return {
          likes: like.length,
          follows: follow.length,

          follower_count: current.follower_count,
          following_count: current.following_count,
          // follower_count: current.follower_count,
          average_like_count: current.average_like_count,

          full: {
            current,

            like,
            follow,

            follower_count,
            following_count,
            average_like_count,
          }
        }
      }

    }

    const stats = new InstagramStats(instagram);

    const saveCredentials = (username, password) => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ credentials: { username, password } }, () => {
          resolve({ username, password });
        });

        setTimeout(() => reject("storage error"), 5000);
      });
    };

    const getCredentials$1 = () => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(["credentials"], result => {
          resolve(result.credentials || {});
        });

        setTimeout(() => reject("storage error"), 5000);
      });
    };

    window.saveCredentials = saveCredentials;
    window.getCredentials = getCredentials$1;

    var name = "GramUp! – Free Social Bot";
    var short_name = "GramUp! Bot";
    var version$1 = "1.5.4";
    var description = "Extension helps you effectively use social networks!";
    var icons = {
    	"192": "images/icon.png"
    };
    var background = {
    	scripts: [
    		"build/background.js"
    	]
    };
    var browser_action = {
    	default_popup: "popup.html",
    	default_icon: "images/icon.png"
    };
    var permissions = [
    	"storage",
    	"background",
    	"notifications",
    	"webRequest",
    	"webRequestBlocking",
    	"https://i.instagram.com/"
    ];
    var externally_connectable = {
    	matches: [
    		"http://localhost/",
    		"https://dashboard.gramup.me/",
    		"https://dm.gramup.me/",
    		"https://*.okhlopkov.now.sh/",
    		"https://*.caffeinum.now.sh/"
    	]
    };
    var manifest_version = 2;
    var manifest = {
    	name: name,
    	short_name: short_name,
    	version: version$1,
    	description: description,
    	icons: icons,
    	background: background,
    	browser_action: browser_action,
    	permissions: permissions,
    	externally_connectable: externally_connectable,
    	manifest_version: manifest_version
    };

    const GRAMUP_REMOTE_CONFIG_URL = `https://dashboard.gramup.me/config.json`;
    const VERSION = manifest["version"];
    const USER_AGENT = navigator ? navigator.userAgent : "none";
    const GRAMUP_DEFAULT_WS_URL = `wss://gate.likeup.me/`;

    const DEFAULT_LOCAL_CONFIG = {
      familyUrl: GRAMUP_DEFAULT_WS_URL
    };

    const DEFAULT_CONFIG = {
      JOINED_FAMILY: true,
      NOT_BETA_TEST: true,
      CURRENT_TASK: null
    };

    var constants = /*#__PURE__*/Object.freeze({
        __proto__: null,
        GRAMUP_REMOTE_CONFIG_URL: GRAMUP_REMOTE_CONFIG_URL,
        VERSION: VERSION,
        USER_AGENT: USER_AGENT,
        GRAMUP_DEFAULT_WS_URL: GRAMUP_DEFAULT_WS_URL,
        DEFAULT_LOCAL_CONFIG: DEFAULT_LOCAL_CONFIG,
        DEFAULT_CONFIG: DEFAULT_CONFIG
    });

    const processMessage = async (instagram, config, message, sendResponse) => {
      try {
        const { method, params = [] } = message;

        if (method === "ping") {
          return sendResponse({ status: "ok", pong: "pong" });
        }

        if (method === "version" || method === "info") {
          return sendResponse({
            status: "ok",
            version: VERSION,
            user_agent: USER_AGENT,
            device: {
              user_agent: instagram.user_agent,
              phone_id: instagram.phone_id,
              uuid: instagram.uuid
              // rank_token: instagram.rank_token(),
            },
            constants: instagram.constants,
            config: config
          });
        }

        if (method === "stats") {
          await stats.updateValues();

          const data = await stats.getInfo();

          return sendResponse({ status: "ok", data });
        }

        if (method === "config") {
          const { config: current = DEFAULT_LOCAL_CONFIG } =
            (await ChromeStorage.get("config")) || {};
          const [updates] = params;

          try {
            // eslint-disable-next-line no-unused-vars
            const new_config = await ChromeStorage.set("config", {
              ...current,
              ...updates
            });

            const { config: _config } = await ChromeStorage.get("config");

            config = _config;

            updateWSData(instagram, config);

            return sendResponse({ status: "ok", config: _config });
          } catch (err) {
            return sendResponse({ status: "error", error: err.message });
          }
        }

        if (method === "login") {
          const [username, password] = params;

          try {
            const user = await instagram.login(username, password, true);

            updateWSData(instagram, config);

            return sendResponse({ status: "ok", user });
          } catch (err) {
            console.error(err);
            const { message, response } = err;
            const { data, headers } = response;
            return sendResponse({
              status: "error",
              error: { message, response: data, headers }
            });
          }
        }

        if (method === "login_via_cookie") {
          try {
            const user = await instagram.login_via_cookie();

            updateWSData(instagram, config);

            return sendResponse({ status: "ok", user });
          } catch (err) {
            console.error(err);
            const { message, response } = err;
            const { data, headers } = response;
            return sendResponse({
              status: "error",
              error: { message, response: data, headers }
            });
          }
        }

        if (method === "login_2fa") {
          const [username, password, verification_code, two_factor_data] = params;

          try {
            const user = await instagram.verify_2fa(
              username,
              password,
              verification_code,
              two_factor_data
            );

            return sendResponse({ status: "ok", user });
          } catch (err) {
            console.error(err);
            const { message, response } = err;
            const { data, headers } = response;
            return sendResponse({
              status: "error",
              error: { message, response: data, headers }
            });
          }
        }

        if (method === "exit") {
          // TODO: logout
          instagram.user = {};
          instagram.is_logged_in = false;
          return sendResponse({ status: "ok", user: instagram.user });
        }

        if (method === "check_login") {
          try {
            if (instagram.user && instagram.user.username) {
              const info = await instagram.callMethod(
                "get_user_info",
                instagram.user.username
              );

              instagram.user = info.user;
            }
          } catch (error) {
            console.log(`Needs relogin`, error);

            const { username, password } = await getCredentials$1();

            if (username) {
              instagram.user = await instagram.login(username, password, true);
            } else {
              instagram.user = await instagram.login_via_cookie();
            }
          }

          return sendResponse({ status: "ok", user: instagram.user });
        }

        // if (method === "get_history") {
        //   const history = await getHistory(...params);

        //   return sendResponse({ status: "ok", history });
        // }

        if (!instagram) {
          return sendResponse({
            status: "error",
            error: { message: "Not initialized" }
          });
        }

        const res = await instagram.callMethod(method, ...params);

        return sendResponse(res);
      } catch (err) {
        console.error(err);
        const { message, response } = err;
        const { data, headers } = response || {};
        return sendResponse({
          status: "error",
          error: { message, response: data, headers }
        });
      }
    };

    const { GRAMUP_REMOTE_CONFIG_URL: GRAMUP_REMOTE_CONFIG_URL$1, GRAMUP_DEFAULT_WS_URL: GRAMUP_DEFAULT_WS_URL$1 } = constants;

    const { DEFAULT_CONFIG: DEFAULT_CONFIG$1 } = constants;

    const getRemoteConfig = () => {
      return fetch(GRAMUP_REMOTE_CONFIG_URL$1)
        .then(res => res.json())
        .then(config => config || DEFAULT_CONFIG$1)
        .catch(err => {
          console.error(err);
          return DEFAULT_CONFIG$1;
        });
    };

    window.connection = null;

    const connectWebsocket = async (instagram, config, sec = 1) => {
      if (
        window.connection &&
        window.connection.readyState === window.connection.OPEN
      )
        return console.log("Already running...");

      const reconnect = () => {
        console.log(`Reconnecting to FAMILY in ${sec} seconds...`);
        setTimeout(() => connectWebsocket(instagram, config, sec * 2), sec * 1000);
      };

      const { familyUrl } = await getRemoteConfig();

      const connection = new WebSocket(familyUrl);

      const sendResponse = data => connection.send(JSON.stringify(data));

      window.connection = connection;

      connection.onerror = error => {
        console.error(error);

        connection.close();
      };

      connection.onopen = () => {
        sec = 1; // reset error timeout counter
        console.log("Connected to FAMILY", familyUrl);

        updateWSData(instagram, config);
      };

      connection.onclose = () => {
        console.log(`Connection to FAMILY closed`);
        reconnect();
      };

      connection.onmessage = async event => {
        console.log("event", event);

        try {
          const message = JSON.parse(event.data);

          console.log("message", message);
          console.log("sender", event.origin);

          if (!message.method) {
            throw new Error(
              `Wrong message format: '${event.data}', 'method' expected`
            );
          }

          if (!config.JOINED_FAMILY && config.NOT_BETA_TEST) {
            console.log(
              `Drop action, JOINED_FAMILY = ${
            config.JOINED_FAMILY
          }, BETA_TEST = ${!config.NOT_BETA_TEST}`
            );
            throw new Error(
              `FAMILY turned off: JOINED_FAMILY = ${
            config.JOINED_FAMILY
          }, BETA_TEST = ${!config.NOT_BETA_TEST}`
            );
          }

          await processMessage(instagram, config, message, sendResponse);
        } catch (err) {
          console.error(err, event);

          sendResponse({ status: "error", error: { message: err.message } });
        }
      };

      return { connection, sendResponse };
    };

    const updateWSData = async (instagram, config) => {
      try {
        if (instagram.user) {
          const { user } = await instagram.callMethod(
            "get_user_info",
            instagram.user.pk
          );
          instagram.user = user;
        }

        window.connection.send(
          JSON.stringify({
            status: "ok",
            version: VERSION,
            user_agent: USER_AGENT,
            user: instagram.user,
            device: {
              user_agent: instagram.user_agent,
              phone_id: instagram.phone_id,
              uuid: instagram.uuid
              // rank_token: instagram.rank_token(),
            },
            constants: instagram.constants,
            config: config
          })
        );
      } catch (err) {
        console.error(`Error updating WS data`, err);
      }
    };

    window.instagram = instagram;
    window.instagram.history = new ChromeHistory();
    // window.instagram.confirmator = null
    window.stats = stats; // new InstagramStats(window.instagram);

    document.addEventListener(
      "DOMContentLoaded",
      async () => {
        const { username, password } = await getCredentials$1();

        let { config = DEFAULT_LOCAL_CONFIG } =
          (await ChromeStorage.get("config")) || {};

        if (!username || !password) {
          console.log(`No credentials!`);
          const user = await instagram.login_via_cookie();
          console.log('user', user);
        } else {
          const user = await instagram.login(username, password);
          console.log('user', user);
        }

        const replyToRequest = (sender, req_id, data) => {
          console.log("reply to", req_id, data);
          if (sender.tab) {
            return chrome.tabs.sendMessage(sender.tab.id, { req_id, ...data });
          } else {
            return chrome.runtime.sendMessage(sender.id, { req_id, ...data });
          }
        };

        chrome.runtime.onConnectExternal.addListener(async port => {
          console.log("connect", port);

          port.onMessage.addListener(async (message, sender) => {
            console.log("message", message);
            console.log("sender", sender);

            const { req_id } = message;

            const sendResponse = data => port.postMessage({ req_id, ...data });

            await processMessage(instagram, config, message, sendResponse);
          });
        });

        chrome.runtime.onMessageExternal.addListener(
          async (message, sender, sendResponse) => {
            console.log("message", message);
            console.log("sender", sender);

            await processMessage(instagram, config, message, sendResponse);
          }
        );

        chrome.runtime.onMessage.addListener(async (message, sender) => {
          console.log("message", message);
          console.log("sender", sender);

          const { req_id } = message;

          const sendResponse = data => replyToRequest(sender, req_id, data);

          await processMessage(instagram, config, message, sendResponse);
        });

        const { connection } = await connectWebsocket(instagram, config);

        window.connection = connection;
      },
      false
    );

})));
//# sourceMappingURL=background.js.map
