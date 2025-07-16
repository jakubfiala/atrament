# v5.0.0

## Breaking API changes

- Atrament does not include the fill Worker within the main bundle anymore. This is so applications that don't require fill mode
benefit from an approx. 60% smaller import size. The fill module can be imported separately and injected into Atrament via the constructor.
- Atrament now maps the pointer coordinates (pixels relative to the `<canvas>` element) to unitless fractions of the intrinsic canvas size. This eliminates the need to consider things like `devicePixelRatio`, since the coordinates are independent of screen pixel density. The `resolution` config option has been removed.

## Drawing experience changes

- pressure sensitivity has been reworked to have much more impact on the stroke, and new config options have been added to tweak the pressure mapping. The options are `pressureLow`, `pressureHigh` and `pressureSmoothing` - see README for more info

## Other changes

- there is now a `secondaryEraser` config option, which allows the secondary (e.g. right) mouse button to be used as an instant eraser without changing modes
- recorded strokes now also include pressure information so they can be reproduced correctly
- `strokestart` and `strokeend` now also return x/y coordinates
- a new config option `ignoreModifiers` makes Atrament ignore pointer events if any modifier keys are pressed. This is useful if you'd like to use pointer events with modifiers for other things than drawing (e.g. Ctrl+Click+Drag to pan around the canvas).


# v4.0.0

## Breaking API changes

- Atrament now only supports evergreen browsers (Firefox, Chrome and Chromium-based browsers)
  and Safari 15 or above. If your application must support older browsers, please use version 3.
- the `Atrament` class is now a default export
- the `mode` setter now only accepts symbols exported from the library (e.g. `MODE_DRAW`). If anything else is passed, an error is thrown.
- the stroke object now stores an array of `segments`, instead of `points`. Each segment then contains a `point`. This should clarify the data model and help avoid repetitive code such as `stroke.points.forEach((point) => point.point)`.
- because of the above, the `pointdrawn` event has been renamed to `segmentdrawn`
- the `toImage()` method has been removed - please use `canvas.toDataURL()` to achieve the same effect
- the `isDirty()` method has been replaced by the `dirty` getter, making it more consistent with the rest of the API
- the `Atrament` class now uses private fields and methods. A number of undocumented fields+methods are now not accessible from the outside.

## Drawing experience changes

- if `adaptiveStroke` is enabled (default), Atrament now responds to the pointer's pressure by changing the stroke thickness. This is useful when using pressure-sensitive input methods such as the Apple Pencil.
- stroke segments are now drawn as individual paths. This means strokes tend to start thin, then thicken and get thinner again towards the end, which is closer to the behaviour of an ink pen.
- strokes are always at least as thick as the `weight` setting in pixels, leading to a more consistent drawing feel especially when drawing finer details.

## Other changes

- Atrament is now built with Rollup and the code is not transpiled (other than separate ES Module and CommonJS bundles).
- Atrament now uses [Pointer Events](https://w3c.github.io/pointerevents/) instead of the specific mouse+touch event handlers. This allows us to increase drawing precision, solve a number of bugs and reduce code complexity.
- Fill mode is now implemented with a Web Worker bundled together with the library. This stops the fill algorithm from blocking the main thread.
- Error messages are now prefixed with `atrament: `
