// eslint-disable-next-line import/no-unresolved
import FillWorker from 'web-worker:./fill/worker';
import { Mouse, Point } from './mouse.js';
import * as Constants from './constants.js';
import AtramentEventTarget from './events.js';
import { lineDistance } from './pixels.js';
import { setupPointerEvents } from './pointer-events.js';

const DrawingMode = {
  DRAW: 'draw',
  ERASE: 'erase',
  FILL: 'fill',
  DISABLED: 'disabled',
};

const PathDrawingModes = [DrawingMode.DRAW, DrawingMode.ERASE];

export default class Atrament extends AtramentEventTarget {
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
    this.canvas.style.touchAction = 'none';

    // create a mouse object
    this.mouse = new Mouse();

    const { removePointerEventListeners } = setupPointerEvents({
      canvas: this.canvas,
      move: this.pointerMove.bind(this),
      down: this.pointerDown.bind(this),
      up: this.pointerUp.bind(this),
    });

    // helper for destroying Atrament (removing event listeners)
    this.destroy = () => {
      this.clear();
      removePointerEventListeners();
    };

    // set internal canvas params
    this.context = this.canvas.getContext('2d');
    this.context.globalCompositeOperation = 'source-over';
    this.context.globalAlpha = 1;
    this.context.strokeStyle = config.color || 'rgba(0,0,0,1)';
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';

    this.filling = false;
    this.fillStack = [];

    // set drawing params
    this.recordStrokes = false;
    this.strokeMemory = [];

    this.smoothing = Constants.initialSmoothingFactor;
    this.thickness = Constants.initialThickness;
    this.targetThickness = this.thickness;
    this.weightInternal = this.thickness;
    this.maxWeight = this.thickness + Constants.weightSpread;

    this.modeInternal = DrawingMode.DRAW;
    this.adaptiveStroke = true;

    this.setupFill();

    // update from config object
    ['weight', 'smoothing', 'adaptiveStroke', 'mode']
      .forEach((key) => {
        if (config[key] !== undefined) {
          this[key] = config[key];
        }
      });
  }

  pointerMove(event) {
    const positions = event.getCoalescedEvents?.() || [event];
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
  }

  pointerDown(event) {
    // update position just in case
    this.pointerMove(event);

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
  }

  pointerUp(event) {
    if (this.mode === DrawingMode.FILL) {
      return;
    }

    const { mouse } = this;

    if (!mouse.down) {
      return;
    }

    mouse.down = false;

    if (mouse.x === event.offsetX
      && mouse.y === event.offsetY && PathDrawingModes.includes(this.mode)) {
      const { x: nx, y: ny } = this.draw(mouse.x, mouse.y, mouse.previous.x, mouse.previous.y);
      mouse.previous.set(nx, ny);
    }

    this.endStroke(mouse.x, mouse.y);
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
      Constants.minSmoothingFactor,
      this.smoothing + (rawDist - 60) / 3000,
    );

    // calculate processed coordinates
    const procX = x - (x - prevX) * smoothingFactor;
    const procY = y - (y - prevY) * smoothingFactor;

    // recalculate distance from previous point, this time relative to the smoothed coords
    const dist = lineDistance(procX, procY, prevX, prevY);

    if (this.adaptiveStroke) {
      // calculate target thickness based on the new distance
      this.targetThickness = ((dist - Constants.minLineThickness) / Constants.lineThicknessRange)
        * (this.maxWeight - this.weightInternal) + this.weightInternal;
      // approach the target gradually
      if (this.thickness > this.targetThickness) {
        this.thickness -= Constants.thicknessIncrement;
      } else if (this.thickness < this.targetThickness) {
        this.thickness += Constants.thicknessIncrement;
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
    this.maxWeight = w + Constants.weightSpread;
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

  setupFill() {
    this.fillWorker = new FillWorker();
    this.fillWorker.addEventListener('message', ({ data }) => {
      if (data.type === 'fill-result') {
        this.filling = false;
        this.dispatchEvent('fillend', {});
        const imageData = new ImageData(data.result, this.canvas.width, this.canvas.height);
        this.context.putImageData(imageData, 0, 0);

        if (this.fillStack.length > 0) {
          this.postToFillWorker(this.fillStack.shift());
        }
      }
    });
  }

  fill() {
    const { x, y } = this.mouse;
    this.dispatchEvent('fillstart', { x, y });

    const startColor = Array.from(this.context.getImageData(x, y, 1, 1).data);
    const fillData = {
      color: this.color,
      globalAlpha: this.context.globalAlpha,
      width: this.canvas.width,
      height: this.canvas.height,
      startColor,
      startX: x,
      startY: y,
    };

    if (!this.filling) {
      this.filling = true;
      this.postToFillWorker(fillData);
    } else {
      this.fillStack.push(fillData);
    }
  }

  postToFillWorker(fillData) {
    const image = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
    this.fillWorker.postMessage({ image, ...fillData }, [image.buffer]);
  }
}
