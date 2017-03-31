'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SimpleGulpGlob = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.preprocess = preprocess;

var _isValidGlob = require('is-valid-glob');

var _isValidGlob2 = _interopRequireDefault(_isValidGlob);

var _mergeStream = require('merge-stream');

var _mergeStream2 = _interopRequireDefault(_mergeStream);

var _simpleGulpglob = require('./simple-gulpglob');

var _simpleGulpglob2 = _interopRequireDefault(_simpleGulpglob);

var _polyton = require('polyton');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function preprocess(args) {
  // GulpGlob must receive an array of valid SimpleGulpGlob arguments
  // Here args should always be a wrapping array

  var _args = args.map(function (glob) {
    if (!(0, _isValidGlob2.default)(glob)) {
      // Maybe we have SimpleGulpGlob arguments (glob, options)
      if ((0, _isValidGlob2.default)(glob[0]) && _typeof(glob[1]) === 'object') {
        return [glob[0], Object.assign({
          ready: function ready() {
            return Promise.resolve();
          }
        }, glob[1])];
      }

      // Maybe we have an array of SimpleGulpGlobs
      if (Array.isArray(glob) && glob.length === 1) {
        var _glob = _slicedToArray(glob, 1),
            glb = _glob[0];

        if (glb && glb.elements && glb.elements.every(function (el) {
          return el instanceof _simpleGulpglob2.default;
        })) {
          return glb.reduce(function (array, el) {
            // Now merge when possible
            var _array = _slicedToArray(array, 2),
                glob1 = _array[0],
                options1 = _array[1];

            var glob2 = el.glob;
            var options2 = { ready: el.isReady };
            return [glob1.concat(glob2), options1.concat(options2)];
          }, [[], []]);
          // Outter [] is necessary for the array glob to be viewed as a
          // single argument and not a list of args.
        }
      }

      // Unhandled cases
      throw new TypeError('Invalid glob element: "' + glob + '"');
    }

    // Our glob was a valid one
    if (Array.isArray(glob)) {
      return [glob]; // Necessary for the array glob to be viewed as a
      // single argument and not a list of args.
    }
    return glob;
  });

  _args = _args.reduce(function (array1, array2) {
    // Now merge when possible
    var _array2 = _slicedToArray(array1, 2),
        glob1 = _array2[0],
        options1 = _array2[1];

    var _array3 = _slicedToArray(array2, 2),
        glob2 = _array3[0],
        options2 = _array3[1];

    var options = options2 ? options1.concat(options2) : options1;

    return [glob1.concat(glob2), options];
  }, [[], []]);

  var _args2 = _args,
      _args3 = _slicedToArray(_args2, 2),
      globs = _args3[0],
      options = _args3[1];

  return [[globs.sort().reverse(), // Have '!patterns' at the end
  Object.assign.apply(Object, [{}].concat(_toConsumableArray(options), [{
    ready: function ready() {
      return Promise.all(options.map(function (opts) {
        return opts.ready();
      }));
    }
  }]))]];
}

function postprocess(instance, args) {
  args.forEach(function (arg, i) {
    if (arg.length > 1) {
      instance.at(i)._resetReady(arg[1]);
      instance.at(i)._resetOptions(arg[1]);
    }
  });
  return instance;
}

var GulpGlob = (0, _polyton.PolytonFactory)(_simpleGulpglob2.default, [// eslint-disable-line new-cap
'literal', 'ignore'], undefined, {
  preprocess: preprocess, postprocess: postprocess,
  properties: {
    glob: {
      get: function get() {
        return this.map(function (el) {
          return el.glob;
        }).reduce(function (array, glb) {
          return array.concat(glb);
        }, []);
      }
    },
    length: {
      get: function get() {
        return this.glob.length;
      }
    }
  },
  extend: {
    isReady: function isReady() {
      return Promise.all(this.map(function (el) {
        return el.isReady();
      }));
    },
    src: function src(options) {
      return _mergeStream2.default.apply(undefined, _toConsumableArray(this.map(function (el) {
        return el.src(options);
      })));
    },
    newer: function newer(dest, options) {
      return _mergeStream2.default.apply(undefined, _toConsumableArray(this.map(function (el) {
        return el.newer(dest, options);
      })));
    },
    toPromise: function toPromise() {
      return Promise.all(this.map(function (el) {
        return el.toPromise();
      }));
    },
    list: function list() {
      return Promise.all(this.map(function (el) {
        return el.list();
      })).then(function (lists) {
        return lists.reduce(function (array, list) {
          return array.concat(list);
        });
      }, []);
    },
    dest: function dest(dir) {
      return new (Function.prototype.bind.apply(GulpGlob, [null].concat(_toConsumableArray(this.map(function (gg) {
        return gg._destArgs(dir);
      })))))();
    }
  }
});

GulpGlob.getDefaults = _simpleGulpglob2.default.getDefaults;
GulpGlob.setDefaults = _simpleGulpglob2.default.setDefaults;

exports.default = GulpGlob;
exports.SimpleGulpGlob = _simpleGulpglob2.default;