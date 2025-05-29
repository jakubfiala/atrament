/* eslint-disable no-unused-vars */
import Atrament, {
  MODE_DRAW, MODE_FILL, MODE_ERASE, MODE_DISABLED,
} from '../dist/esm/index.js';
import { setRecorded, playRecorded } from './recording.js';
import colorPicker from './color-picker.js';
import log from './logger.js';

// first, we need to set up the canvas
const canvas = document.getElementById('sketcher');
const toolbarToggle = document.getElementById('toolbar-toggle');
const toolbar = document.getElementsByClassName('toolbar')[0];
const clearButton = document.getElementById('clear');
const recordButton = document.getElementById('recordButton');
const playButton = document.getElementById('playButton');
const weightInput = document.getElementById('weight');
const pressureLowInput = document.getElementById('pressure-low');
const pressureLowOutput = document.getElementById('pressure-low-output');
const pressureHighInput = document.getElementById('pressure-high');
const pressureHighOutput = document.getElementById('pressure-high-output');
const smoothingInput = document.getElementById('smoothing');
const adaptiveInput = document.getElementById('adaptive');
const secondaryEraserInput = document.getElementById('secondary-eraser');
const modeInput = document.getElementById('mode');

const modes = {
  draw: MODE_DRAW,
  fill: MODE_FILL,
  erase: MODE_ERASE,
  disabled: MODE_DISABLED,
};

// instantiate Atrament
const atrament = new Atrament(canvas, {
  width: canvas.offsetWidth,
  height: canvas.offsetHeight,
  ignoreModifiers: true,
});

toolbarToggle.addEventListener('click', () => {
  toolbar.classList.toggle('toolbar-visible');
});

clearButton.addEventListener('click', () => atrament.clear());

recordButton.addEventListener('click', () => {
  atrament.recordStrokes = true;
  document.querySelector('#recordButton').value = 'Recording...';
});

playButton.addEventListener('click', () => {
  atrament.clear();
  playRecorded(atrament);
});

weightInput.addEventListener('input', ({ target: { value } }) => {
  atrament.weight = parseFloat(value);
});

pressureLowInput.addEventListener('input', ({ target: { value } }) => {
  atrament.pressureLow = parseFloat(value);
  pressureLowOutput.innerText = value;
});
pressureHighInput.addEventListener('input', ({ target: { value } }) => {
  atrament.pressureHigh = parseFloat(value);
  pressureHighOutput.innerText = value;
});

smoothingInput.addEventListener('change', ({ target: { value } }) => {
  atrament.smoothing = parseFloat(value);
});

adaptiveInput.addEventListener('change', ({ target: { checked } }) => {
  atrament.adaptiveStroke = checked;
});

secondaryEraserInput.addEventListener('change', ({ target: { checked } }) => {
  atrament.secondaryMouseButton = checked;
});

modeInput.addEventListener('change', ({ target: { value } }) => {
  atrament.mode = modes[value];
});

colorPicker.on('save', (color) => {
  atrament.color = color.toRGBA().toString();
  colorPicker.hide();
});

atrament.addEventListener('dirty', () => {
  log('event: dirty');
  clearButton.hidden = false;
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
  log(`event: strokerecorded - ${stroke.segments.length} segments`);
  setRecorded(stroke);

  atrament.recordStrokes = false;
  document.querySelector('#recordButton').value = 'Record a stroke';
  document.querySelector('#playButton').hidden = false;
});

atrament.addEventListener('segmentdrawn', () => log('event: segmentdrawn'));
