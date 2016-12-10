'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isValidGlob = require('is-valid-glob');

var _isValidGlob2 = _interopRequireDefault(_isValidGlob);

var _simpleGulpglob = require('./simple-gulpglob');

var _simpleGulpglob2 = _interopRequireDefault(_simpleGulpglob);

var _polyton = require('polyton');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var GulpGlob = (0, _polyton.PolytonFactory)(_simpleGulpglob2.default, ['literal', 'ignore'], undefined, {
  preprocess: function preprocess(args) {
    return args.map(function (glob) {
      if (!(0, _isValidGlob2.default)(glob)) {
        if ((0, _isValidGlob2.default)(glob[0])) {
          // Passing glob + options
          if (glob[1] && glob[1].ready) {
            return glob;
          }
        }
        throw new TypeError('Invalid glob element: "' + glob + '"');
      }
      if (Array.isArray(glob)) {
        return [glob]; // Necessary for the array glob to be viewed as a
        // single argument and not a list of args.
      }
      return glob;
    });
  },
  properties: {
    glob: {
      get: function get() {
        return [[]].concat(_toConsumableArray(this.map(function (el) {
          return el.glob;
        }))).reduce(function (array, glb) {
          return array.concat(glb);
        });
      }
    }
  },
  extend: {
    isReady: function isReady() {
      return Promise.all(this.map(function (el) {
        return el.isReady();
      }));
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
        return [[]].concat(_toConsumableArray(lists)).reduce(function (array, list) {
          return array.concat(list);
        });
      });
    },
    dest: function dest(dir) {
      return new (Function.prototype.bind.apply(GulpGlob, [null].concat(_toConsumableArray(this.map(function (gg) {
        return gg._destArgs(dir);
      })))))();
    }
  }
});

exports.default = GulpGlob;
module.exports = exports['default'];