'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SimpleGulpGlob = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _isValidGlob = require('is-valid-glob');

var _isValidGlob2 = _interopRequireDefault(_isValidGlob);

var _simpleGulpglob = require('./simple-gulpglob');

var _simpleGulpglob2 = _interopRequireDefault(_simpleGulpglob);

var _singletons = require('singletons');

var _argu = require('argu');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GulpGlob = (0, _singletons.SingletonFactory)(_simpleGulpglob2.default, ['array:literal', { type: 'option', sub: {
    cwd: {
      type: 'literal',
      optional: true
    },
    base: {
      type: 'literal',
      optional: true
    }
  }, optional: true }], {
  preprocess: function preprocess(args) {
    // First have all args in the form [glb, options], converting
    // SimpleGulpGlobs and GulpGlobs
    var args2 = (0, _argu.toArrayOfArrays)(args).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          glb = _ref2[0],
          options = _ref2[1];

      if (!(0, _isValidGlob2.default)(glb)) {
        if (glb instanceof _simpleGulpglob2.default) {
          return [glb.glob, glb.options];
        }

        throw new TypeError('Invalid glob element: "' + JSON.stringify(glb) + '"');
      }

      return [Array.isArray(glb) ? glb : [glb], Object.assign(GulpGlob.getDefaults(), options)];
    });

    // Now individualize all glob strings and mark them as excluded or not
    var args3 = [[]];
    var i = void 0;
    var exclude = void 0;

    args2.forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          glb = _ref4[0],
          options = _ref4[1];

      glb.forEach(function (g) {
        if (exclude === undefined) {
          exclude = g[0] === '!';
          i = 0;
        } else if (exclude !== (g[0] === '!')) {
          i++;
          args3.push([]);
          exclude = !exclude;
        }

        // Create an intermediate SimpleGulpGlob to handle easily cwd,
        // base and readiness
        args3[i].push(new _simpleGulpglob2.default(exclude ? g.substring(1) : g, Object.assign({ exclude: exclude }, options)));
      });
    });

    // Merge all compatible paths into single globs
    var args4 = args3.map(function (sggs) {
      var sgg = sggs.reduce(function (sgg1, sgg2) {
        return sgg1.concat(sgg2);
      });
      return sgg;
    });

    // Make sure bases and cwds are compatible
    var base = void 0;
    var cwd = void 0;
    args4.forEach(function (sgg) {
      if (!base) {
        base = sgg.base;
        cwd = sgg.cwd;
      } else if (base !== sgg.base) {
        throw new Error('SimpleGulpGlobs can only be concatenated if sharing base');
      } else if (cwd !== sgg.cwd) {
        throw new Error('SimpleGulpGlobs can only be concatenated if sharing cwd');
      }
    });

    return [args4.map(function (sgg) {
      return sgg.glob;
    }).reduce(function (g1, g2) {
      return g1.concat(g2);
    }), { base: base, cwd: cwd, ready: function ready() {
        return Promise.all(args4.map(function (sgg) {
          return sgg.isReady();
        }));
      } }];
  },

  postprocess: function postprocess(instance, args) {
    var _args = _slicedToArray(args, 2),
        options = _args[1];

    instance._resetReady(options);
    return instance;
  }
});

GulpGlob.getDefaults = _simpleGulpglob2.default.getDefaults;
GulpGlob.setDefaults = _simpleGulpglob2.default.setDefaults;

_simpleGulpglob2.default.Singleton = GulpGlob;

exports.default = GulpGlob;
exports.SimpleGulpGlob = _simpleGulpglob2.default;