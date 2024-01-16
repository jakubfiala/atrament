'use strict';

var WorkerClass = null;

try {
    var WorkerThreads =
        typeof module !== 'undefined' && typeof module.require === 'function' && module.require('worker_threads') ||
        typeof __non_webpack_require__ === 'function' && __non_webpack_require__('worker_threads') ||
        typeof require === 'function' && require('worker_threads');
    WorkerClass = WorkerThreads.Worker;
} catch(e) {} // eslint-disable-line

function decodeBase64$1(base64, enableUnicode) {
    return Buffer.from(base64, 'base64').toString(enableUnicode ? 'utf16' : 'utf8');
}

function createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg) {
    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
    var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
    var source = decodeBase64$1(base64, enableUnicode);
    var start = source.indexOf('\n', 10) + 1;
    var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
    return function WorkerFactory(options) {
        return new WorkerClass(body, Object.assign({}, options, { eval: true }));
    };
}

function decodeBase64(base64, enableUnicode) {
    var binaryString = atob(base64);
    if (enableUnicode) {
        var binaryView = new Uint8Array(binaryString.length);
        for (var i = 0, n = binaryString.length; i < n; ++i) {
            binaryView[i] = binaryString.charCodeAt(i);
        }
        return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
    }
    return binaryString;
}

function createURL(base64, sourcemapArg, enableUnicodeArg) {
    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
    var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
    var source = decodeBase64(base64, enableUnicode);
    var start = source.indexOf('\n', 10) + 1;
    var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
    var blob = new Blob([body], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
}

function createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg) {
    var url;
    return function WorkerFactory(options) {
        url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
        return new Worker(url, options);
    };
}

var kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

function isNodeJS() {
    return kIsNodeJS;
}

function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
    if (isNodeJS()) {
        return createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg);
    }
    return createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg);
}

var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgLy8gY29sb3VyIGluZGljZXMgcGVyIHBpeGVsCiAgY29uc3QgUiA9IDA7CiAgY29uc3QgRyA9IDE7CiAgY29uc3QgQiA9IDI7CiAgY29uc3QgQSA9IDM7CgogIGNvbnN0IFBJWEVMID0gNDsKCiAgY29uc3QgaGV4VG9SZ2IgPSAoaGV4Q29sb3IpID0+IHsKICAgIC8vIFNpbmNlIGlucHV0IHR5cGUgY29sb3IgcHJvdmlkZXMgaGV4IGFuZCBJbWFnZURhdGEgYWNjZXB0cyBSR0IgbmVlZCB0byB0cmFuc2Zvcm0KICAgIGNvbnN0IG0gPSBoZXhDb2xvci5tYXRjaCgvXiM/KFtcZGEtZl17Mn0pKFtcZGEtZl17Mn0pKFtcZGEtZl17Mn0pJC9pKTsKICAgIHJldHVybiBbCiAgICAgIHBhcnNlSW50KG1bMV0sIDE2KSwKICAgICAgcGFyc2VJbnQobVsyXSwgMTYpLAogICAgICBwYXJzZUludChtWzNdLCAxNiksCiAgICBdOwogIH07CgogIC8vIFBpeGVsIGNvbG9yIGVxdWFscyBjb21wIGNvbG9yPwogIGNvbnN0IGNvbG9yTWF0Y2hlciA9IChkYXRhLCBjb21wUiwgY29tcEcsIGNvbXBCLCBjb21wQSkgPT4gKHBpeGVsUG9zKSA9PiAoCiAgICBkYXRhW3BpeGVsUG9zICsgUl0gPT09IGNvbXBSCiAgICAmJiBkYXRhW3BpeGVsUG9zICsgR10gPT09IGNvbXBHCiAgICAmJiBkYXRhW3BpeGVsUG9zICsgQl0gPT09IGNvbXBCCiAgICAmJiBkYXRhW3BpeGVsUG9zICsgQV0gPT09IGNvbXBBCiAgKTsKCiAgLyogZXNsaW50LWRpc2FibGUgbm8tcGFyYW0tcmVhc3NpZ24gKi8KICBjb25zdCBwaXhlbFBhaW50ZXIgPSAoZGF0YSwgZmlsbFIsIGZpbGxHLCBmaWxsQiwgc3RhcnRDb2xvciwgYWxwaGEpID0+IHsKICAgIGNvbnN0IG1hdGNoZXIgPSBjb2xvck1hdGNoZXIoZGF0YSwgLi4uc3RhcnRDb2xvcik7CgogICAgcmV0dXJuIChwaXhlbFBvcykgPT4gewogICAgICAvLyBVcGRhdGUgZmlsbCBjb2xvciBpbiBtYXRyaXgKICAgICAgZGF0YVtwaXhlbFBvc10gPSBmaWxsUjsKICAgICAgZGF0YVtwaXhlbFBvcyArIDFdID0gZmlsbEc7CiAgICAgIGRhdGFbcGl4ZWxQb3MgKyAyXSA9IGZpbGxCOwogICAgICBkYXRhW3BpeGVsUG9zICsgM10gPSBhbHBoYTsKCiAgICAgIGlmICghbWF0Y2hlcihwaXhlbFBvcyArIFBJWEVMKSkgewogICAgICAgIGRhdGFbcGl4ZWxQb3MgKyBQSVhFTCArIFJdID0gZGF0YVtwaXhlbFBvcyArIFBJWEVMICsgUl0gKiAwLjAxICsgZmlsbFIgKiAwLjk5OwogICAgICAgIGRhdGFbcGl4ZWxQb3MgKyBQSVhFTCArIEddID0gZGF0YVtwaXhlbFBvcyArIFBJWEVMICsgR10gKiAwLjAxICsgZmlsbEcgKiAwLjk5OwogICAgICAgIGRhdGFbcGl4ZWxQb3MgKyBQSVhFTCArIEJdID0gZGF0YVtwaXhlbFBvcyArIFBJWEVMICsgQl0gKiAwLjAxICsgZmlsbEIgKiAwLjk5OwogICAgICAgIGRhdGFbcGl4ZWxQb3MgKyBQSVhFTCArIEFdID0gZGF0YVtwaXhlbFBvcyArIFBJWEVMICsgQV0gKiAwLjAxICsgYWxwaGEgKiAwLjk5OwogICAgICB9CgogICAgICBpZiAoIW1hdGNoZXIocGl4ZWxQb3MgLSBQSVhFTCkpIHsKICAgICAgICBkYXRhW3BpeGVsUG9zIC0gUElYRUwgKyBSXSA9IGRhdGFbcGl4ZWxQb3MgLSBQSVhFTCArIFJdICogMC4wMSArIGZpbGxSICogMC45OTsKICAgICAgICBkYXRhW3BpeGVsUG9zIC0gUElYRUwgKyBHXSA9IGRhdGFbcGl4ZWxQb3MgLSBQSVhFTCArIEddICogMC4wMSArIGZpbGxHICogMC45OTsKICAgICAgICBkYXRhW3BpeGVsUG9zIC0gUElYRUwgKyBCXSA9IGRhdGFbcGl4ZWxQb3MgLSBQSVhFTCArIEJdICogMC4wMSArIGZpbGxCICogMC45OTsKICAgICAgICBkYXRhW3BpeGVsUG9zIC0gUElYRUwgKyBBXSA9IGRhdGFbcGl4ZWxQb3MgLSBQSVhFTCArIEFdICogMC4wMSArIGFscGhhICogMC45OTsKICAgICAgfQogICAgfTsKICB9OwogIC8qIGVzbGludC1lbmFibGUgbm8tcGFyYW0tcmVhc3NpZ24gKi8KCiAgY29uc3QgZmxvb2RGaWxsID0gKHsKICAgIGltYWdlLAogICAgd2lkdGgsCiAgICBoZWlnaHQsCiAgICBjb2xvciwKICAgIGdsb2JhbEFscGhhLAogICAgc3RhcnRYLAogICAgc3RhcnRZLAogICAgc3RhcnRDb2xvciwKICB9KSA9PiB7CiAgICBjb25zdCBmbG9vclggPSBNYXRoLmZsb29yKHN0YXJ0WCk7CiAgICBjb25zdCBmbG9vclkgPSBNYXRoLmZsb29yKHN0YXJ0WSk7CiAgICBjb25zdCBwaXhlbFN0YWNrID0gW1tmbG9vclgsIGZsb29yWV1dOwogICAgLy8gaGV4IG5lZWRzIHRvIGJlIHRyYXNmb3JtZWQgdG8gcmdiIHNpbmNlIGNvbG9yTGF5ZXIgYWNjZXB0cyBSR0IKICAgIGNvbnN0IGZpbGxDb2xvciA9IGhleFRvUmdiKGNvbG9yKTsKICAgIGNvbnN0IGFscGhhID0gTWF0aC5taW4oZ2xvYmFsQWxwaGEgKiAxMCAqIDI1NSwgMjU1KTsKICAgIGNvbnN0IGNvbG9yUGl4ZWwgPSBwaXhlbFBhaW50ZXIoaW1hZ2UsIC4uLmZpbGxDb2xvciwgc3RhcnRDb2xvciwgYWxwaGEpOwogICAgY29uc3QgbWF0Y2hTdGFydENvbG9yID0gY29sb3JNYXRjaGVyKGltYWdlLCAuLi5zdGFydENvbG9yKTsKICAgIGNvbnN0IG1hdGNoRmlsbENvbG9yID0gY29sb3JNYXRjaGVyKGltYWdlLCAuLi5bLi4uZmlsbENvbG9yLCAyNTVdKTsKCiAgICAvLyBjaGVjayBpZiB3ZSdyZSB0cnlpbmcgdG8gZmlsbCB3aXRoIHRoZSBzYW1lIGNvbG91ciwgaWYgc28sIHN0b3AKICAgIGlmIChtYXRjaEZpbGxDb2xvcigoZmxvb3JZICogd2lkdGggKyBmbG9vclgpICogUElYRUwpKSB7CiAgICAgIHJldHVybiBpbWFnZTsKICAgIH0KCiAgICB3aGlsZSAocGl4ZWxTdGFjay5sZW5ndGgpIHsKICAgICAgY29uc3QgbmV3UG9zID0gcGl4ZWxTdGFjay5wb3AoKTsKICAgICAgY29uc3QgeCA9IG5ld1Bvc1swXTsKICAgICAgbGV0IHkgPSBuZXdQb3NbMV07CgogICAgICBsZXQgcGl4ZWxQb3MgPSAoeSAqIHdpZHRoICsgeCkgKiBQSVhFTDsKCiAgICAgIHdoaWxlICh5LS0gPj0gMCAmJiBtYXRjaFN0YXJ0Q29sb3IocGl4ZWxQb3MpKSB7CiAgICAgICAgcGl4ZWxQb3MgLT0gd2lkdGggKiBQSVhFTDsKICAgICAgfQogICAgICBwaXhlbFBvcyArPSB3aWR0aCAqIFBJWEVMOwoKICAgICAgKyt5OwoKICAgICAgbGV0IHJlYWNoTGVmdCA9IGZhbHNlOwogICAgICBsZXQgcmVhY2hSaWdodCA9IGZhbHNlOwoKICAgICAgd2hpbGUgKHkrKyA8IGhlaWdodCAtIDEgJiYgbWF0Y2hTdGFydENvbG9yKHBpeGVsUG9zKSkgewogICAgICAgIGNvbG9yUGl4ZWwocGl4ZWxQb3MpOwoKICAgICAgICBpZiAoeCA+IDApIHsKICAgICAgICAgIGlmIChtYXRjaFN0YXJ0Q29sb3IocGl4ZWxQb3MgLSBQSVhFTCkpIHsKICAgICAgICAgICAgaWYgKCFyZWFjaExlZnQpIHsKICAgICAgICAgICAgICBwaXhlbFN0YWNrLnB1c2goW3ggLSAxLCB5XSk7CiAgICAgICAgICAgICAgcmVhY2hMZWZ0ID0gdHJ1ZTsKICAgICAgICAgICAgfQogICAgICAgICAgfSBlbHNlIGlmIChyZWFjaExlZnQpIHsKICAgICAgICAgICAgcmVhY2hMZWZ0ID0gZmFsc2U7CiAgICAgICAgICB9CiAgICAgICAgfQoKICAgICAgICBpZiAoeCA8IHdpZHRoIC0gMSkgewogICAgICAgICAgaWYgKG1hdGNoU3RhcnRDb2xvcihwaXhlbFBvcyArIFBJWEVMKSkgewogICAgICAgICAgICBpZiAoIXJlYWNoUmlnaHQpIHsKICAgICAgICAgICAgICBwaXhlbFN0YWNrLnB1c2goW3ggKyAxLCB5XSk7CiAgICAgICAgICAgICAgcmVhY2hSaWdodCA9IHRydWU7CiAgICAgICAgICAgIH0KICAgICAgICAgIH0gZWxzZSBpZiAocmVhY2hSaWdodCkgewogICAgICAgICAgICByZWFjaFJpZ2h0ID0gZmFsc2U7CiAgICAgICAgICB9CiAgICAgICAgfQoKICAgICAgICBwaXhlbFBvcyArPSB3aWR0aCAqIFBJWEVMOwogICAgICB9CiAgICB9CgogICAgcmV0dXJuIGltYWdlOwogIH07CgogIGNvbnN0IG9uTWVzc2FnZSA9ICh7IGRhdGEgfSkgPT4gewogICAgY29uc3QgcmVzdWx0ID0gZmxvb2RGaWxsKGRhdGEpOwogICAgZ2xvYmFsVGhpcy5wb3N0TWVzc2FnZSh7IHR5cGU6ICdmaWxsLXJlc3VsdCcsIHJlc3VsdCB9LCBbcmVzdWx0LmJ1ZmZlcl0pOwogIH07CgogIGdsb2JhbFRoaXMuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIG9uTWVzc2FnZSk7Cgp9KSgpOwovLyMgc291cmNlTWFwcGluZ1VSTD13b3JrZXIuanMubWFwCgo=', null, false);
/* eslint-enable */

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

// colour indices per pixel

const lineDistance = (x1, y1, x2, y2) => {
  // calculate euclidean distance between (x1, y1) and (x2, y2)
  const xs = (x2 - x1) ** 2;
  const ys = (y2 - y1) ** 2;
  return Math.sqrt(xs + ys);
};
/* eslint-enable no-param-reassign */

const pointerEventHandler = (handler) => (event) => {
  if (!event.isPrimary) {
    return;
  }

  if (event.cancelable) {
    event.preventDefault();
  }

  handler(event);
};

const setupPointerEvents = ({
  canvas,
  move,
  down,
  up,
}) => {
  const moveListener = pointerEventHandler(move);
  const downListener = pointerEventHandler(down);
  const upListener = pointerEventHandler(up);

  canvas.addEventListener('pointermove', moveListener);
  canvas.addEventListener('pointerdown', downListener);
  document.addEventListener('pointerup', upListener);

  return {
    removePointerEventListeners: () => {
      canvas.removeEventListener('pointermove', moveListener);
      canvas.removeEventListener('pointerdown', downListener);
      document.removeEventListener('pointerup', upListener);
    },
  };
};

// eslint-disable-next-line import/no-unresolved

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

    this.smoothing = initialSmoothingFactor;
    this.thickness = initialThickness;
    this.targetThickness = this.thickness;
    this.weightInternal = this.thickness;
    this.maxWeight = this.thickness + weightSpread;

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

  setupFill() {
    this.fillWorker = new WorkerFactory();
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

exports.Atrament = Atrament;
