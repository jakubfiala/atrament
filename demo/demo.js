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
