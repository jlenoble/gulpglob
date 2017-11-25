'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _gulpNewer = require('gulp-newer');

var _gulpNewer2 = _interopRequireDefault(_gulpNewer);

var _isValidGlob = require('is-valid-glob');

var _isValidGlob2 = _interopRequireDefault(_isValidGlob);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _polypath2 = require('polypath');

var _polypath3 = _interopRequireDefault(_polypath2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultOptions = {
  cwd: process.cwd(),
  base: process.cwd()
};

var _ready = Symbol();
var _polypath = Symbol();

var SimpleGulpGlob = function () {
  function SimpleGulpGlob(glb, options) {
    _classCallCheck(this, SimpleGulpGlob);

    if (!(0, _isValidGlob2.default)(glb)) {
      throw new TypeError('Invalid glob element: "' + JSON.stringify(glb) + '"');
    }

    var cwd = options && options.cwd || SimpleGulpGlob.getDefaults().cwd;
    if (!_path2.default.isAbsolute(cwd)) {
      cwd = _path2.default.join(process.cwd(), cwd);
    }

    var base = options && options.base || cwd;
    if (!_path2.default.isAbsolute(base)) {
      base = _path2.default.join(cwd, base);
    }

    var exclude = options && options.exclude;

    this[_ready] = options && typeof options.ready === 'function' && options.ready() || Promise.resolve();

    // Create or recover polyton polypath from glb
    var _glb = Array.isArray(glb) ? glb : [glb];
    var polypath = new (Function.prototype.bind.apply(_polypath3.default, [null].concat(_toConsumableArray(_glb.map(function (g) {
      return _path2.default.isAbsolute(g) ? g : _path2.default.join(cwd, g);
    })))))();

    this[_polypath] = polypath;

    Object.defineProperties(this, {
      cwd: {
        value: cwd
      },

      base: {
        value: base
      },

      exclude: {
        value: exclude
      },

      paths: {
        value: polypath.paths
      },

      glob: {
        value: polypath.relative(cwd)
      },

      options: {
        get: function get() {
          var _this = this;

          return {
            cwd: this.cwd,
            base: this.base,
            ready: function ready() {
              return _this[_ready];
            }
          };
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
    key: 'toPromise',
    value: function toPromise() {
      var _this2 = this;

      return this.isReady().then(function () {
        return _this2;
      });
    }
  }, {
    key: 'relative',
    value: function relative(base) {
      return this[_polypath].relative(base);
    }
  }, {
    key: 'src',
    value: function src(options) {
      return _gulp2.default.src(this.glob, Object.assign({
        base: this.base,
        cwd: this.cwd
      }, options));
    }
  }, {
    key: 'newer',
    value: function newer(dest, options) {
      return this.src(options).pipe((0, _gulpNewer2.default)(dest));
    }
  }, {
    key: 'list',
    value: function list(options) {
      var _this3 = this;

      return this.isReady().then(function () {
        return new Promise(function (resolve, reject) {
          var list = [];
          _this3.src(Object.assign({ read: false }, options)).on('data', function (file) {
            list.push(file.path);
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
      var _this4 = this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          ready = _ref.ready;

      var base = _path2.default.relative(this.cwd, this.base);
      var polypath = this[_polypath].rebase(this.base, _dest);

      return new SimpleGulpGlob.Singleton([polypath.relative(_dest), {
        ready: ready || function () {
          return new Promise(function (resolve, reject) {
            _this4.src().pipe(_gulp2.default.dest(_dest)).on('error', reject).on('end', resolve);
          });
        },
        cwd: _dest,
        base: _path2.default.join(_dest, base)
      }]);
    }
  }, {
    key: 'concat',
    value: function concat(sgg) {
      var _this5 = this;

      if (this.cwd !== sgg.cwd) {
        throw new Error('SimpleGulpGlobs can only be concatenated if sharing working dir');
      }

      if (this.base !== sgg.base) {
        throw new Error('SimpleGulpGlobs can only be concatenated if sharing base');
      }

      var polypath = new (Function.prototype.bind.apply(_polypath3.default, [null].concat(_toConsumableArray(this.paths), _toConsumableArray(sgg.paths))))();

      return new SimpleGulpGlob(polypath.relative(this.cwd), {
        cwd: this.cwd,
        base: this.base,
        ready: function ready() {
          return Promise.all([_this5[_ready], sgg[_ready]]);
        }
      });
    }
  }, {
    key: '_resetReady',
    value: function _resetReady(options) {
      var ready = options.ready;

      if (typeof ready === 'function') {
        this[_ready] = this[_ready].then(ready);
      }
    }
  }]);

  return SimpleGulpGlob;
}();

SimpleGulpGlob.getDefaults = function () {
  return Object.assign({}, defaultOptions);
};

SimpleGulpGlob.setDefaults = function (_ref2) {
  var cwd = _ref2.cwd,
      base = _ref2.base;

  defaultOptions.cwd = cwd || process.cwd();
  defaultOptions.base = base || process.cwd();
};

exports.default = SimpleGulpGlob;
module.exports = exports['default'];