/* eslint-disable no-unused-vars */
import { Atrament } from '../dist/esm/index.js';

// first, we need to set up the canvas
const canvas = document.getElementById('sketcher');
canvas.style.cursor = 'crosshair';
// instantiate Atrament
const atrament = new Atrament(canvas, {
  width: canvas.offsetWidth,
  height: canvas.offsetHeight,
});

window.atrament = atrament;

// a little helper tool for logging events
const eventsLog = [];
const logElement = document.getElementById('events');
const log = (...messages) => {
  if (eventsLog.push(messages.map((m) => JSON.stringify(m)).join()) > 5) {
    eventsLog.shift();
  }

  logElement.innerText = eventsLog.join('\n');
  // eslint-disable-next-line no-console
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
  log(`event: fillstart x: ${x} y: ${y}`);
});

atrament.addEventListener('fillend', () => {
  log('event: fillend');
});

atrament.addEventListener('strokestart', () => log('event: strokestart'));
atrament.addEventListener('strokeend', () => log('event: strokeend'));

atrament.addEventListener('strokerecorded', ({ stroke }) => {
  log(`event: strokerecorded - ${stroke.points.length} points`);
});

atrament.addEventListener('pointdrawn', () => log('event: pointdrawn'));

const waitUntil = (reference, time) => {
  const timeElapsed = performance.now() - reference;
  const timeToWait = time - timeElapsed;
  return new Promise((resolve) => {
    setTimeout(resolve, timeToWait);
  });
};

window.recordAStroke = () => {
  atrament.recordStrokes = true;
  document.querySelector('#recordButton').value = 'Recording...';
};

// eslint-disable-next-line no-var,vars-on-top
window.recordedStroke = {};

atrament.addEventListener('strokerecorded', (stroke) => {
  window.recordedStroke = stroke.stroke;
  atrament.recordStrokes = false;
  document.querySelector('#recordButton').value = 'Record a stroke';
  document.querySelector('#playButton').style.display = 'inline';
});

window.playRecorded = async () => {
  // offset the drawing to avoid drawing at the exact same place
  const offsetX = Math.floor(Math.random() * 100) - 50;
  const offsetY = Math.floor(Math.random() * 100) - 50;
  // set drawing options
  atrament.weight = window.recordedStroke.weight;
  atrament.mode = window.recordedStroke.mode;
  atrament.smoothing = window.recordedStroke.smoothing;
  atrament.color = window.recordedStroke.color;
  atrament.adaptiveStroke = window.recordedStroke.adaptiveStroke;

  // add a time reference
  const reference = performance.now();

  // wait for the first point
  await waitUntil(reference, window.recordedStroke.points[0].time);

  let prevPoint = window.recordedStroke.points[0].point;
  atrament.beginStroke(prevPoint.x, prevPoint.y);

  // eslint-disable-next-line no-restricted-syntax
  for (const point of window.recordedStroke.points.slice(1)) {
    // waiting for time from reference
    // eslint-disable-next-line no-await-in-loop
    await waitUntil(reference, point.time);

    // the `draw` method accepts the current real coordinates
    // (i. e. actual cursor position), and the previous processed (filtered)
    // position. It returns an object with the current processed position.
    prevPoint = atrament.draw(
      point.point.x + offsetX,
      point.point.y + offsetY,
      prevPoint.x,
      prevPoint.y,
    );
  }

  atrament.endStroke(prevPoint.x, prevPoint.y);
};

// Simple example, see optional options for more configuration.
// eslint-disable-next-line no-undef
const pickr = Pickr.create({
  el: '#color-picker',
  theme: 'classic',
  default: 'rgb(0,0,0)',
  swatches: [
    'rgb(244, 67, 54)',
    'rgb(233, 30, 99)',
    'rgb(156, 39, 176)',
    'rgb(103, 58, 183)',
    'rgb(63, 81, 181)',
    'rgb(33, 150, 243)',
    'rgb(3, 169, 244)',
    'rgb(0, 188, 212)',
    'rgb(0, 150, 136)',
    'rgb(76, 175, 80)',
    'rgb(139, 195, 74)',
    'rgb(205, 220, 57)',
    'rgb(255, 235, 59)',
    'rgb(255, 193, 7)',
  ],
  components: {
    // Main components
    preview: true,
    opacity: true,
    hue: true,
    // Input / output Options
    interaction: {
      hex: true,
      rgb: true,
      hsla: true,
      hsva: true,
      cmyk: true,
      input: true,
      clear: true,
      save: true,
    },
  },
});

pickr.on('save', (color) => {
  atrament.color = color.toRGBA().toString();
});
