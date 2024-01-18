# v4.0.0

## Breaking changes

- Atrament now only supports evergreen browsers ((Firefox, Chrome and Chromium-based browsers)
  and Safari 15 or above. If your application must support older browsers, please use version 3.
- the `Atrament` class is now a default export
- the `mode` setter now only accepts symbols exported from the library (e.g. `MODE_DRAW`). If anything else is passed, an error is thrown.
- the `toImage()` method has been removed - please use `canvas.toDataURL()` to achieve the same effect
- the `isDirty()` method has been replaced by the `dirty` getter, making it more consistent with the rest of the API
- the `Atrament` class now uses private fields and methods. A number of undocumented fields+methods are now not accessible from the outside.

## Other changes

- Atrament is now built with Rollup and the code is not transpiled (other than separate ES Module and CommonJS bundles).
- Atrament now uses [Pointer Events](https://w3c.github.io/pointerevents/) instead of the specific mouse+touch event handlers. This allows us to increase drawing precision, solve a number of bugs and reduce code complexity.
- Fill mode is now implemented with a Web Worker bundled together with the library. This stops the fill algorithm from blocking the main thread.
- Error messages are now prefixed with `atrament: `
