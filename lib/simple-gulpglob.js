'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _ready = Symbol();

var SimpleGulpGlob = function () {
  function SimpleGulpGlob(glb) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { ready: function ready() {
        return Promise.resolve();
      } };

    _classCallCheck(this, SimpleGulpGlob);

    if (!(0, _isValidGlob2.default)(glb)) {
      throw new TypeError('Invalid glob element: "' + glob + '"');
    }

    var glob = glb;
    if (!Array.isArray(glob)) {
      glob = [glob];
    }

    var _base = process.cwd();
    var _glob = glob.map(function (glb) {
      return _path2.default.relative(_base, glb);
    });

    this[_ready] = options.ready();

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
    value: function src() {
      return _gulp2.default.src(this.glob, { base: this.base });
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
  }]);

  return SimpleGulpGlob;
}();

exports.default = SimpleGulpGlob;
module.exports = exports['default'];