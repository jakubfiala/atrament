// eslint-disable-next-line import/no-unresolved
import FillWorker from 'web-worker:./fill/worker';
import { Mouse, Point } from './mouse.js';
import AtramentEventTarget from './events.js';
import { lineDistance } from './pixels.js';
import { setupPointerEvents } from './pointer-events.js';

import {
  MIN_LINE_THICKNESS,
  LINE_THICKNESS_RANGE,
  THICKNESS_INCREMENT,
  MIN_SMOOTHING_FACTOR,
  INITIAL_SMOOTHING_FACTOR,
  WEIGHT_SPREAD,
  INITIAL_THICKNESS,
  DEFAULT_PRESSURE,
  ERASE_THICKNESS_RATIO,
} from './constants.js';

export const MODE_DRAW = Symbol('atrament mode - draw');
export const MODE_ERASE = Symbol('atrament mode - erase');
export const MODE_FILL = Symbol('atrament mode - fill');
export const MODE_DISABLED = Symbol('atrament mode - disabled');

const pathDrawingModes = [MODE_DRAW, MODE_ERASE];
const configKeys = ['weight', 'smoothing', 'adaptiveStroke', 'mode', 'secondaryEraser'];

export default class Atrament extends AtramentEventTarget {
  adaptiveStroke = true;
  canvas;
  recordStrokes = false;
  resolution = window.devicePixelRatio;
  smoothing = INITIAL_SMOOTHING_FACTOR;
  thickness = INITIAL_THICKNESS;
  secondaryEraser = false;

  #context;
  #dirty = false;
  #filling = false;
  #fillStack = [];
  #fillWorker = new FillWorker();
  #mode = MODE_DRAW;
  #mouse = new Mouse();
  #pressure = DEFAULT_PRESSURE;
  #removePointerEventListeners;
  #secondaryEraserFromMode = MODE_DRAW;
  #strokeMemory = [];
  #thickness = INITIAL_THICKNESS;
  #weight = INITIAL_THICKNESS;

  constructor(selector, config = {}) {
    if (typeof window === 'undefined') {
      throw new Error('atrament: looks like we\'re not running in a browser');
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

    this.canvas.addEventListener('contextmenu', (event) => {
      if (this.secondaryEraser) {
        event.preventDefault();
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
    this.#context.moveTo(x, y);
    this.#thickness = this.#weight;

    if (this.recordStrokes) {
      this.strokeTimestamp = performance.now();
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
    this.dispatchEvent('strokeend', { x, y });

    if (this.recordStrokes) {
      this.dispatchEvent('strokerecorded', { stroke: this.currentStroke });
    }
    this.#strokeMemory = [];
    delete (this.strokeTimestamp);
  }

  /**
   * Draws the next stroke segment as a smooth quadratic curve
   * with adaptive stroke thickness between two points.
   *
   * @param {number} x current X coordinate
   * @param {number} y current Y coordinate
   * @param {number} previousX previous X coordinate
   * @param {number} previousY previous Y coordinate
   */
  draw(x, y, previousX, previousY) {
    // If the user clicks (or double clicks) without moving the mouse,
    // previousX/Y will be 0. In this case, we don't want to draw a line from (0,0) to (x,y),
    // but a "point" from (x,y) to (x,y).
    const prevX = previousX || x;
    const prevY = previousY || y;
    // get distance from the previous point
    // and use it to calculate the smoothed coordinates
    const smoothingFactor = this.getSmoothingFactor(lineDistance(x, y, prevX, prevY));
    const procX = x - (x - prevX) * smoothingFactor;
    const procY = y - (y - prevY) * smoothingFactor;

    // recalculate distance from previous point, this time relative to the smoothed coords
    const dist = lineDistance(procX, procY, prevX, prevY);

    // Adaptive stroke allows an effect where thickness changes
    // over the course of the stroke. This simulates the variation in
    // ink discharge of a physical pen.
    if (this.adaptiveStroke) {
      // Thickness range is inversely proportional to pressure,
      // because with higher pressure, the effect of distance
      // on the thickness ratio should be greater.
      const range = LINE_THICKNESS_RANGE * (1 - this.#pressure);
      const ratio = (dist - MIN_LINE_THICKNESS) / range;
      // Calculate target thickness based on weight settings.
      const targetThickness = ratio * (this.#maxWeight - this.#weight) + this.#weight;

      // approach the target gradually
      if (this.#thickness > targetThickness) {
        this.#thickness -= THICKNESS_INCREMENT;
      } else if (this.#thickness < targetThickness) {
        this.#thickness += THICKNESS_INCREMENT;
      }
    } else {
      this.#thickness = this.#weight;
    }

    this.#context.lineWidth = this.#thickness;

    // Draw the segment using quad interpolation.
    this.#context.beginPath();
    this.#context.moveTo(prevX, prevY);
    this.#context.quadraticCurveTo(prevX, prevY, procX, procY);
    this.#context.closePath();
    this.#context.stroke();

    if (this.recordStrokes) {
      this.#strokeMemory.push({
        point: new Point(x, y),
        time: performance.now() - this.strokeTimestamp,
      });

      this.dispatchEvent('segmentdrawn', { stroke: this.currentStroke });
    }

    // At this point, we can be certain the canvas has some drawing on it,
    // so we can toggle the "dirty" state. Checking it here ensures that
    // the state is also updated during programmatic drawing.
    if (!this.#dirty && this.#mode === MODE_DRAW) {
      this.#dirty = true;
      this.dispatchEvent('dirty');
    }

    return { x: procX, y: procY };
  }

  clear() {
    this.#dirty = false;
    this.dispatchEvent('clean');

    // make sure we're in the right compositing mode, and erase everything
    const eraseMode = this.mode === MODE_ERASE;
    if (eraseMode) {
      this.mode = MODE_DRAW;
    }

    // clear the canvas without the transform
    // code taken from https://stackoverflow.com/a/6722031
    this.#context.save();
    this.#context.setTransform(1, 0, 0, 1, 0, 0);
    this.#context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.#context.restore();

    if (eraseMode) {
      this.mode = MODE_ERASE;
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
    if (typeof c !== 'string') throw new Error('atrament: wrong argument type setting color');
    this.#context.strokeStyle = c;
  }

  get weight() {
    return this.#weight;
  }

  set weight(w) {
    if (typeof w !== 'number') throw new Error('atrament: wrong argument type setting weight');
    this.#thickness = w;
    this.#weight = w;
  }

  // For small weights, this allows for a lot of spread,
  // while for larger weights, the effect is less prominent.
  // This means at small weights, Atrament behaves more like an ink pen,
  // and at larger weights more like a marker.
  get #maxWeight() {
    return this.#weight + WEIGHT_SPREAD;
  }

  // Here we scale the initial smoothing factor by the raw distance
  // - this means that when the mouse moves fast, there is more smoothing,
  // and when we're drawing small detailed stuff, we have more control.
  getSmoothingFactor(dist) {
    return Math.min(
      MIN_SMOOTHING_FACTOR,
      this.smoothing + (dist - 60) / 3000,
    );
  }

  get mode() {
    return this.#mode;
  }

  set mode(m) {
    switch (m) {
      case MODE_ERASE:
        this.#mode = MODE_ERASE;
        this.#context.globalCompositeOperation = 'destination-out';
        break;
      case MODE_FILL:
        this.#mode = MODE_FILL;
        this.#context.globalCompositeOperation = 'source-over';
        break;
      case MODE_DISABLED:
        this.#mode = MODE_DISABLED;
        break;
      case MODE_DRAW:
        this.#mode = MODE_DRAW;
        this.#context.globalCompositeOperation = 'source-over';
        break;
      default:
        throw new Error('atrament: mode is not one of the allowed modes.');
    }
  }

  get currentStroke() {
    return {
      segments: this.#strokeMemory.slice(),
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
    else throw new Error(`atrament: can't look for canvas based on '${selector}'`);
    if (!canvas) throw new Error('atrament: canvas not found');
    // since this method is static, we have to add a fallback to the resolution here
    // TODO: see if these methods really have to be static.
    const scale = config.resolution || window.devicePixelRatio;
    canvas.width = (config.width || canvas.width) * scale;
    canvas.height = (config.height || canvas.height) * scale;
    canvas.style.touchAction = 'none';

    return canvas;
  }

  static #setupContext(canvas, config) {
    const context = canvas.getContext('2d');
    // since this method is static, we have to add a fallback to the resolution here
    // TODO: see if these methods really have to be static.
    const scale = config.resolution || window.devicePixelRatio;
    context.scale(scale, scale);
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

        this.#mouse.set(x, y);
        this.#mouse.previous.set(newX, newY);
        // Android Chrome sets pressure to constant 1 by default,
        // which would break the algorithm.
        // We also handle the case when pressure is 0.
        this.#pressure = position.pressure === 1
          ? DEFAULT_PRESSURE
          : position.pressure || DEFAULT_PRESSURE;
      } else {
        this.#mouse.set(x, y);
        this.#mouse.previous.set(x, y);
      }
    });
  }

  #pointerDown(event) {
    if (event.button === 2) {
      if (this.secondaryEraser) {
        this.#secondaryEraserFromMode = this.#mode;
        this.mode = MODE_ERASE;
      } else {
        return;
      }
    } else if (this.mode === MODE_FILL) {
      this.#fill();
      return;
    }

    this.#mouse.down = true;
    // update position just in case
    this.#pointerMove(event);

    this.beginStroke(this.#mouse.previous.x, this.#mouse.previous.y);
  }

  #pointerUp(event) {
    if (this.#mode === MODE_FILL) {
      return;
    }

    if (!this.#mouse.down) {
      return;
    }

    this.#mouse.down = false;

    if (event.button === 2) {
      if (this.secondaryEraser) {
        this.mode = this.#secondaryEraserFromMode ?? MODE_DRAW;
      }

      return;
    }

    if (this.#mouse.x === event.offsetX
      && this.#mouse.y === event.offsetY && pathDrawingModes.includes(this.mode)) {
      this.draw(
        this.#mouse.x,
        this.#mouse.y,
        this.#mouse.previous.x,
        this.#mouse.previous.y,
      );
    }

    this.#mouse.previous.set(0, 0);

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
      startX: x * this.resolution,
      startY: y * this.resolution,
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
