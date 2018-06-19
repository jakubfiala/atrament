"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// make a class for Point
var Point = function () {
  function Point(x, y) {
    _classCallCheck(this, Point);

    this._x = x;
    this._y = y;
  }

  _createClass(Point, [{
    key: "set",
    value: function set(x, y) {
      this._x = x;
      this._y = y;
    }
  }, {
    key: "x",
    get: function get() {
      return this._x;
    },
    set: function set(x) {
      this._x = x;
    }
  }, {
    key: "y",
    get: function get() {
      return this._y;
    },
    set: function set(y) {
      this._y = y;
    }
  }]);

  return Point;
}();

// make a class for the mouse data


var Mouse = function (_Point) {
  _inherits(Mouse, _Point);

  function Mouse() {
    _classCallCheck(this, Mouse);

    var _this = _possibleConstructorReturn(this, (Mouse.__proto__ || Object.getPrototypeOf(Mouse)).call(this, 0, 0));

    _this._down = false;
    _this._px = 0;
    _this._py = 0;
    return _this;
  }

  _createClass(Mouse, [{
    key: "down",
    get: function get() {
      return this._down;
    },
    set: function set(d) {
      this._down = d;
    }
  }, {
    key: "x",
    get: function get() {
      return this._x;
    },
    set: function set(x) {
      this._x = x;
    }
  }, {
    key: "y",
    get: function get() {
      return this._y;
    },
    set: function set(y) {
      this._y = y;
    }
  }, {
    key: "px",
    get: function get() {
      return this._px;
    },
    set: function set(px) {
      this._px = px;
    }
  }, {
    key: "py",
    get: function get() {
      return this._py;
    },
    set: function set(py) {
      this._py = py;
    }
  }]);

  return Mouse;
}(Point);

exports.default = Mouse;