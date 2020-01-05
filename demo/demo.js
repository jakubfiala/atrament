// first, we need to set up the canvas
const canvas = document.getElementById('sketcher');
canvas.style.cursor = 'crosshair';
// instantiate Atrament
const atrament = new Atrament(canvas, {
  width: canvas.offsetWidth,
  height: canvas.offsetHeight,
});


// a little helper tool for logging events
const eventsLog = [];
const logElement = document.getElementById('events');
const log = (...messages) => {
  if (eventsLog.push(messages.map(m => JSON.stringify(m)).join()) > 5) {
    eventsLog.shift();
  }

  logElement.innerText = eventsLog.join('\n');
  console.log(...messages);
};

// we only display the Clear button if canvas is dirty
const clearButton = document.getElementById('clear');
atrament.addEventListener('dirty', () => {
  log('event: dirty');
  clearButton.style.display = atrament.isDirty ? 'inline-block' : 'none';
});

atrament.addEventListener('clean', () => {
  log('event: clean');
});

atrament.addEventListener('fillstart', ({ x, y }) => {
  canvas.style.cursor = 'wait';
  log(`event: fillstart x: ${x} y: ${y}`);
});

atrament.addEventListener('fillend', () => {
  canvas.style.cursor = 'crosshair';
  log('event: fillend');
});

atrament.addEventListener('strokestart', () => log('event: strokestart'));
atrament.addEventListener('strokeend', () => log('event: strokeend'));

atrament.recordStrokes = true;
atrament.addEventListener('strokerecorded', ({ stroke }) => {
  log(`event: strokerecorded - ${stroke.points.length} points`);
});

// this object was obtained from 'strokerecorded'
const testStroke = { "points": [{ "x": 419, "y": 161 }, { "x": 410, "y": 177 }, { "x": 390, "y": 240 }, { "x": 386, "y": 277 }, { "x": 386, "y": 318 }, { "x": 386, "y": 350 }, { "x": 386, "y": 365 }, { "x": 388, "y": 378 }, { "x": 392, "y": 384 }, { "x": 426, "y": 404 }, { "x": 456, "y": 411 }, { "x": 489, "y": 411 }, { "x": 539, "y": 411 }, { "x": 566, "y": 406 }, { "x": 586, "y": 390 }, { "x": 603, "y": 372 }, { "x": 614, "y": 355 }, { "x": 623, "y": 329 }, { "x": 628, "y": 310 }, { "x": 630, "y": 293 }, { "x": 630, "y": 276 }, { "x": 630, "y": 257 }, { "x": 630, "y": 250 }, { "x": 630, "y": 244 }, { "x": 630, "y": 240 }, { "x": 629, "y": 239 }, { "x": 628, "y": 238 }, { "x": 627, "y": 238 }, { "x": 627, "y": 238 }, { "x": 627, "y": 238 }], "weight": 2, "smoothing": 0.85, "color": "#000000", "adaptiveStroke": true, "mode": "draw" };

const simButton = document.getElementById('simulate');

// utility to add delay to drawing steps
const sleep = async time => new Promise((r) => setTimeout(r, time));

simButton.addEventListener('click', async e => {
  e.preventDefault();

  // set drawing options
  atrament.weight = testStroke.weight;
  atrament.mode = testStroke.mode;
  atrament.smoothing = testStroke.smoothing;
  atrament.color = testStroke.color;
  atrament.adaptiveStroke = testStroke.adaptiveStroke;

  // don't want to modify original data
  const points = testStroke.points.slice();

  const firstPoint = points.shift();
  atrament.beginStroke(firstPoint.x, firstPoint.y);

  let prevPoint = firstPoint;
  while (points.length > 0) {
    const point = points.shift();

    // the `draw` method accepts the current real coordinates
    // (i. e. actual cursor position), and the previous processed (filtered)
    // position. It returns an object with the current processed position.
    const { x, y } = atrament.draw(point.x, point.y, prevPoint.x, prevPoint.y);

    // the processed position is the one where the line is actually drawn to
    // so we have to store it and pass it to `draw` in the next step
    prevPoint = { x, y };

    await sleep(50);
  }

  atrament.endStroke(prevPoint.x, prevPoint.y);
});
