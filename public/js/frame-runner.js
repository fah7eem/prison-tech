'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

document.addEventListener('DOMContentLoaded', function () {
  var testTimeout = 5000;
  var Rx = document.Rx;
  var frameReady = document.__frameReady;
  var helpers = Rx.helpers;
  var chai = parent.chai;
  var source = document.__source;
  var __getUserInput = document.__getUserInput || function (x) {
    return x;
  };
  var checkChallengePayload = document.__checkChallengePayload;

  // Fake Deep Equal dependency
  /* eslint-disable no-unused-vars */
  var DeepEqual = function DeepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  };

  // Hardcode Deep Freeze dependency
  var DeepFreeze = function DeepFreeze(o) {
    Object.freeze(o);
    Object.getOwnPropertyNames(o).forEach(function (prop) {
      if (o.hasOwnProperty(prop) && o[prop] !== null && (_typeof(o[prop]) === 'object' || typeof o[prop] === 'function') && !Object.isFrozen(o[prop])) {
        DeepFreeze(o[prop]);
      }
    });
    return o;
  };

  if (document.Enzyme) {
    window.Enzyme = document.Enzyme;
  }

  document.__getJsOutput = function getJsOutput() {
    if (window.__err) {
      return window.__err;
    }
    var output = void 0;
    try {
      /* eslint-disable no-eval */
      output = eval(source);
      /* eslint-enable no-eval */
    } catch (e) {
      output = e.message + '\n' + e.stack;
      window.__err = e;
    }
    return output;
  };

  document.__runTests = function runTests() {
    var tests = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    /* eslint-disable no-unused-vars */
    var code = source;
    var editor = {
      getValue: function getValue() {
        return source;
      }
    };
    /* eslint-enable no-unused-vars */
    if (window.__err) {
      return Rx.Observable.from(tests).map(function (test) {
        return _extends({}, test, {
          err: window.__err.message + '\n' + window.__err.stack,
          message: window.__err.message,
          stack: window.__err.stack
        });
      }).toArray().do(function () {
        window.__err = null;
      });
    }

    // Iterate through the test one at a time
    // on new stacks
    return Rx.Observable.from(tests, null, null, Rx.Scheduler.default)
    // add delay here for firefox to catch up
    .delay(200)
    /* eslint-disable no-unused-vars */
    .flatMap(function (_ref) {
      var text = _ref.text,
          testString = _ref.testString;

      var assert = chai.assert;
      var getUserInput = __getUserInput;
      /* eslint-enable no-unused-vars */
      var newTest = { text: text, testString: testString };
      var test = void 0;
      var __result = void 0;

      // uncomment the following line to inspect
      // the framerunner as it runs tests
      // make sure the dev tools console is open
      // debugger;
      try {
        /* eslint-disable no-eval */
        // eval test string to actual JavaScript
        // This return can be a function
        // i.e. function() { assert(true, 'happy coding'); }
        test = eval(testString);
        /* eslint-enable no-eval */
        if (typeof test === 'function') {

          // all async tests must return a promise or observable
          // sync tests can return Any type
          __result = test(getUserInput);

          if (helpers.isPromise(__result)) {
            // turn promise into an observable
            __result = Rx.Observable.fromPromise(__result);
          }
        }

        if (!__result || typeof __result.subscribe !== 'function') {
          // make sure result is an observable
          __result = Rx.Observable.of(null);
        }
      } catch (e) {
        // something threw an uncaught error
        // we catch here and wrap it in an observable
        __result = Rx.Observable.throw(e);
      }
      return __result.timeout(testTimeout).map(function () {
        // we don't need the result of a promise/observable/cb here
        // all data asserts should happen further up the chain
        // mark test as passing
        newTest.pass = true;
        return newTest;
      }).catch(function (err) {
        // we catch the error here to prevent the error from bubbling up
        // and collapsing the pipe
        var message = err.message || '';
        var assertIndex = message.indexOf(': expected');
        if (assertIndex !== -1) {
          message = message.slice(0, assertIndex);
        }
        message = message.replace(/<code>(.*?)<\/code>/g, '$1');
        newTest.err = err.message + '\n' + err.stack;
        newTest.stack = err.stack;
        newTest.message = message;
        // RxJS catch expects an observable as a return
        return Rx.Observable.of(newTest);
      });
    })
    // gather tests back into an array
    .toArray();
  };

  // notify that the window methods are ready to run
  frameReady.onNext({ checkChallengePayload: checkChallengePayload });
});