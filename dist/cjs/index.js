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

var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgLy8gY29sb3VyIGluZGljZXMgcGVyIHBpeGVsCiAgY29uc3QgUiA9IDA7CiAgY29uc3QgRyA9IDE7CiAgY29uc3QgQiA9IDI7CiAgY29uc3QgQSA9IDM7CgogIGNvbnN0IFBJWEVMID0gNDsKICBjb25zdCBUUkFOU1BBUkVOVCA9IDA7CiAgY29uc3QgT1BBUVVFID0gMjU1OwoKICBjb25zdCBoZXhUb1JnYiA9IChoZXhDb2xvcikgPT4gewogICAgLy8gU2luY2UgaW5wdXQgdHlwZSBjb2xvciBwcm92aWRlcyBoZXggYW5kIEltYWdlRGF0YSBhY2NlcHRzIFJHQiBuZWVkIHRvIHRyYW5zZm9ybQogICAgY29uc3QgbSA9IGhleENvbG9yLm1hdGNoKC9eIz8oW1xkYS1mXXsyfSkoW1xkYS1mXXsyfSkoW1xkYS1mXXsyfSkkL2kpOwogICAgcmV0dXJuIFsKICAgICAgcGFyc2VJbnQobVsxXSwgMTYpLAogICAgICBwYXJzZUludChtWzJdLCAxNiksCiAgICAgIHBhcnNlSW50KG1bM10sIDE2KSwKICAgIF07CiAgfTsKCiAgLy8gUGl4ZWwgY29sb3IgZXF1YWxzIGNvbXAgY29sb3I/CiAgY29uc3QgY29sb3JNYXRjaGVyID0gKGRhdGEsIGNvbXBSLCBjb21wRywgY29tcEIsIGNvbXBBKSA9PiAocGl4ZWxQb3MpID0+ICgKICAgIGRhdGFbcGl4ZWxQb3MgKyBSXSA9PT0gY29tcFIKICAgICYmIGRhdGFbcGl4ZWxQb3MgKyBHXSA9PT0gY29tcEcKICAgICYmIGRhdGFbcGl4ZWxQb3MgKyBCXSA9PT0gY29tcEIKICAgICYmIGRhdGFbcGl4ZWxQb3MgKyBBXSA9PT0gY29tcEEKICApOwoKICBjb25zdCBjb2xvck1hdGNoZXJJZ25vcmVBbHBoYSA9IChkYXRhLCBjb21wUiwgY29tcEcsIGNvbXBCLCBjb21wQSkgPT4gKHBpeGVsUG9zKSA9PiB7CiAgICBjb25zdCBhbHBoYSA9IGRhdGFbcGl4ZWxQb3MgKyBBXTsKICAgIGlmIChhbHBoYSAhPT0gVFJBTlNQQVJFTlQgJiYgYWxwaGEgIT09IE9QQVFVRSkgewogICAgICByZXR1cm4gdHJ1ZTsKICAgIH0KCiAgICByZXR1cm4gKAogICAgICBkYXRhW3BpeGVsUG9zICsgUl0gPT09IGNvbXBSCiAgICAgICYmIGRhdGFbcGl4ZWxQb3MgKyBHXSA9PT0gY29tcEcKICAgICAgJiYgZGF0YVtwaXhlbFBvcyArIEJdID09PSBjb21wQgogICAgICAmJiBkYXRhW3BpeGVsUG9zICsgQV0gPT09IGNvbXBBCiAgICApOwogIH07CgogIC8qIGVzbGludC1kaXNhYmxlIG5vLXBhcmFtLXJlYXNzaWduICovCiAgY29uc3QgcGl4ZWxQYWludGVyID0gKGRhdGEsIGZpbGxSLCBmaWxsRywgZmlsbEIsIGZpbGxBKSA9PiAocGl4ZWxQb3MpID0+IHsKICAgIC8vIFVwZGF0ZSBmaWxsIGNvbG9yIGluIG1hdHJpeAogICAgZGF0YVtwaXhlbFBvcyArIFJdID0gZmlsbFI7CiAgICBkYXRhW3BpeGVsUG9zICsgR10gPSBmaWxsRzsKICAgIGRhdGFbcGl4ZWxQb3MgKyBCXSA9IGZpbGxCOwogICAgZGF0YVtwaXhlbFBvcyArIEFdID0gZmlsbEE7CiAgfTsKCiAgY29uc3QgcGl4ZWxQYWludGVyTWl4QWxwaGEgPSAoZGF0YSwgZmlsbFIsIGZpbGxHLCBmaWxsQiwgZmlsbEEpID0+IChwaXhlbFBvcykgPT4gewogICAgY29uc3Qgb2xkQWxwaGEgPSBkYXRhW3BpeGVsUG9zICsgQV0gPT09IE9QQVFVRSA/IFRSQU5TUEFSRU5UIDogZGF0YVtwaXhlbFBvcyArIEFdIC8gT1BBUVVFOwogICAgY29uc3QgbWl4QWxwaGEgPSAxIC0gb2xkQWxwaGE7CgogICAgLy8gVXBkYXRlIGZpbGwgY29sb3IgaW4gbWF0cml4CiAgICBkYXRhW3BpeGVsUG9zICsgUl0gPSBNYXRoLmZsb29yKG9sZEFscGhhICogZGF0YVtwaXhlbFBvcyArIFJdICsgbWl4QWxwaGEgKiBmaWxsUik7CiAgICBkYXRhW3BpeGVsUG9zICsgR10gPSBNYXRoLmZsb29yKG9sZEFscGhhICogZGF0YVtwaXhlbFBvcyArIEddICsgbWl4QWxwaGEgKiBmaWxsRyk7CiAgICBkYXRhW3BpeGVsUG9zICsgQl0gPSBNYXRoLmZsb29yKG9sZEFscGhhICogZGF0YVtwaXhlbFBvcyArIEJdICsgbWl4QWxwaGEgKiBmaWxsQik7CiAgICBkYXRhW3BpeGVsUG9zICsgQV0gPSBmaWxsQTsKICB9OwogIC8qIGVzbGludC1lbmFibGUgbm8tcGFyYW0tcmVhc3NpZ24gKi8KCiAgY29uc3QgZmxvb2RGaWxsID0gKHsKICAgIGltYWdlLAogICAgd2lkdGgsCiAgICBoZWlnaHQsCiAgICBjb2xvciwKICAgIGdsb2JhbEFscGhhLAogICAgc3RhcnRYLAogICAgc3RhcnRZLAogICAgc3RhcnRDb2xvciwKICB9KSA9PiB7CiAgICBjb25zdCByb3cgPSB3aWR0aCAqIFBJWEVMOwogICAgLy8gbWFrZSBzdXJlIHN0YXJ0IGNvb3JkaW5hdGVzIGFyZSBpbnRlZ2VycwogICAgY29uc3Qgc3RhcnRYQ29vcmQgPSBNYXRoLmZsb29yKHN0YXJ0WCk7CiAgICBjb25zdCBzdGFydFlDb29yZCA9IE1hdGguZmxvb3Ioc3RhcnRZKTsKICAgIC8vIGhleCBuZWVkcyB0byBiZSB0cmFzZm9ybWVkIHRvIHJnYiBzaW5jZSBJbWFnZURhdGEgdXNlcyBSR0IKICAgIGNvbnN0IGZpbGxDb2xvciA9IGhleFRvUmdiKGNvbG9yKTsKICAgIC8vIGVuc3VyZSBhbHBoYSBpcyBhbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBvZiAwLTI1NQogICAgY29uc3QgZmlsbEFscGhhID0gTWF0aC5mbG9vcihNYXRoLm1heCgwLCBNYXRoLm1pbihnbG9iYWxBbHBoYSAqIE9QQVFVRSwgT1BBUVVFKSkpOwogICAgLy8gd2UgbmVlZCBkaWZmZXJlbnQgYmVoYXZpb3VyIGluIGNhc2Ugd2UncmUgZmlsbGluZyBhIG5vbi1vcGFxdWUgYXJlYQogICAgY29uc3QgZmlsbGluZ05vbk9wYXF1ZSA9IHN0YXJ0Q29sb3JbQV0gIT09IE9QQVFVRTsKICAgIC8vIG91ciBwaXhlbCBwYWludGVyIHNob3VsZCBvbmx5IG1peCBhbHBoYSBpZiB3ZSdyZSBzdGFydGluZyBpbiBhIG5vbi1vcGFxdWUgYXJlYQogICAgY29uc3QgcGl4ZWxQYWludGVyT2ZDaG9pY2UgPSBmaWxsaW5nTm9uT3BhcXVlID8gcGl4ZWxQYWludGVyTWl4QWxwaGEgOiBwaXhlbFBhaW50ZXI7CiAgICBjb25zdCBwYWludFBpeGVsID0gcGl4ZWxQYWludGVyT2ZDaG9pY2UoaW1hZ2UsIC4uLmZpbGxDb2xvciwgZmlsbEFscGhhKTsKICAgIC8vIHdoZW4gbG9va2luZyBmb3IgdGhlIHNwYW4gc3RhcnQsIHdlIGlnbm9yZSB0aGUgYWxwaGEgdmFsdWUgaWYgZmlsbGluZyBhIG5vbi1vcGFxdWUgYXJlYQogICAgLy8gdGhpcyBlbnN1cmVzIHRoYXQgd2UnbGwgbWl4IHRoZSBmaWxsIGludG8gYW50aWFsaWFzZWQgZWRnZXMKICAgIGNvbnN0IGNvbG9yTWF0Y2hlclNwYW5TdGFydCA9IGZpbGxpbmdOb25PcGFxdWUgPyBjb2xvck1hdGNoZXJJZ25vcmVBbHBoYSA6IGNvbG9yTWF0Y2hlcjsKICAgIGNvbnN0IG1hdGNoU3RhcnRDb2xvclNwYW5TdGFydCA9IGNvbG9yTWF0Y2hlclNwYW5TdGFydChpbWFnZSwgLi4uc3RhcnRDb2xvcik7CiAgICAvLyBmb3IgYWxsIG90aGVyIGNhc2VzLCB3ZSBsb29rIGZvciB0aGUgc3RhcnQgY29sb3VyIGV4YWN0bHkKICAgIGNvbnN0IG1hdGNoU3RhcnRDb2xvciA9IGNvbG9yTWF0Y2hlcklnbm9yZUFscGhhKGltYWdlLCAuLi5zdGFydENvbG9yKTsKCiAgICAvLyBjaGVjayBpZiB3ZSdyZSB0cnlpbmcgdG8gZmlsbCB3aXRoIHRoZSBzYW1lIGNvbG91ciwgaWYgc28sIHN0b3AKICAgIGNvbnN0IG1hdGNoRmlsbENvbG9yID0gY29sb3JNYXRjaGVyKGltYWdlLCAuLi5bLi4uZmlsbENvbG9yLCBPUEFRVUVdKTsKICAgIGlmIChtYXRjaEZpbGxDb2xvcigoc3RhcnRZQ29vcmQgKiB3aWR0aCArIHN0YXJ0WENvb3JkKSAqIFBJWEVMKSkgewogICAgICByZXR1cm4gaW1hZ2U7CiAgICB9CiAgICAvLyBiZWdpbiB3aXRoIG91ciBzdGFydCBwaXhlbAogICAgY29uc3QgcGl4ZWxTdGFjayA9IFtbc3RhcnRYQ29vcmQsIHN0YXJ0WUNvb3JkXV07CiAgICB3aGlsZSAocGl4ZWxTdGFjay5sZW5ndGgpIHsKICAgICAgY29uc3QgW3gsIHldID0gcGl4ZWxTdGFjay5wb3AoKTsKICAgICAgLy8gY29sdW1uIHBvc2l0aW9uIGlzIGluIGNhcnRlc2lhbiBzcGFjZSAoeCx5KQogICAgICBsZXQgY29sdW1uUG9zaXRpb24gPSB5OwogICAgICAvLyBwaXhlbCBwb3NpdGlvbiBpcyBpbiAxRCBzcGFjZSAodGhlIHJhdyBpbWFnZSBkYXRhIFVJbnQ4Q2xhbXBlZEFycmF5KQogICAgICBsZXQgcGl4ZWxQb3MgPSAoY29sdW1uUG9zaXRpb24gKiB3aWR0aCArIHgpICogUElYRUw7CiAgICAgIC8vIHN0YXJ0IG1vdmluZyBkaXJlY3RseSB1cCBmcm9tIG91ciBzdGFydCBwb3NpdGlvbgogICAgICAvLyB1bnRpbCB3ZSBmaW5kIGEgZGlmZmVyZW50IGNvbG91ciB0byB0aGUgc3RhcnQgY29sb3VyCiAgICAgIC8vIHRoaXMgaXMgdGhlIGJlZ2lubmluZyBvZiBvdXIgc3BhbgogICAgICB3aGlsZSAoY29sdW1uUG9zaXRpb24tLSA+PSAwICYmIG1hdGNoU3RhcnRDb2xvclNwYW5TdGFydChwaXhlbFBvcykpIHsKICAgICAgICBwaXhlbFBvcyAtPSByb3c7CiAgICAgIH0KICAgICAgLy8gbW92ZSBvbmUgcm93IGRvd24gKHRvcG1vc3QgcGl4ZWwgb2YgZmlsbGFibGUgYXJlYSkKICAgICAgcGl4ZWxQb3MgKz0gcm93OwoKICAgICAgbGV0IHJlYWNoTGVmdCA9IGZhbHNlOwogICAgICBsZXQgcmVhY2hSaWdodCA9IGZhbHNlOwogICAgICAvLyBmb3IgZWFjaCByb3csIGNoZWNrIGlmIHRoZSBmaXJzdCBwaXhlbCBzdGlsbCBoYXMgdGhlIHN0YXJ0IGNvbG91cgogICAgICAvLyBpZiBpdCBkb2VzLCBwYWludCBpdCBhbmQgcHVzaCBzdXJyb3VuZGluZyBwaXhlbHMgdG8gdGhlIHN0YWNrIG9mIHBpeGVscyB0byBjaGVjawogICAgICB3aGlsZSAoKytjb2x1bW5Qb3NpdGlvbiA8IGhlaWdodCAtIDEgJiYgbWF0Y2hTdGFydENvbG9yKHBpeGVsUG9zKSkgewogICAgICAgIHBhaW50UGl4ZWwocGl4ZWxQb3MpOwogICAgICAgIC8vIGNoZWNrIHRoZSBwaXhlbCB0byB0aGUgbGVmdAogICAgICAgIGlmICh4ID4gMCkgewogICAgICAgICAgaWYgKG1hdGNoU3RhcnRDb2xvcihwaXhlbFBvcyAtIFBJWEVMKSkgewogICAgICAgICAgICBpZiAoIXJlYWNoTGVmdCkgewogICAgICAgICAgICAgIHBpeGVsU3RhY2sucHVzaChbeCAtIDEsIGNvbHVtblBvc2l0aW9uXSk7CiAgICAgICAgICAgICAgcmVhY2hMZWZ0ID0gdHJ1ZTsKICAgICAgICAgICAgfQogICAgICAgICAgfSBlbHNlIGlmIChyZWFjaExlZnQpIHsKICAgICAgICAgICAgcmVhY2hMZWZ0ID0gZmFsc2U7CiAgICAgICAgICB9CiAgICAgICAgfQogICAgICAgIC8vIGNoZWNrIHRoZSBwaXhlbCB0byB0aGUgcmlnaHQKICAgICAgICBpZiAoeCA8IHdpZHRoIC0gMSkgewogICAgICAgICAgaWYgKG1hdGNoU3RhcnRDb2xvcihwaXhlbFBvcyArIFBJWEVMKSkgewogICAgICAgICAgICBpZiAoIXJlYWNoUmlnaHQpIHsKICAgICAgICAgICAgICBwaXhlbFN0YWNrLnB1c2goW3ggKyAxLCBjb2x1bW5Qb3NpdGlvbl0pOwogICAgICAgICAgICAgIHJlYWNoUmlnaHQgPSB0cnVlOwogICAgICAgICAgICB9CiAgICAgICAgICB9IGVsc2UgaWYgKHJlYWNoUmlnaHQpIHsKICAgICAgICAgICAgcmVhY2hSaWdodCA9IGZhbHNlOwogICAgICAgICAgfQogICAgICAgIH0KICAgICAgICAvLyBtb3ZlIHRvIHRoZSBuZXh0IHJvdwogICAgICAgIHBpeGVsUG9zICs9IHJvdzsKICAgICAgfQogICAgfQoKICAgIHJldHVybiBpbWFnZTsKICB9OwoKICBjb25zdCBvbk1lc3NhZ2UgPSAoeyBkYXRhIH0pID0+IHsKICAgIGNvbnN0IHJlc3VsdCA9IGZsb29kRmlsbChkYXRhKTsKICAgIGdsb2JhbFRoaXMucG9zdE1lc3NhZ2UoeyB0eXBlOiAnZmlsbC1yZXN1bHQnLCByZXN1bHQgfSwgW3Jlc3VsdC5idWZmZXJdKTsKICB9OwoKICBnbG9iYWxUaGlzLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBvbk1lc3NhZ2UpOwoKfSkoKTsKLy8jIHNvdXJjZU1hcHBpbmdVUkw9d29ya2VyLmpzLm1hcAoK', null, false);
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
