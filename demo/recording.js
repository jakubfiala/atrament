const recordedStroke = {};

const waitUntil = (reference, time) => {
  const timeElapsed = performance.now() - reference;
  const timeToWait = time - timeElapsed;

  return new Promise((resolve) => {
    setTimeout(resolve, timeToWait);
  });
};

export const setRecorded = (stroke) => Object.assign(recordedStroke, stroke);

export const playRecorded = async (atrament) => {
  // set drawing options
  /* eslint-disable no-param-reassign */
  atrament.weight = recordedStroke.weight;
  atrament.mode = recordedStroke.mode;
  atrament.smoothing = recordedStroke.smoothing;
  atrament.color = recordedStroke.color;
  atrament.adaptiveStroke = recordedStroke.adaptiveStroke;
  /* eslint-enable no-param-reassign */

  // add a time reference
  const reference = performance.now();

  // wait for the first point
  await waitUntil(reference, recordedStroke.segments[0].time);

  let prevPoint = recordedStroke.segments[0].point;
  atrament.beginStroke(prevPoint.x, prevPoint.y);

  // eslint-disable-next-line no-restricted-syntax
  for (const segment of recordedStroke.segments) {
    // waiting for time from reference
    // eslint-disable-next-line no-await-in-loop
    await waitUntil(reference, segment.time);

    // the `draw` method accepts the current real coordinates
    // (i. e. actual cursor position), and the previous processed (filtered)
    // position. It returns an object with the current processed position.
    prevPoint = atrament.draw(
      segment.point.x,
      segment.point.y,
      prevPoint.x,
      prevPoint.y,
    );
  }

  atrament.endStroke(prevPoint.x, prevPoint.y);
};
