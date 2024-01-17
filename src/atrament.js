// eslint-disable-next-line import/no-unresolved
import FillWorker from 'web-worker:./fill/worker';
import { Mouse, Point } from './mouse.js';
import * as Constants from './constants.js';
import AtramentEventTarget from './events.js';
import { lineDistance } from './pixels.js';
import { setupPointerEvents } from './pointer-events.js';

export const DrawingMode = {
  DRAW: 'draw',
  ERASE: 'erase',
  FILL: 'fill',
  DISABLED: 'disabled',
};

const pathDrawingModes = [DrawingMode.DRAW, DrawingMode.ERASE];
const configKeys = ['weight', 'smoothing', 'adaptiveStroke', 'mode'];

export default class Atrament extends AtramentEventTarget {
  adaptiveStroke = true;
  canvas;
  recordStrokes = false;
  smoothing = Constants.initialSmoothingFactor;
  thickness = Constants.initialThickness;

  #context;
  #dirty = false;
  #filling = false;
  #fillStack = [];
  #fillWorker = new FillWorker();
  #maxWeight = Constants.initialThickness + Constants.weightSpread;
  #mode = DrawingMode.DRAW;
  #mouse = new Mouse();
  #removePointerEventListeners;
  #strokeMemory = [];
  #targetThickness = Constants.initialThickness;
  #weight = Constants.initialThickness;

  constructor(selector, config = {}) {
    if (typeof window === 'undefined') {
      throw new Error('Looks like we\'re not running in a browser');
    }

    super();

    this.canvas = Atrament.#setupCanvas(selector, config);
    this.#context = Atrament.#setupContext(this.canvas, config);
    this.#setupFill();

    this.#removePointerEventListeners = setupPointerEvents({
      canvas: this.canvas,
      move: this.#pointerMove.bind(this),
      down: this.#pointerDown.bind(this),
      up: this.#pointerUp.bind(this),
    });

    configKeys.forEach((key) => {
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
    this.#context.beginPath();
    this.#context.moveTo(x, y);

    if (this.recordStrokes) {
      this.strokeTimestamp = performance.now();
      this.#strokeMemory.push({
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
    this.#context.closePath();

    if (this.recordStrokes) {
      this.#strokeMemory.push({
        point: new Point(x, y),
        time: performance.now() - this.strokeTimestamp,
      });
    }
    this.dispatchEvent('strokeend', { x, y });

    if (this.recordStrokes) {
      this.dispatchEvent('strokerecorded', { stroke: this.currentStroke });
    }
    this.#strokeMemory = [];
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
      this.#strokeMemory.push({
        point: new Point(x, y),
        time: performance.now() - this.strokeTimestamp,
      });

      this.dispatchEvent('pointdrawn', { stroke: this.currentStroke });
    }

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
      this.#targetThickness = ((dist - Constants.minLineThickness) / Constants.lineThicknessRange)
        * (this.#maxWeight - this.#weight) + this.#weight;
      // approach the target gradually
      if (this.thickness > this.#targetThickness) {
        this.thickness -= Constants.thicknessIncrement;
      } else if (this.thickness < this.#targetThickness) {
        this.thickness += Constants.thicknessIncrement;
      }
      // set line width
      this.#context.lineWidth = this.thickness;
    } else {
      // line width is equal to default weight
      this.#context.lineWidth = this.#weight;
    }

    // draw using quad interpolation
    this.#context.quadraticCurveTo(prevX, prevY, procX, procY);
    this.#context.stroke();

    return { x: procX, y: procY };
  }

  clear() {
    if (!this.#dirty) {
      return;
    }

    this.#dirty = false;
    this.dispatchEvent('clean');

    // make sure we're in the right compositing mode, and erase everything
    if (this.mode === DrawingMode.ERASE) {
      this.mode = DrawingMode.DRAW;
      this.#context.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
      this.mode = DrawingMode.ERASE;
    } else {
      this.#context.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
    }
  }

  destroy() {
    this.clear();
    this.#removePointerEventListeners?.();
  }

  get color() {
    return this.#context.strokeStyle;
  }

  set color(c) {
    if (typeof c !== 'string') throw new Error('wrong argument type');
    this.#context.strokeStyle = c;
  }

  get weight() {
    return this.#weight;
  }

  set weight(w) {
    if (typeof w !== 'number') throw new Error('wrong argument type');
    this.thickness = w;

    this.#maxWeight = w + Constants.weightSpread;
    this.#targetThickness = w;
    this.#weight = w;
  }

  get mode() {
    return this.#mode;
  }

  set mode(m) {
    if (typeof m !== 'string') throw new Error('wrong argument type');
    switch (m) {
      case DrawingMode.ERASE:
        this.#mode = DrawingMode.ERASE;
        this.#context.globalCompositeOperation = 'destination-out';
        break;
      case DrawingMode.FILL:
        this.#mode = DrawingMode.FILL;
        this.#context.globalCompositeOperation = 'source-over';
        break;
      case DrawingMode.DISABLED:
        this.#mode = DrawingMode.DISABLED;
        break;
      default:
        this.#mode = DrawingMode.DRAW;
        this.#context.globalCompositeOperation = 'source-over';
        break;
    }
  }

  get currentStroke() {
    return {
      points: this.#strokeMemory.slice(),
      mode: this.mode,
      weight: this.weight,
      smoothing: this.smoothing,
      color: this.color,
      adaptiveStroke: this.adaptiveStroke,
    };
  }

  get dirty() {
    return this.#dirty;
  }

  static #setupCanvas(selector, config) {
    let canvas;
    // get canvas element
    if (selector instanceof window.Node && selector.tagName === 'CANVAS') canvas = selector;
    else if (typeof selector === 'string') canvas = document.querySelector(selector);
    else throw new Error(`can't look for canvas based on '${selector}'`);
    if (!canvas) throw new Error('canvas not found');

    canvas.width = config.width || canvas.width;
    canvas.height = config.height || canvas.height;
    canvas.style.touchAction = 'none';

    return canvas;
  }

  static #setupContext(canvas, config) {
    const context = canvas.getContext('2d');
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    context.strokeStyle = config.color || 'rgba(0,0,0,1)';
    context.lineCap = 'round';
    context.lineJoin = 'round';

    return context;
  }

  #pointerMove(event) {
    const positions = event.getCoalescedEvents?.() || [event];
    positions.forEach((position) => {
      const x = position.offsetX;
      const y = position.offsetY;

      // draw if we should draw
      if (this.#mouse.down && pathDrawingModes.includes(this.#mode)) {
        const { x: newX, y: newY } = this.draw(
          x,
          y,
          this.#mouse.previous.x,
          this.#mouse.previous.y,
        );

        if (!this.#dirty
          && this.#mode === DrawingMode.DRAW && (x !== this.#mouse.x || y !== this.#mouse.y)) {
          this.#dirty = true;
          this.dispatchEvent('dirty');
        }

        this.#mouse.set(x, y);
        this.#mouse.previous.set(newX, newY);
      } else {
        this.#mouse.set(x, y);
      }
    });
  }

  #pointerDown(event) {
    // update position just in case
    this.#pointerMove(event);

    // if we are filling - fill and return
    if (this.mode === DrawingMode.FILL) {
      this.#fill();
      return;
    }
    // remember it
    this.#mouse.previous.set(this.#mouse.x, this.#mouse.y);
    this.#mouse.down = true;

    this.beginStroke(this.#mouse.previous.x, this.#mouse.previous.y);
  }

  #pointerUp(event) {
    if (this.#mode === DrawingMode.FILL) {
      return;
    }

    if (!this.#mouse.down) {
      return;
    }

    this.#mouse.down = false;

    if (this.#mouse.x === event.offsetX
      && this.#mouse.y === event.offsetY && pathDrawingModes.includes(this.mode)) {
      const { x: nx, y: ny } = this.draw(
        this.#mouse.x,
        this.#mouse.y,
        this.#mouse.previous.x,
        this.#mouse.previous.y,
      );
      this.#mouse.previous.set(nx, ny);
    }

    this.endStroke(this.#mouse.x, this.#mouse.y);
  }

  #setupFill() {
    this.#fillWorker.addEventListener('message', ({ data }) => {
      if (data.type === 'fill-result') {
        this.#filling = false;
        this.dispatchEvent('fillend', {});

        const imageData = new ImageData(data.result, this.canvas.width, this.canvas.height);
        this.#context.putImageData(imageData, 0, 0);

        if (this.#fillStack.length > 0) {
          this.#postToFillWorker(this.#fillStack.shift());
        }
      }
    });
  }

  #fill() {
    const { x, y } = this.#mouse;
    this.dispatchEvent('fillstart', { x, y });

    const startColor = Array.from(this.#context.getImageData(x, y, 1, 1).data);
    const fillData = {
      color: this.color,
      globalAlpha: this.#context.globalAlpha,
      width: this.canvas.width,
      height: this.canvas.height,
      startColor,
      startX: x,
      startY: y,
    };

    if (!this.#filling) {
      this.#filling = true;
      this.#postToFillWorker(fillData);
    } else {
      this.#fillStack.push(fillData);
    }
  }

  #postToFillWorker(fillData) {
    const image = this.#context.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
    this.#fillWorker.postMessage({ image, ...fillData }, [image.buffer]);
  }
}
