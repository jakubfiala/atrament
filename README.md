# Atrament

**A small JS library for beautiful drawing and handwriting on the HTML Canvas**

---

![](demo/img/muchotravka.png)

Atrament is a library for drawing and handwriting on the HTML canvas.
Its goal is for drawing to feel natural and comfortable, and the result to be smooth and pleasing.
Atrament does not store the stroke paths itself - instead, it draws directly onto the canvas bitmap,
just like an ink pen onto a piece of paper ("atrament" means ink in Slovak and Polish).
This makes it suitable for certain applications, and not quite ideal for others - see Alternatives.

⚠️ **Note:** From version 4, Atrament supports evergeen browsers (Firefox, Chrome and Chromium-based browsers)
and Safari 15 or above. If your application must support older browsers, please use version 3. You can view the v3 documentation [here](https://github.com/jakubfiala/atrament/blob/ded0a8289c7b1ff7a79dbad36893986da09f37fc/README.md).

**Features:**

- Draw/Fill/Erase modes
- Adjustable adaptive smoothing
- Events tracking the drawing - this allows the app to "replay" or reconstruct the drawing, e.g. for undo functionality
- Adjustable line thickness and colour

[Here's a basic demo.](https://fiala.space/atrament/demo/)

Enjoy!

- [Atrament](#atrament)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Options \& config](#options--config)
  - [Fill mode](#fill-mode)
  - [Data model](#data-model)
  - [High DPI screens](#high-dpi-screens)
  - [Events](#events)
    - [Dirty/clean](#dirtyclean)
    - [Stroke start/end](#stroke-startend)
    - [Fill start/end](#fill-startend)
    - [Stroke recording](#stroke-recording)
  - [Programmatic drawing](#programmatic-drawing)
    - [Implementing Undo/Redo](#implementing-undoredo)
  - [Development](#development)
    - [Running the demo locally](#running-the-demo-locally)

## Installation

If you're using a tool like `rollup` or `webpack` to bundle your code, you can install it using npm.

- install atrament as a dependency using `npm install --save atrament`.
- You can access the Atrament class using `import { Atrament } from 'atrament';`

## Usage

- create a `<canvas>` tag, e.g.:

```html
<canvas id="sketchpad" width="500" height="500"></canvas>
```

- in your JavaScript, create an `Atrament` instance passing it your canvas object:

```js
import Atrament from 'atrament';

const canvas = document.querySelector('#sketchpad');
const sketchpad = new Atrament(canvas);
```

- you can also pass the width, height, resolution and default colour to the constructor (see [note on high DPI screens](#high-dpi-screens))

```js
const sketchpad = new Atrament(canvas, {
  width: 500,
  height: 500,
  resolution: 2, // the intrinsic canvas size will be 2*500 x 2*500
  color: 'orange',
});
```

- that's it, happy drawing!

## Options & config

- clear the canvas:

```js
sketchpad.clear();
```

- change the line thickness:

```js
sketchpad.weight = 20; //in pixels
```

- change the color:

```js
sketchpad.color = '#ff485e'; //just like CSS
```

- toggle between modes (**Note:** for Fill mode, you must also set the `fillWorker` config option in the constructor. See [next section](#fill-mode))

```js
import { MODE_DRAW, MODE_ERASE, MODE_FILL, MODE_DISABLED } from 'atrament';

sketchpad.mode = MODE_DRAW; // default
sketchpad.mode = MODE_ERASE; // eraser tool
sketchpad.mode = MODE_FILL; // click to fill area (see next section for more info)
sketchpad.mode = MODE_DISABLED; // no modification to the canvas (will still fire stroke events)
```

- tweak smoothing - higher values make the drawings look smoother, lower values make drawing feel a bit more responsive. Set to `0.85` by default.

```js
sketchpad.smoothing = 1.3;
```

- toggle adaptive stroke, i.e. line width changing based on drawing speed and stroke progress. This simulates the variation in ink discharge of a physical pen. `true` by default.

```js
sketchpad.adaptiveStroke = false;
```

- set pressure sensitivity. Note: if your input device sends pressure data, adaptive stroke will have no effect, since its purpose is to emulate changing pen pressure

```js
// the lower bound of the pressure scale:
// at pressure = 0 the stroke width will be multiplied by 0
sketchpad.pressureLow = 0;
// the lower bound of the pressure scale:
// at pressure = 1 the stroke width will be multiplied by 2
sketchpad.pressureHigh = 2;
// at pressure = 0.5 the stroke width remains the same

// Amount of low-pass filtering applied to the pressure values.
// more smoothing might help remove artifacts at the end of strokes
// where the pressure-sensitive stylus has very low pressure.
// Range: 0-1 Default: 0.3
sketchpad.pressureSmoothing = 0.4;
```

- secondary mouse/touchpad button clicks can be used as a quick eraser. `false` by default.

```js
sketchpad.secondaryEraser = true;
```

- record stroke data (enables the `strokerecorded` event). `false` by default.

```js
sketchpad.recordStrokes = true;
```

## Fill mode

From version 5.0.0, Atrament does not bundle the fill Worker within the main bundle. This is so applications that don't require fill mode
benefit from an approx. 60% smaller import size. The fill module can be imported separately and injected into Atrament via the constructor:

```js
import Atrament from 'atrament';
import fill from 'atrament/fill';

const sketchpad = new Atrament({ fill });
```

## Data model

- Atrament models its output as a set of independent _strokes_. Only one stroke can be drawn at a time.
- Each stroke consists of a list of _segments_, which correspond to all the pointer positions recorded during drawing.
- Each segment consists of a _point_ which contains `x` and `y` coordinates, a `time` which is the number of milliseconds since the stroke began, until the segment was drawn, and a `pressure` value (0.-1.) which is either the recorded stylus pressure or 0.5 if no pressure data is available.
- Each stroke also contains information about the drawing settings at the time of drawing (see Events > Stroke recording).


## High DPI screens

To make drawings look sharp on high DPI screens, Atrament scales its drawing context by `window.devicePixelRatio` since v4.0.0. This means when you set a custom `width` or `height`, you should also multiply the CSS pixel values by `devicePixelRatio`. The values accepted by `draw()` and included in stroke events are always in CSS pixels.

As of Atrament v4.5.0, the `resolution` config option allows overriding the DPR scaling - this is useful if, for instance, you'd like to export the image at a higher resolution than displayed.

## Events

### Dirty/clean

These events fire when the canvas is first drawn on, and when it's cleared.
The state is stored in the `dirty` property.

```js
sketchpad.addEventListener('dirty', () => console.info(sketchpad.dirty));
sketchpad.addEventListener('clean', () => console.info(sketchpad.dirty));
```

### Stroke start/end

These events inform that a stroke has started/finished. They also return `x` and `y` properties
denoting where on the canvas the event occurred.

```js
sketchpad.addEventListener('strokestart', () => console.info('strokestart'));
sketchpad.addEventListener('strokeend', () => console.info('strokeend'));
```

### Fill start/end

These only fire in fill mode. The `fillstart` event also contains `x` and `y` properties
denoting the starting point of the fill operation (where the user has clicked).

```js
sketchpad.addEventListener('fillstart', ({ x, y }) =>
  console.info(`fillstart ${x} ${y}`),
);
sketchpad.addEventListener('fillend', () => console.info('fillend'));
```

### Pointer down/up

Sometimes you might want to tweak Atrament's settings as soon as the user begins/ends a stroke,
but before Atrament actually draws anything. The `pointerdown/up` events allow you to do this.
The argument is the `PointerEvent` itself.

```js
sketchpad.addEventListener('pointerdown', (event) => console.info('pointerdown', event));
sketchpad.addEventListener('pointerup', (event) => console.info('pointerup', event));
```

### Stroke recording

The following events only fire if the `recordStrokes` property is set to true.

`strokerecorded` fires at the same time as `strokeend` and contains data necessary for reconstructing the stroke.
`segmentdrawn` fires during stroke recording every time the `draw` method is called. It contains the same data as `strokerecorded`.

```js
sketchpad.addEventListener('strokerecorded', ({ stroke }) =>
  console.info(stroke),
);
/*
{
  segments: [
    {
      point: { x, y },
      time,
      pressure,
    }
  ],
  color,
  weight,
  smoothing,
  adaptiveStroke,
}
*/
sketchpad.addEventListener('segmentdrawn', ({ stroke }) =>
  console.info(stroke),
);
```

## Programmatic drawing

To enable functionality such as undo/redo, stroke post-processing, and SVG export in apps using Atrament, the library
can be configured to record and programmatically draw the strokes.

The first step is to enable `recordStrokes`, and add a listener for the `strokerecorded` event:

```js
atrament.recordStrokes = true;
atrament.addEventListener('strokerecorded', ({ stroke }) => {
  // store `stroke` somewhere
});
```

The stroke can then be reconstructed using methods of the `Atrament` class:

```js
// set drawing options
atrament.mode = stroke.mode;
atrament.weight = stroke.weight;
atrament.smoothing = stroke.smoothing;
atrament.color = stroke.color;
atrament.adaptiveStroke = stroke.adaptiveStroke;

// don't want to modify original data
const segments = stroke.segments.slice();

const firstPoint = segments.shift().point;
// beginStroke moves the "pen" to the given position and starts the path
atrament.beginStroke(firstPoint.x, firstPoint.y);

let prevPoint = firstPoint;
while (segments.length > 0) {
  const segment = segments.shift();

  // the `draw` method accepts the current real coordinates
  // (i. e. actual cursor position), and the previous processed (filtered)
  // position. It returns an object with the current processed position.
  const { x, y } = atrament.draw(segment.point.x, segment.point.y, prevPoint.x, prevPoint.y, segment.pressure);

  // the processed position is the one where the line is actually drawn to
  // so we have to store it and pass it to `draw` in the next step
  prevPoint = { x, y };
}

// endStroke closes the path
atrament.endStroke(prevPoint.x, prevPoint.y);
```

### Implementing Undo/Redo

Atrament does not provide its own undo/redo functionality to keep the scope as small as possible. However, using stroke recording and programmatic drawing,
it is possible to implement undo/redo with a relatively small amount of code. See @nidoro and @feored's example [here](https://github.com/jakubfiala/atrament/issues/71#issuecomment-1214261577).

## Development

To obtain the dependencies, `cd` into the atrament directory and run `npm install`.
You should be able to then build atrament by simply running `npm run build` and rebuild continuously with `npm run watch`.

### Running the demo locally

The demo app is useful for development, and it's set up to use the compiled files in `/dist`. It's a plain HTML website which can be served with any local server.
A good way to develop using the demo is to run `python -m http.server` (with Python 3) in the `/demo` directory. The demo will be served on `localhost:8000`.

## Alternatives

Atrament's philosophy is to provide a **simple** and **small** tool that takes care of everything from pointer events to drawing pixels on screen.
Atrament uses the native Canvas API to draw strokes, instead of computing custom curves. This means it's very lightweight (5.9kB gzipped with fill mode, 2.4kB without)
and pretty much as fast as the browser allows.

This does mean Atrament's rendering quality is limited by the Canvas API. If your application requires higher drawing quality, there are libraries such as
[perfect-freehand](https://github.com/steveruizok/perfect-freehand) which compute their own curves and achieve somewhat more pleasing, higher-fidelity results.
This comes at the expense of size (`perfect-freehand` is almost 2kB gzipped to generate the curve shape, but you need to take care of rendering it, handling pointer interactions, etc.).

For a more fully-featured solution including drawing shapes, graphs, text, built-in Undo/Redo and many other features,
you might want to consider a larger tool such as [excalidraw](https://github.com/excalidraw/excalidraw).
