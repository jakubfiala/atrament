// colour indices per pixel
const R = 0;
const G = 1;
const B = 2;
const A = 3;

export const PIXEL = 4;

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

/* eslint-disable no-param-reassign */
export const pixelPainter = (data, fillR, fillG, fillB, startColor, alpha) => {
  const matcher = colorMatcher(data, ...startColor);

  return (pixelPos) => {
    // Update fill color in matrix
    data[pixelPos] = fillR;
    data[pixelPos + 1] = fillG;
    data[pixelPos + 2] = fillB;
    data[pixelPos + 3] = alpha;

    if (!matcher(pixelPos + PIXEL)) {
      data[pixelPos + PIXEL + R] = data[pixelPos + PIXEL + R] * 0.01 + fillR * 0.99;
      data[pixelPos + PIXEL + G] = data[pixelPos + PIXEL + G] * 0.01 + fillG * 0.99;
      data[pixelPos + PIXEL + B] = data[pixelPos + PIXEL + B] * 0.01 + fillB * 0.99;
      data[pixelPos + PIXEL + A] = data[pixelPos + PIXEL + A] * 0.01 + alpha * 0.99;
    }

    if (!matcher(pixelPos - PIXEL)) {
      data[pixelPos - PIXEL + R] = data[pixelPos - PIXEL + R] * 0.01 + fillR * 0.99;
      data[pixelPos - PIXEL + G] = data[pixelPos - PIXEL + G] * 0.01 + fillG * 0.99;
      data[pixelPos - PIXEL + B] = data[pixelPos - PIXEL + B] * 0.01 + fillB * 0.99;
      data[pixelPos - PIXEL + A] = data[pixelPos - PIXEL + A] * 0.01 + alpha * 0.99;
    }
  };
};
/* eslint-enable no-param-reassign */
