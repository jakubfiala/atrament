'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mouse = require('./mouse.js');

var _mouse2 = _interopRequireDefault(_mouse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Atrament = function () {
  function Atrament(selector, width, height, color) {
    var _this = this;

    _classCallCheck(this, Atrament);

    if (!document) throw new Error('no DOM found');

    // get canvas element
    if (selector instanceof window.Node && selector.tagName === 'CANVAS') this.canvas = selector;else if (typeof selector === 'string') this.canvas = document.querySelector(selector);else throw new Error('can\'t look for canvas based on \'' + selector + '\'');
    if (!this.canvas) throw new Error('canvas not found');

    // set external canvas params
    this.canvas.width = width || 500;
    this.canvas.height = height || 500;
    this.canvas.style.cursor = 'crosshair';

    // create a mouse object
    this.mouse = new _mouse2.default();

    // mousemove handler
    var mouseMove = function mouseMove(e) {
      if (e.cancelable) {
        e.preventDefault();
      }

      var rect = _this.canvas.getBoundingClientRect();
      var position = e.changedTouches && e.changedTouches[0] || e;
      var x = position.offsetX;
      var y = position.offsetY;

      if (typeof x === 'undefined') {
        x = position.clientX + document.documentElement.scrollLeft - rect.left;
      }
      if (typeof y === 'undefined') {
        y = position.clientY + document.documentElement.scrollTop - rect.top;
      }

      // draw if we should draw
      if (_this.mouse.down) {
        _this.draw(x, y);
        if (!_this._dirty && (x !== _this.mouse.x || y !== _this.mouse.y)) {
          _this._dirty = true;
          _this.fireDirty();
        }
      } else {
        _this.mouse.x = x;
        _this.mouse.y = y;
      }
    };

    // mousedown handler
    var mouseDown = function mouseDown(mousePosition) {
      if (mousePosition.cancelable) {
        mousePosition.preventDefault();
      }
      // update position just in case
      mouseMove(mousePosition);

      // if we are filling - fill and return
      if (_this._mode === 'fill') {
        _this.fill();
        return;
      }

      // remember it
      _this.mouse.px = _this.mouse.x;
      _this.mouse.py = _this.mouse.y;
      // begin drawing
      _this.mouse.down = true;
      _this.context.beginPath();
      _this.context.moveTo(_this.mouse.px, _this.mouse.py);
    };
    var mouseUp = function mouseUp() {
      _this.mouse.down = false;
      // stop drawing
      _this.context.closePath();
    };

    // attach listeners
    this.canvas.addEventListener('mousemove', mouseMove);
    this.canvas.addEventListener('mousedown', mouseDown);
    document.addEventListener('mouseup', mouseUp);
    this.canvas.addEventListener('touchstart', mouseDown);
    this.canvas.addEventListener('touchend', mouseUp);
    this.canvas.addEventListener('touchmove', mouseMove);

    // helper for destroying Atrament (removing event listeners)
    this.destroy = function () {
      _this.clear();
      _this.canvas.removeEventListener('mousemove', mouseMove);
      _this.canvas.removeEventListener('mousedown', mouseDown);
      document.removeEventListener('mouseup', mouseUp);
      _this.canvas.removeEventListener('touchstart', mouseDown);
      _this.canvas.removeEventListener('touchend', mouseUp);
      _this.canvas.removeEventListener('touchmove', mouseMove);
    };

    // set internal canvas params
    this.context = this.canvas.getContext('2d');
    this.context.globalCompositeOperation = 'source-over';
    this.context.globalAlpha = 1;
    this.context.strokeStyle = color || 'rgba(0,0,0,1)';
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.translate(0.5, 0.5);

    this._filling = false;
    this._fillStack = [];

    // set drawing params
    this.SMOOTHING_INIT = 0.85;
    this.WEIGHT_SPREAD = 10;
    this._smoothing = this.SMOOTHING_INIT;
    this._maxWeight = 12;
    this._thickness = 2;
    this._targetThickness = 2;
    this._weight = 2;
    this._mode = 'draw';
    this._adaptive = true;
  }

  _createClass(Atrament, [{
    key: 'draw',
    value: function draw(mX, mY) {
      var mouse = this.mouse;
      var context = this.context;

      // calculate distance from previous point
      var rawDist = Atrament.lineDistance(mX, mY, mouse.px, mouse.py);

      // now, here we scale the initial smoothing factor by the raw distance
      // this means that when the mouse moves fast, there is more smoothing
      // and when we're drawing small detailed stuff, we have more control
      // also we hard clip at 1
      var smoothingFactor = Math.min(0.87, this._smoothing + (rawDist - 60) / 3000);

      // calculate smoothed coordinates
      mouse.x = mX - (mX - mouse.px) * smoothingFactor;
      mouse.y = mY - (mY - mouse.py) * smoothingFactor;

      // recalculate distance from previous point, this time relative to the smoothed coords
      var dist = Atrament.lineDistance(mouse.x, mouse.y, mouse.px, mouse.py);

      if (this._adaptive) {
        // calculate target thickness based on the new distance
        this._targetThickness = (dist - 1) / (50 - 1) * (this._maxWeight - this._weight) + this._weight;
        // approach the target gradually
        if (this._thickness > this._targetThickness) {
          this._thickness -= 0.5;
        } else if (this._thickness < this._targetThickness) {
          this._thickness += 0.5;
        }
        // set line width
        context.lineWidth = this._thickness;
      } else {
        // line width is equal to default weight
        context.lineWidth = this._weight;
      }

      // draw using quad interpolation
      context.quadraticCurveTo(mouse.px, mouse.py, mouse.x, mouse.y);
      context.stroke();

      // remember
      mouse.px = mouse.x;
      mouse.py = mouse.y;
    }
  }, {
    key: 'fireDirty',
    value: function fireDirty() {
      var event = document.createEvent('Event');
      event.initEvent('dirty', true, true);
      this.canvas.dispatchEvent(event);
    }
  }, {
    key: 'clear',
    value: function clear() {
      if (!this.dirty) {
        return;
      }

      this._dirty = false;
      this.fireDirty();

      // make sure we're in the right compositing mode, and erase everything
      if (this.context.globalCompositeOperation === 'destination-out') {
        this.mode = 'draw';
        this.context.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
        this.mode = 'erase';
      } else {
        this.context.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
      }
    }
  }, {
    key: 'toImage',
    value: function toImage() {
      return this.canvas.toDataURL();
    }
  }, {
    key: 'fill',
    value: function fill() {
      var _this2 = this;

      var mouse = this.mouse;
      var context = this.context;
      var startColor = Array.prototype.slice.call(context.getImageData(mouse.x, mouse.y, 1, 1).data, 0); // converting to Array because Safari 9

      if (!this._filling) {
        this.canvas.style.cursor = 'progress';
        this._filling = true;
        setTimeout(function () {
          _this2._floodFill(mouse.x, mouse.y, startColor);
        }, 100);
      } else {
        this._fillStack.push([mouse.x, mouse.y, startColor]);
      }
    }
  }, {
    key: '_floodFill',
    value: function _floodFill(_startX, _startY, startColor) {
      var _this3 = this;

      var context = this.context;
      var startX = Math.floor(_startX);
      var startY = Math.floor(_startY);
      var canvasWidth = context.canvas.width;
      var canvasHeight = context.canvas.height;
      var pixelStack = [[startX, startY]];
      // hex needs to be trasformed to rgb since colorLayer accepts RGB
      var fillColor = Atrament.hexToRgb(this.color);
      // Need to save current context with colors, we will update it
      var colorLayer = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
      var alpha = Math.min(context.globalAlpha * 10 * 255, 255);
      var colorPixel = Atrament.colorPixel.apply(Atrament, [colorLayer.data].concat(_toConsumableArray(fillColor), [startColor, alpha]));
      var matchColor = Atrament.matchColor.apply(Atrament, [colorLayer.data].concat(_toConsumableArray(startColor)));
      var matchFillColor = Atrament.matchColor.apply(Atrament, [colorLayer.data].concat([].concat(_toConsumableArray(fillColor), [255])));

      // check if we're trying to fill with the same colour, if so, stop
      if (matchFillColor((startY * context.canvas.width + startX) * 4)) {
        this._filling = false;
        setTimeout(function () {
          _this3.canvas.style.cursor = 'crosshair';
        }, 100);
        return;
      }

      while (pixelStack.length) {
        var newPos = pixelStack.pop();
        var x = newPos[0];
        var y = newPos[1];

        var pixelPos = (y * canvasWidth + x) * 4;

        while (y-- >= 0 && matchColor(pixelPos)) {
          pixelPos -= canvasWidth * 4;
        }
        pixelPos += canvasWidth * 4;

        ++y;

        var reachLeft = false;
        var reachRight = false;

        while (y++ < canvasHeight - 1 && matchColor(pixelPos)) {
          colorPixel(pixelPos);

          if (x > 0) {
            if (matchColor(pixelPos - 4)) {
              if (!reachLeft) {
                pixelStack.push([x - 1, y]);
                reachLeft = true;
              }
            } else if (reachLeft) {
              reachLeft = false;
            }
          }

          if (x < canvasWidth - 1) {
            if (matchColor(pixelPos + 4)) {
              if (!reachRight) {
                pixelStack.push([x + 1, y]);
                reachRight = true;
              }
            } else if (reachRight) {
              reachRight = false;
            }
          }

          pixelPos += canvasWidth * 4;
        }
      }

      // Update context with filled bucket!
      context.putImageData(colorLayer, 0, 0);

      if (this._fillStack.length) {
        this._floodFill.apply(this, _toConsumableArray(this._fillStack.shift()));
      } else {
        this._filling = false;
        setTimeout(function () {
          _this3.canvas.style.cursor = 'crosshair';
        }, 100);
      }
    }
  }, {
    key: 'color',
    get: function get() {
      return this.context.strokeStyle;
    },
    set: function set(c) {
      if (typeof c !== 'string') throw new Error('wrong argument type');
      this.context.strokeStyle = c;
    }
  }, {
    key: 'weight',
    get: function get() {
      return this._weight;
    },
    set: function set(w) {
      if (typeof w !== 'number') throw new Error('wrong argument type');
      this._weight = w;
      this._thickness = w;
      this._targetThickness = w;
      this._maxWeight = w + this.WEIGHT_SPREAD;
    }
  }, {
    key: 'adaptiveStroke',
    get: function get() {
      return this._adaptive;
    },
    set: function set(s) {
      this._adaptive = !!s;
    }
  }, {
    key: 'mode',
    get: function get() {
      return this._mode;
    },
    set: function set(m) {
      if (typeof m !== 'string') throw new Error('wrong argument type');
      switch (m) {
        case 'erase':
          this._mode = 'erase';
          this.context.globalCompositeOperation = 'destination-out';
          break;
        case 'fill':
          this._mode = 'fill';
          this.context.globalCompositeOperation = 'source-over';
          break;
        default:
          this._mode = 'draw';
          this.context.globalCompositeOperation = 'source-over';
          break;
      }
    }
  }, {
    key: 'dirty',
    get: function get() {
      return !!this._dirty;
    }
  }, {
    key: 'smoothing',
    get: function get() {
      return this._smoothing === this.SMOOTHING_INIT;
    },
    set: function set(s) {
      if (typeof s !== 'boolean') throw new Error('wrong argument type');
      this._smoothing = s ? this.SMOOTHING_INIT : 0;
    }
  }, {
    key: 'opacity',
    set: function set(o) {
      if (typeof o !== 'number') throw new Error('wrong argument type');
      // now, we need to scale this, because our drawing method means we don't just get uniform transparency all over the drawn line.
      // so we scale it down a lot, meaning that it'll look nicely semi-transparent
      // unless opacity is 1, then we should go full on to 1
      if (o >= 1) this.context.globalAlpha = 1;else this.context.globalAlpha = o / 10;
    }
  }], [{
    key: 'lineDistance',
    value: function lineDistance(x1, y1, x2, y2) {
      // calculate euclidean distance between (x1, y1) and (x2, y2)
      var xs = Math.pow(x2 - x1, 2);
      var ys = Math.pow(y2 - y1, 2);
      return Math.sqrt(xs + ys);
    }
  }, {
    key: 'hexToRgb',
    value: function hexToRgb(hexColor) {
      // Since input type color provides hex and ImageData accepts RGB need to transform
      var m = hexColor.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
      return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
    }
  }, {
    key: 'matchColor',
    value: function matchColor(data, compR, compG, compB, compA) {
      return function (pixelPos) {
        // Pixel color equals comp color?
        var r = data[pixelPos];
        var g = data[pixelPos + 1];
        var b = data[pixelPos + 2];
        var a = data[pixelPos + 3];

        return r === compR && g === compG && b === compB && a === compA;
      };
    }
  }, {
    key: 'colorPixel',
    value: function colorPixel(data, fillR, fillG, fillB, startColor, alpha) {
      var matchColor = Atrament.matchColor.apply(Atrament, [data].concat(_toConsumableArray(startColor)));

      return function (pixelPos) {
        // Update fill color in matrix
        data[pixelPos] = fillR;
        data[pixelPos + 1] = fillG;
        data[pixelPos + 2] = fillB;
        data[pixelPos + 3] = alpha;

        if (!matchColor(pixelPos + 4)) {
          data[pixelPos + 4] = data[pixelPos + 4] * 0.01 + fillR * 0.99;
          data[pixelPos + 4 + 1] = data[pixelPos + 4 + 1] * 0.01 + fillG * 0.99;
          data[pixelPos + 4 + 2] = data[pixelPos + 4 + 2] * 0.01 + fillB * 0.99;
          data[pixelPos + 4 + 3] = data[pixelPos + 4 + 3] * 0.01 + alpha * 0.99;
        }

        if (!matchColor(pixelPos - 4)) {
          data[pixelPos - 4] = data[pixelPos - 4] * 0.01 + fillR * 0.99;
          data[pixelPos - 4 + 1] = data[pixelPos - 4 + 1] * 0.01 + fillG * 0.99;
          data[pixelPos - 4 + 2] = data[pixelPos - 4 + 2] * 0.01 + fillB * 0.99;
          data[pixelPos - 4 + 3] = data[pixelPos - 4 + 3] * 0.01 + alpha * 0.99;
        }
      };
    }
  }]);

  return Atrament;
}();

// for people who like functional programming


function atrament(selector, width, height, color) {
  return new Atrament(selector, width, height, color);
}

module.exports = atrament;
module.exports.Atrament = Atrament;