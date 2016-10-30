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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GulpGlob = function () {
  function GulpGlob(glob) {
    var ready = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Promise.resolve();

    _classCallCheck(this, GulpGlob);

    if (!(0, _isValidGlob2.default)(glob)) {
      throw new TypeError('Invalid glob element: "' + glob + '"');
    }

    if (!Array.isArray(glob)) {
      glob = [glob];
    }

    var _base = process.cwd();
    var _glob = glob.map(function (glb) {
      return _path2.default.relative(_base, glb);
    });

    var _ready = ready;
    this.isReady = function () {
      return _ready;
    };

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

  _createClass(GulpGlob, [{
    key: 'src',
    value: function src() {
      return _gulp2.default.src(this.glob, { base: this.base });
    }
  }, {
    key: 'list',
    value: function list() {
      var _this = this;

      return this.isReady().then(function (res) {
        return new Promise(function (resolve, reject) {
          var list = [];
          _this.src().on('data', function (file) {
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
      var _this2 = this;

      return new GulpGlob(this.glob.map(function (glb) {
        var a = glb.split('**');
        a[0] = _path2.default.join(_dest, a[0]);

        if (a.length === 1) {
          return a[0];
        } else {
          return _path2.default.join(a[0], '**', a[1]);
        }
      }), new Promise(function (resolve, reject) {
        _this2.src().pipe(_gulp2.default.dest(_dest)).on('error', reject).on('end', resolve);
      }));
    }
  }]);

  return GulpGlob;
}();

exports.default = GulpGlob;
module.exports = exports['default'];