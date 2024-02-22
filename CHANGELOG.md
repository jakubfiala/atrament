# v4.0.0

## Breaking API changes

- Atrament now only supports evergreen browsers ((Firefox, Chrome and Chromium-based browsers)
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
