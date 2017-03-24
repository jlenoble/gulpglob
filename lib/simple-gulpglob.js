'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _isValidGlob = require('is-valid-glob');

var _isValidGlob2 = _interopRequireDefault(_isValidGlob);

var _destglob = require('destglob');

var _destglob2 = _interopRequireDefault(_destglob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultOptions = {};

var _ready = Symbol();
var _options = Symbol();

var SimpleGulpGlob = function () {
  function SimpleGulpGlob(glb, options) {
    _classCallCheck(this, SimpleGulpGlob);

    if (!(0, _isValidGlob2.default)(glb)) {
      throw new TypeError('Invalid glob element: "' + glb + '"');
    }

    var opts = Object.assign({ ready: function ready() {
        return Promise.resolve();
      } }, options);

    var glob = glb;
    if (!Array.isArray(glob)) {
      glob = [glob];
    }

    var _base = process.cwd();
    var _glob = glob.map(function (glb) {
      return _path2.default.relative(_base, glb);
    });

    this[_ready] = opts.ready();

    delete opts.base;
    delete opts.ready;

    this[_options] = Object.keys(opts).length > 0 ? opts : SimpleGulpGlob.getDefaults();

    Object.defineProperties(this, {
      glob: {
        get: function get() {
          return _glob;
        }
      },
      base: {
        get: function get() {
          return _base;
        }
      }
    });
  }

  _createClass(SimpleGulpGlob, [{
    key: 'isReady',
    value: function isReady() {
      return this[_ready];
    }
  }, {
    key: 'src',
    value: function src(options) {
      var opts = Object.assign({ base: this.base }, options || this[_options]);
      return _gulp2.default.src(this.glob, opts);
    }
  }, {
    key: 'toPromise',
    value: function toPromise() {
      var _this = this;

      return this.isReady().then(function () {
        return _this;
      });
    }
  }, {
    key: 'list',
    value: function list() {
      var _this2 = this;

      return this.isReady().then(function () {
        return new Promise(function (resolve, reject) {
          var list = [];
          _this2.src().on('data', function (file) {
            list.push(file.history[0]);
          }).on('end', function () {
            console.log(list.join('\n'));
            resolve(list);
          });
        });
      });
    }
  }, {
    key: 'dest',
    value: function dest(_dest) {
      return new (Function.prototype.bind.apply(SimpleGulpGlob, [null].concat(_toConsumableArray(this._destArgs(_dest)))))();
    }
  }, {
    key: '_destArgs',
    value: function _destArgs(dest) {
      var _this3 = this;

      return [(0, _destglob2.default)(this.glob, dest), {
        ready: function ready() {
          return new Promise(function (resolve, reject) {
            _this3.src().pipe(_gulp2.default.dest(dest)).on('error', reject).on('end', resolve);
          });
        }
      }];
    }
  }, {
    key: '_resetReady',
    value: function _resetReady(options) {
      var ready = options.ready;

      if (ready) {
        this[_ready] = ready();
      }
    }
  }, {
    key: '_resetOptions',
    value: function _resetOptions(options) {
      var opts = {};

      Object.keys(options).filter(function (name) {
        return name !== 'ready' && name !== 'base';
      }).forEach(function (name) {
        opts[name] = options[name];
      });

      this[_options] = Object.keys(opts).length > 0 ? opts : SimpleGulpGlob.getDefaults();
    }
  }]);

  return SimpleGulpGlob;
}();

SimpleGulpGlob.getDefaults = function () {
  return Object.assign({}, defaultOptions);
};

SimpleGulpGlob.setDefaults = function (options) {
  if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
    defaultOptions = options;
  }
};

exports.default = SimpleGulpGlob;
module.exports = exports['default'];