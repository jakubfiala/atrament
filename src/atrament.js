const Mouse = require('./mouse.js');
const Constants = require('./constants.js');
const { AtramentEventTarget } = require('./events.js');

module.exports = class Atrament extends AtramentEventTarget {

  constructor(selector, config = {}) {
    if (typeof window === 'undefined') {
      throw new Error('Looks like we\'re not running in a browser');
    }

    super();

    // get canvas element
    if (selector instanceof window.Node && selector.tagName === 'CANVAS') this.canvas = selector;
    else if (typeof selector === 'string') this.canvas = document.querySelector(selector);
    else throw new Error(`can't look for canvas based on '${selector}'`);
    if (!this.canvas) throw new Error('canvas not found');

    // set external canvas params
    this.canvas.width = config.width || this.canvas.width;
    this.canvas.height = config.height || this.canvas.height;

    // create a mouse object
    this.mouse = new Mouse();

    // mousemove handler
    const mouseMove = (e) => {
      if (e.cancelable) {
        e.preventDefault();
      }

      const rect = this.canvas.getBoundingClientRect();
      const position = e.changedTouches && e.changedTouches[0] || e;
      let x = position.offsetX;
      let y = position.offsetY;

      if (typeof x === 'undefined') {
        x = position.clientX - rect.left;
      }
      if (typeof y === 'undefined') {
        y = position.clientY - rect.top;
      }

      // draw if we should draw
      if (this.mouse.down) {
        this.draw(x, y);
        if (!this._dirty && (x !== this.mouse.x || y !== this.mouse.y)) {
          this._dirty = true;
          this.fireDirty();
        }
      }
      else {
        this.mouse.set(x, y);
      }
    };

    // mousedown handler
    const mouseDown = (mouse) => {
      if (mouse.cancelable) {
        mouse.preventDefault();
      }
      // update position just in case
      mouseMove(mouse);

      // if we are filling - fill and return
      if (this._mode === 'fill') {
        this.fill();
        return;
      }
      // remember it
      this.mouse.px = this.mouse.x;
      this.mouse.py = this.mouse.y;
      this.mouse.down = true;

      // begin drawing
      this.context.beginPath();
      this.context.moveTo(this.mouse.px, this.mouse.py);
    };
    const mouseUp = (e) => {
      const position = e.changedTouches && e.changedTouches[0] || e;
      const x = position.offsetX;
      const y = position.offsetY;
      this.mouse.down = false;

      if (this.mouse.x === x && this.mouse.y === y) {
        this.draw(this.mouse.x, this.mouse.y);
      }
      // stop drawing
      this.context.closePath();
    };

    // attach listeners
    this.canvas.addEventListener('mousemove', mouseMove);
    this.canvas.addEventListener('mousedown', mouseDown);
    document.addEventListener('mouseup', mouseUp);
    this.canvas.addEventListener('touchstart', mouseDown);
    this.canvas.addEventListener('touchend', mouseUp);
    this.canvas.addEventListener('touchmove', mouseMove);

    // helper for destroying Atrament (removing event listeners)
    this.destroy = () => {
      this.clear();
      this.canvas.removeEventListener('mousemove', mouseMove);
      this.canvas.removeEventListener('mousedown', mouseDown);
      document.removeEventListener('mouseup', mouseUp);
      this.canvas.removeEventListener('touchstart', mouseDown);
      this.canvas.removeEventListener('touchend', mouseUp);
      this.canvas.removeEventListener('touchmove', mouseMove);
    };

    // set internal canvas params
    this.context = this.canvas.getContext('2d');
    this.context.globalCompositeOperation = 'source-over';
    this.context.globalAlpha = 1;
    this.context.strokeStyle = config.color || 'rgba(0,0,0,1)';
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

    // update from config object
    ['weight', 'smoothing', 'adaptiveStroke', 'mode', 'opacity'].forEach(key => config[key] === undefined ? 0 : this[key] = config[key]);
  }

  static lineDistance(x1, y1, x2, y2) {
    // calculate euclidean distance between (x1, y1) and (x2, y2)
    const xs = Math.pow(x2 - x1, 2);
    const ys = Math.pow(y2 - y1, 2);
    return Math.sqrt(xs + ys);
  }

  static hexToRgb(hexColor) {
    // Since input type color provides hex and ImageData accepts RGB need to transform
    const m = hexColor.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    return [
      parseInt(m[1], 16),
      parseInt(m[2], 16),
      parseInt(m[3], 16)
    ];
  }

  static matchColor(data, compR, compG, compB, compA) {
    return (pixelPos) => {
      // Pixel color equals comp color?
      const r = data[pixelPos];
      const g = data[pixelPos + 1];
      const b = data[pixelPos + 2];
      const a = data[pixelPos + 3];

      return (r === compR && g === compG && b === compB && a === compA);
    };
  }

  static colorPixel(data, fillR, fillG, fillB, startColor, alpha) {
    const matchColor = Atrament.matchColor(data, ...startColor);

    return (pixelPos) => {
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

  draw(mX, mY) {
    const { mouse } = this;
    const { context } = this;

    // calculate distance from previous point
    const rawDist = Atrament.lineDistance(mX, mY, mouse.px, mouse.py);

    // now, here we scale the initial smoothing factor by the raw distance
    // this means that when the mouse moves fast, there is more smoothing
    // and when we're drawing small detailed stuff, we have more control
    // also we hard clip at 1
    const smoothingFactor = Math.min(0.87, this._smoothing + (rawDist - 60) / 3000);

    // calculate smoothed coordinates
    mouse.x = mX - (mX - mouse.px) * smoothingFactor;
    mouse.y = mY - (mY - mouse.py) * smoothingFactor;

    // recalculate distance from previous point, this time relative to the smoothed coords
    const dist = Atrament.lineDistance(mouse.x, mouse.y, mouse.px, mouse.py);

    if (this._adaptive) {
      // calculate target thickness based on the new distance
      this._targetThickness = (dist - 1) / (50 - 1) * (this._maxWeight - this._weight) + this._weight;
      // approach the target gradually
      if (this._thickness > this._targetThickness) {
        this._thickness -= 0.5;
      }
      else if (this._thickness < this._targetThickness) {
        this._thickness += 0.5;
      }
      // set line width
      context.lineWidth = this._thickness;
    }
    else {
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

  get color() {
    return this.context.strokeStyle;
  }

  set color(c) {
    if (typeof c !== 'string') throw new Error('wrong argument type');
    this.context.strokeStyle = c;
  }

  get weight() {
    return this._weight;
  }

  set weight(w) {
    if (typeof w !== 'number') throw new Error('wrong argument type');
    this._weight = w;
    this._thickness = w;
    this._targetThickness = w;
    this._maxWeight = w + this.WEIGHT_SPREAD;
  }

  get adaptiveStroke() {
    return this._adaptive;
  }

  set adaptiveStroke(s) {
    this._adaptive = !!s;
  }

  get mode() {
    return this._mode;
  }

  get dirty() {
    return !!this._dirty;
  }

  set mode(m) {
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

  get smoothing() {
    return this._smoothing === this.SMOOTHING_INIT;
  }

  set smoothing(s) {
    if (typeof s !== 'boolean') throw new Error('wrong argument type');
    this._smoothing = s ? this.SMOOTHING_INIT : 0;
  }

  set opacity(o) {
    if (typeof o !== 'number') throw new Error('wrong argument type');
    // now, we need to scale this, because our drawing method means we don't just get uniform transparency all over the drawn line.
    // so we scale it down a lot, meaning that it'll look nicely semi-transparent
    // unless opacity is 1, then we should go full on to 1
    if (o >= 1) this.context.globalAlpha = 1;
    else this.context.globalAlpha = o / 10;
  }

  fireDirty() {
    this.dispatchEvent('dirty', { dirty: this._dirty });
  }

  clear() {
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
    }
    else {
      this.context.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
    }
  }

  toImage() {
    return this.canvas.toDataURL();
  }

  fill() {
    const { mouse } = this;
    const { context } = this;
    const startColor = Array.prototype.slice.call(context.getImageData(mouse.x, mouse.y, 1, 1).data, 0); // converting to Array because Safari 9

    if (!this._filling) {
      this.dispatchEvent('fillstart', {});
      this._filling = true;
      setTimeout(() => { this._floodFill(mouse.x, mouse.y, startColor); }, Constants.floodFillInterval);
    }
    else {
      this._fillStack.push([
        mouse.x,
        mouse.y,
        startColor
      ]);
    }
  }

  _floodFill(_startX, _startY, startColor) {
    const { context } = this;
    const startX = Math.floor(_startX);
    const startY = Math.floor(_startY);
    const canvasWidth = context.canvas.width;
    const canvasHeight = context.canvas.height;
    const pixelStack = [[startX, startY]];
    // hex needs to be trasformed to rgb since colorLayer accepts RGB
    const fillColor = Atrament.hexToRgb(this.color);
    // Need to save current context with colors, we will update it
    const colorLayer = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const alpha = Math.min(context.globalAlpha * 10 * 255, 255);
    const colorPixel = Atrament.colorPixel(colorLayer.data, ...fillColor, startColor, alpha);
    const matchColor = Atrament.matchColor(colorLayer.data, ...startColor);
    const matchFillColor = Atrament.matchColor(colorLayer.data, ...[...fillColor, 255]);

    // check if we're trying to fill with the same colour, if so, stop
    if (matchFillColor((startY * context.canvas.width + startX) * 4)) {
      this._filling = false;
      this.dispatchEvent('fillend', {});
      return;
    }

    while (pixelStack.length) {
      const newPos = pixelStack.pop();
      const x = newPos[0];
      let y = newPos[1];

      let pixelPos = (y * canvasWidth + x) * 4;

      while (y-- >= 0 && matchColor(pixelPos)) {
        pixelPos -= canvasWidth * 4;
      }
      pixelPos += canvasWidth * 4;

      ++y;

      let reachLeft = false;
      let reachRight = false;

      while (y++ < canvasHeight - 1 && matchColor(pixelPos)) {
        colorPixel(pixelPos);

        if (x > 0) {
          if (matchColor(pixelPos - 4)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          }
          else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < canvasWidth - 1) {
          if (matchColor(pixelPos + 4)) {
            if (!reachRight) {
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          }
          else if (reachRight) {
            reachRight = false;
          }
        }

        pixelPos += canvasWidth * 4;
      }
    }

    // Update context with filled bucket!
    context.putImageData(colorLayer, 0, 0);

    if (this._fillStack.length) {
      this._floodFill(...this._fillStack.shift());
    }
    else {
      this._filling = false;
      this.dispatchEvent('fillend', {});
    }
  }
};
