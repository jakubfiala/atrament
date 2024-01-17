// colour indices per pixel
const R = 0;
const G = 1;
const B = 2;
export const A = 3;

export const PIXEL = 4;
export const TRANSPARENT = 0;
export const OPAQUE = 255;

export const lineDistance = (x1, y1, x2, y2) => {
  // calculate euclidean distance between (x1, y1) and (x2, y2)
  const xs = (x2 - x1) ** 2;
  const ys = (y2 - y1) ** 2;
  return Math.sqrt(xs + ys);
};

export const hexToRgb = (hexColor) => {
  // Since input type color provides hex and ImageData accepts RGB need to transform
  const m = hexColor.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  return [
    parseInt(m[1], 16),
    parseInt(m[2], 16),
    parseInt(m[3], 16),
  ];
};

// Pixel color equals comp color?
export const colorMatcher = (data, compR, compG, compB, compA) => (pixelPos) => (
  data[pixelPos + R] === compR
  && data[pixelPos + G] === compG
  && data[pixelPos + B] === compB
  && data[pixelPos + A] === compA
);

export const colorMatcherIgnoreAlpha = (data, compR, compG, compB, compA) => (pixelPos) => {
  const alpha = data[pixelPos + A];
  if (alpha !== TRANSPARENT && alpha !== OPAQUE) {
    return true;
  }

  return (
    data[pixelPos + R] === compR
    && data[pixelPos + G] === compG
    && data[pixelPos + B] === compB
    && data[pixelPos + A] === compA
  );
};

/* eslint-disable no-param-reassign */
export const pixelPainter = (data, fillR, fillG, fillB, fillA) => (pixelPos) => {
  // Update fill color in matrix
  data[pixelPos + R] = fillR;
  data[pixelPos + G] = fillG;
  data[pixelPos + B] = fillB;
  data[pixelPos + A] = fillA;
};

export const pixelPainterMixAlpha = (data, fillR, fillG, fillB, fillA) => (pixelPos) => {
  const oldAlpha = data[pixelPos + A] === OPAQUE ? TRANSPARENT : data[pixelPos + A] / OPAQUE;
  const mixAlpha = 1 - oldAlpha;

  // Update fill color in matrix
  data[pixelPos + R] = Math.floor(oldAlpha * data[pixelPos + R] + mixAlpha * fillR);
  data[pixelPos + G] = Math.floor(oldAlpha * data[pixelPos + G] + mixAlpha * fillG);
  data[pixelPos + B] = Math.floor(oldAlpha * data[pixelPos + B] + mixAlpha * fillB);
  data[pixelPos + A] = fillA;
};
/* eslint-enable no-param-reassign */
