'use strict';

/* eslint-disable max-classes-per-file */
// make a class for Point
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }
}

// make a class for the mouse data
class Mouse extends Point {
  constructor() {
    super(0, 0);
    this.down = false;
    this.previous = new Point(0, 0);
  }
}

const floodFillInterval = 100;
const maxLineThickness = 50;
const minLineThickness = 1;
const lineThicknessRange = maxLineThickness - minLineThickness;
const thicknessIncrement = 0.5;
const minSmoothingFactor = 0.87;
const initialSmoothingFactor = 0.85;
const weightSpread = 10;
const initialThickness = 2;

class AtramentEventTarget {
  constructor() {
    this.eventListeners = new Map();
  }

  addEventListener(eventName, handler) {
    const handlers = this.eventListeners.get(eventName) || new Set();
    handlers.add(handler);
    this.eventListeners.set(eventName, handlers);
  }

  removeEventListener(eventName, handler) {
    const handlers = this.eventListeners.get(eventName);
    if (!handlers) return;
    handlers.delete(handler);
  }

  dispatchEvent(eventName, data) {
    const handlers = this.eventListeners.get(eventName);
    if (!handlers) return;
    [...handlers].forEach((handler) => handler(data));
  }
}

const lineDistance = (x1, y1, x2, y2) => {
  // calculate euclidean distance between (x1, y1) and (x2, y2)
  const xs = (x2 - x1) ** 2;
  const ys = (y2 - y1) ** 2;
  return Math.sqrt(xs + ys);
};

const hexToRgb = (hexColor) => {
  // Since input type color provides hex and ImageData accepts RGB need to transform
  const m = hexColor.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  return [
    parseInt(m[1], 16),
    parseInt(m[2], 16),
    parseInt(m[3], 16),
  ];
};

const matchColor = (data, compR, compG, compB, compA) => (pixelPos) => {
  // Pixel color equals comp color?
  const r = data[pixelPos];
  const g = data[pixelPos + 1];
  const b = data[pixelPos + 2];
  const a = data[pixelPos + 3];

  return (r === compR && g === compG && b === compB && a === compA);
};

/* eslint-disable no-param-reassign */
const colorPixel = (data, fillR, fillG, fillB, startColor, alpha) => {
  const matcher = matchColor(data, ...startColor);

  return (pixelPos) => {
    // Update fill color in matrix
    data[pixelPos] = fillR;
    data[pixelPos + 1] = fillG;
    data[pixelPos + 2] = fillB;
    data[pixelPos + 3] = alpha;

    if (!matcher(pixelPos + 4)) {
      data[pixelPos + 4] = data[pixelPos + 4] * 0.01 + fillR * 0.99;
      data[pixelPos + 4 + 1] = data[pixelPos + 4 + 1] * 0.01 + fillG * 0.99;
      data[pixelPos + 4 + 2] = data[pixelPos + 4 + 2] * 0.01 + fillB * 0.99;
      data[pixelPos + 4 + 3] = data[pixelPos + 4 + 3] * 0.01 + alpha * 0.99;
    }

    if (!matcher(pixelPos - 4)) {
      data[pixelPos - 4] = data[pixelPos - 4] * 0.01 + fillR * 0.99;
      data[pixelPos - 4 + 1] = data[pixelPos - 4 + 1] * 0.01 + fillG * 0.99;
      data[pixelPos - 4 + 2] = data[pixelPos - 4 + 2] * 0.01 + fillB * 0.99;
      data[pixelPos - 4 + 3] = data[pixelPos - 4 + 3] * 0.01 + alpha * 0.99;
    }
  };
};
/* eslint-enable no-param-reassign */

const DrawingMode = {
  DRAW: 'draw',
  ERASE: 'erase',
  FILL: 'fill',
  DISABLED: 'disabled',
};

const PathDrawingModes = [DrawingMode.DRAW, DrawingMode.ERASE];

class Atrament extends AtramentEventTarget {
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

    const pointerMove = (event) => {
      if (event.cancelable) {
        event.preventDefault();
      }

      const positions = event.getCoalescedEvents();

      positions.forEach((position) => {
        const x = position.offsetX;
        const y = position.offsetY;

        const { mouse } = this;
        // draw if we should draw
        if (mouse.down && PathDrawingModes.includes(this.modeInternal)) {
          const { x: newX, y: newY } = this.draw(x, y, mouse.previous.x, mouse.previous.y);

          if (!this.dirty
            && this.modeInternal === DrawingMode.DRAW && (x !== mouse.x || y !== mouse.y)) {
            this.dirty = true;
            this.fireDirty();
          }

          mouse.set(x, y);
          mouse.previous.set(newX, newY);
        } else {
          mouse.set(x, y);
        }
      });
    };

    const pointerDown = (event) => {
      if (event.cancelable) {
        event.preventDefault();
      }
      // update position just in case
      pointerMove(event);

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

    const pointerUp = (e) => {
      if (this.mode === DrawingMode.FILL) {
        return;
      }

      const { mouse } = this;

      if (!mouse.down) {
        return;
      }

      const position = (e.changedTouches && e.changedTouches[0]) || e;
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
    this.canvas.addEventListener('pointermove', pointerMove);
    this.canvas.addEventListener('pointerdown', pointerDown);
    document.addEventListener('pointerup', pointerUp);

    // helper for destroying Atrament (removing event listeners)
    this.destroy = () => {
      this.clear();
      this.canvas.removeEventListener('pointermove', pointerMove);
      this.canvas.removeEventListener('pointerdown', pointerDown);
      document.removeEventListener('pointerup', pointerUp);
    };

    // set internal canvas params
    this.context = this.canvas.getContext('2d');
    this.context.globalCompositeOperation = 'source-over';
    this.context.globalAlpha = 1;
    this.context.strokeStyle = config.color || 'rgba(0,0,0,1)';
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.translate(0.5, 0.5);

    this.filling = false;
    this.fillStack = [];

    // set drawing params
    this.recordStrokes = false;
    this.strokeMemory = [];

    this.smoothing = initialSmoothingFactor;
    this.thickness = initialThickness;
    this.targetThickness = this.thickness;
    this.weightInternal = this.thickness;
    this.maxWeight = this.thickness + weightSpread;

    this.modeInternal = DrawingMode.DRAW;
    this.adaptiveStroke = true;

    // update from config object
    ['weight', 'smoothing', 'adaptiveStroke', 'mode']
      .forEach((key) => {
        if (config[key] !== undefined) {
          this[key] = config[key];
        }
      });
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
      this.strokeTimestamp = performance.now();
      this.strokeMemory.push({
        point: new Point(x, y),
        time: performance.now() - this.strokeTimestamp,
      });
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
      this.strokeMemory.push({
        point: new Point(x, y),
        time: performance.now() - this.strokeTimestamp,
      });
    }
    this.dispatchEvent('strokeend', { x, y });

    if (this.recordStrokes) {
      this.dispatchEvent('strokerecorded', { stroke: this.currentStroke });
    }
    this.strokeMemory = [];
    delete (this.strokeTimestamp);
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
      this.strokeMemory.push({
        point: new Point(x, y),
        time: performance.now() - this.strokeTimestamp,
      });

      this.dispatchEvent('pointdrawn', { stroke: this.currentStroke });
    }

    const { context } = this;
    // calculate distance from previous point
    const rawDist = lineDistance(x, y, prevX, prevY);

    // now, here we scale the initial smoothing factor by the raw distance
    // this means that when the mouse moves fast, there is more smoothing
    // and when we're drawing small detailed stuff, we have more control
    // also we hard clip at 1
    const smoothingFactor = Math.min(
      minSmoothingFactor,
      this.smoothing + (rawDist - 60) / 3000,
    );

    // calculate processed coordinates
    const procX = x - (x - prevX) * smoothingFactor;
    const procY = y - (y - prevY) * smoothingFactor;

    // recalculate distance from previous point, this time relative to the smoothed coords
    const dist = lineDistance(procX, procY, prevX, prevY);

    if (this.adaptiveStroke) {
      // calculate target thickness based on the new distance
      this.targetThickness = ((dist - minLineThickness) / lineThicknessRange)
        * (this.maxWeight - this.weightInternal) + this.weightInternal;
      // approach the target gradually
      if (this.thickness > this.targetThickness) {
        this.thickness -= thicknessIncrement;
      } else if (this.thickness < this.targetThickness) {
        this.thickness += thicknessIncrement;
      }
      // set line width
      context.lineWidth = this.thickness;
    } else {
      // line width is equal to default weight
      context.lineWidth = this.weightInternal;
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
    return this.weightInternal;
  }

  set weight(w) {
    if (typeof w !== 'number') throw new Error('wrong argument type');
    this.weightInternal = w;
    this.thickness = w;
    this.targetThickness = w;
    this.maxWeight = w + weightSpread;
  }

  get mode() {
    return this.modeInternal;
  }

  set mode(m) {
    if (typeof m !== 'string') throw new Error('wrong argument type');
    switch (m) {
      case DrawingMode.ERASE:
        this.modeInternal = DrawingMode.ERASE;
        this.context.globalCompositeOperation = 'destination-out';
        break;
      case DrawingMode.FILL:
        this.modeInternal = DrawingMode.FILL;
        this.context.globalCompositeOperation = 'source-over';
        break;
      case DrawingMode.DISABLED:
        this.modeInternal = DrawingMode.DISABLED;
        break;
      default:
        this.modeInternal = DrawingMode.DRAW;
        this.context.globalCompositeOperation = 'source-over';
        break;
    }
  }

  get currentStroke() {
    return {
      points: this.strokeMemory.slice(),
      mode: this.mode,
      weight: this.weight,
      smoothing: this.smoothing,
      color: this.color,
      adaptiveStroke: this.adaptiveStroke,
    };
  }

  isDirty() {
    return !!this.dirty;
  }

  fireDirty() {
    this.dispatchEvent('dirty');
  }

  clear() {
    if (!this.isDirty) {
      return;
    }

    this.dirty = false;
    this.dispatchEvent('clean');

    // make sure we're in the right compositing mode, and erase everything
    if (this.modeInternal === DrawingMode.ERASE) {
      this.modeInternal = DrawingMode.DRAW;
      this.context.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
      this.modeInternal = DrawingMode.ERASE;
    } else {
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

    if (!this.filling) {
      const { x, y } = mouse;
      this.dispatchEvent('fillstart', { x, y });
      this.filling = true;
      setTimeout(() => {
        this.floodFill(mouse.x, mouse.y, startColor);
      }, floodFillInterval);
    } else {
      this.fillStack.push([
        mouse.x,
        mouse.y,
        startColor,
      ]);
    }
  }

  floodFill(_startX, _startY, startColor) {
    const { context } = this;
    const startX = Math.floor(_startX);
    const startY = Math.floor(_startY);
    const canvasWidth = context.canvas.width;
    const canvasHeight = context.canvas.height;
    const pixelStack = [[startX, startY]];
    // hex needs to be trasformed to rgb since colorLayer accepts RGB
    const fillColor = hexToRgb(this.color);
    // Need to save current context with colors, we will update it
    const colorLayer = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const alpha = Math.min(context.globalAlpha * 10 * 255, 255);
    const colorPixel$1 = colorPixel(colorLayer.data, ...fillColor, startColor, alpha);
    const matchColor$1 = matchColor(colorLayer.data, ...startColor);
    const matchFillColor = matchColor(colorLayer.data, ...[...fillColor, 255]);

    // check if we're trying to fill with the same colour, if so, stop
    if (matchFillColor((startY * context.canvas.width + startX) * 4)) {
      this.filling = false;
      this.dispatchEvent('fillend', {});
      return;
    }

    while (pixelStack.length) {
      const newPos = pixelStack.pop();
      const x = newPos[0];
      let y = newPos[1];

      let pixelPos = (y * canvasWidth + x) * 4;

      while (y-- >= 0 && matchColor$1(pixelPos)) {
        pixelPos -= canvasWidth * 4;
      }
      pixelPos += canvasWidth * 4;

      ++y;

      let reachLeft = false;
      let reachRight = false;

      while (y++ < canvasHeight - 1 && matchColor$1(pixelPos)) {
        colorPixel$1(pixelPos);

        if (x > 0) {
          if (matchColor$1(pixelPos - 4)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < canvasWidth - 1) {
          if (matchColor$1(pixelPos + 4)) {
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

    if (this.fillStack.length) {
      this.floodFill(...this.fillStack.shift());
    } else {
      this.filling = false;
      this.dispatchEvent('fillend', {});
    }
  }
}

exports.Atrament = Atrament;
