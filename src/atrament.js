const { Mouse, Point } = require('./mouse.js');
const Constants = require('./constants.js');
const { AtramentEventTarget } = require('./events.js');
const Pixels = require('./pixels.js');

const DrawingMode = {
  DRAW: 'draw',
  ERASE: 'erase',
  FILL: 'fill'
};

const PathDrawingModes = [DrawingMode.DRAW, DrawingMode.ERASE];

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
    const mouseMove = (event) => {
      if (event.cancelable) {
        event.preventDefault();
      }

      const rect = this.canvas.getBoundingClientRect();
      const position = event.changedTouches && event.changedTouches[0] || event;
      let x = position.offsetX;
      let y = position.offsetY;

      if (typeof x === 'undefined') {
        x = position.clientX - rect.left;
      }
      if (typeof y === 'undefined') {
        y = position.clientY - rect.top;
      }

      const { mouse } = this;
      // draw if we should draw
      if (mouse.down && PathDrawingModes.includes(this.mode)) {
        const { x: newX, y: newY } = this.draw(x, y, mouse.previous.x, mouse.previous.y);

        if (!this._dirty && this.mode === DrawingMode.DRAW && (x !== mouse.x || y !== mouse.y)) {
          this._dirty = true;
          this.fireDirty();
        }

        mouse.set(x, y);
        mouse.previous.set(newX, newY);
      }
      else {
        mouse.set(x, y);
      }
    };

    // mousedown handler
    const mouseDown = (event) => {
      if (event.cancelable) {
        event.preventDefault();
      }
      // update position just in case
      mouseMove(event);

      // if we are filling - fill and return
      if (this.mode === DrawingMode.FILL) {
        this.fill();
        return;
      }
      // remember it
      const { mouse } = this;
      mouse.previous.set(mouse.x, mouse.y);
      mouse.down = true;

      this.beginStroke(mouse.previous.x, mouse.previous.y);
    };

    const mouseUp = (e) => {
      if (this.mode === DrawingMode.FILL) {
        return;
      }

      const { mouse } = this;

      if (!mouse.down) {
        return;
      }

      const position = e.changedTouches && e.changedTouches[0] || e;
      const x = position.offsetX;
      const y = position.offsetY;
      mouse.down = false;

      if (mouse.x === x && mouse.y === y && PathDrawingModes.includes(this.mode)) {
        const { x: nx, y: ny } = this.draw(mouse.x, mouse.y, mouse.previous.x, mouse.previous.y);
        mouse.previous.set(nx, ny);
      }

      this.endStroke(mouse.x, mouse.y);
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
    this.recordStrokes = false;
    this.strokeMemory = [];

    this.smoothing = Constants.initialSmoothingFactor;
    this._thickness = Constants.initialThickness;
    this._targetThickness = this._thickness;
    this._weight = this._thickness;
    this._maxWeight = this._thickness + Constants.weightSpread;

    this._mode = DrawingMode.DRAW;
    this.adaptiveStroke = true;

    // update from config object
    ['weight', 'smoothing', 'adaptiveStroke', 'mode']
      .forEach(key => config[key] === undefined ? 0 : this[key] = config[key]);
  }

  /**
   * Begins a stroke at a given position
   *
   * @param {number} x
   * @param {number} y
   */
  beginStroke(x, y) {
    this.context.beginPath();
    this.context.moveTo(x, y);

    if (this.recordStrokes) {
      this.strokeMemory.push(new Point(x, y));
    }
    this.dispatchEvent('strokestart', { x, y });
  }

  /**
   * Ends a stroke at a given position
   *
   * @param {number} x
   * @param {number} y
   */
  endStroke(x, y) {
    this.context.closePath();

    if (this.recordStrokes) {
      this.strokeMemory.push(new Point(x, y));
    }
    this.dispatchEvent('strokeend', { x, y });

    if (this.recordStrokes) {
      const stroke = {
        points: this.strokeMemory.slice(),
        mode: this.mode,
        weight: this.weight,
        smoothing: this.smoothing,
        color: this.color,
        adaptiveStroke: this.adaptiveStroke
      };

      this.dispatchEvent('strokerecorded', { stroke });
    }
    this.strokeMemory = [];
  }

  /**
   * Draws a smooth quadratic curve with adaptive stroke thickness
   * between two points
   *
   * @param {number} x current X coordinate
   * @param {number} y current Y coordinate
   * @param {number} prevX previous X coordinate
   * @param {number} prevY previous Y coordinate
   */
  draw(x, y, prevX, prevY) {
    if (this.recordStrokes) {
      this.strokeMemory.push(new Point(x, y));
    }

    const { context } = this;
    // calculate distance from previous point
    const rawDist = Pixels.lineDistance(x, y, prevX, prevY);

    // now, here we scale the initial smoothing factor by the raw distance
    // this means that when the mouse moves fast, there is more smoothing
    // and when we're drawing small detailed stuff, we have more control
    // also we hard clip at 1
    const smoothingFactor = Math.min(Constants.minSmoothingFactor, this.smoothing + (rawDist - 60) / 3000);

    // calculate processed coordinates
    const procX = x - (x - prevX) * smoothingFactor;
    const procY = y - (y - prevY) * smoothingFactor;

    // recalculate distance from previous point, this time relative to the smoothed coords
    const dist = Pixels.lineDistance(procX, procY, prevX, prevY);

    if (this.adaptiveStroke) {
      // calculate target thickness based on the new distance
      this._targetThickness = (dist - Constants.minLineThickness)
        / Constants.lineThicknessRange * (this._maxWeight - this._weight) + this._weight;
      // approach the target gradually
      if (this._thickness > this._targetThickness) {
        this._thickness -= Constants.thicknessIncrement;
      }
      else if (this._thickness < this._targetThickness) {
        this._thickness += Constants.thicknessIncrement;
      }
      // set line width
      context.lineWidth = this._thickness;
    }
    else {
      // line width is equal to default weight
      context.lineWidth = this._weight;
    }

    // draw using quad interpolation
    context.quadraticCurveTo(prevX, prevY, procX, procY);
    context.stroke();

    return { x: procX, y: procY };
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
    this._maxWeight = w + Constants.weightSpread;
  }

  get mode() {
    return this._mode;
  }

  set mode(m) {
    if (typeof m !== 'string') throw new Error('wrong argument type');
    switch (m) {
      case DrawingMode.ERASE:
        this._mode = DrawingMode.ERASE;
        this.context.globalCompositeOperation = 'destination-out';
        break;
      case DrawingMode.FILL:
        this._mode = DrawingMode.FILL;
        this.context.globalCompositeOperation = 'source-over';
        break;
      default:
        this._mode = DrawingMode.DRAW;
        this.context.globalCompositeOperation = 'source-over';
        break;
    }
  }

  isDirty() {
    return !!this._dirty;
  }

  fireDirty() {
    this.dispatchEvent('dirty');
  }

  clear() {
    if (!this.isDirty) {
      return;
    }

    this._dirty = false;
    this.dispatchEvent('clean');

    // make sure we're in the right compositing mode, and erase everything
    if (this.mode === DrawingMode.ERASE) {
      this.mode = DrawingMode.DRAW;
      this.context.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
      this.mode = DrawingMode.ERASE;
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
    // converting to Array because Safari 9
    const startColor = Array.from(context.getImageData(mouse.x, mouse.y, 1, 1).data);

    if (!this._filling) {
      const { x, y } = mouse;
      this.dispatchEvent('fillstart', { x, y });
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
    const fillColor = Pixels.hexToRgb(this.color);
    // Need to save current context with colors, we will update it
    const colorLayer = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const alpha = Math.min(context.globalAlpha * 10 * 255, 255);
    const colorPixel = Pixels.colorPixel(colorLayer.data, ...fillColor, startColor, alpha);
    const matchColor = Pixels.matchColor(colorLayer.data, ...startColor);
    const matchFillColor = Pixels.matchColor(colorLayer.data, ...[...fillColor, 255]);

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
