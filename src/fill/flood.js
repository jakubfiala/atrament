import {
  PIXEL, A, OPAQUE,
  hexToRgb,
  pixelPainter,
  pixelPainterMixAlpha,
  colorMatcher,
  colorMatcherIgnoreAlpha,
} from '../pixels.js';

const floodFill = ({
  image,
  width,
  height,
  color,
  globalAlpha,
  startX,
  startY,
  startColor,
}) => {
  const row = width * PIXEL;
  // make sure start coordinates are integers
  const startXCoord = Math.floor(startX);
  const startYCoord = Math.floor(startY);
  // hex needs to be trasformed to rgb since ImageData uses RGB
  const fillColor = hexToRgb(color);
  // ensure alpha is an integer in the range of 0-255
  const fillAlpha = Math.floor(Math.max(0, Math.min(globalAlpha * OPAQUE, OPAQUE)));
  // we need different behaviour in case we're filling a non-opaque area
  const fillingNonOpaque = startColor[A] !== OPAQUE;
  // our pixel painter should only mix alpha if we're starting in a non-opaque area
  const pixelPainterOfChoice = fillingNonOpaque ? pixelPainterMixAlpha : pixelPainter;
  const paintPixel = pixelPainterOfChoice(image, ...fillColor, fillAlpha);
  // when looking for the span start, we ignore the alpha value if filling a non-opaque area
  // this ensures that we'll mix the fill into antialiased edges
  const colorMatcherSpanStart = fillingNonOpaque ? colorMatcherIgnoreAlpha : colorMatcher;
  const matchStartColorSpanStart = colorMatcherSpanStart(image, ...startColor);
  // for all other cases, we look for the start colour exactly
  const matchStartColor = colorMatcherIgnoreAlpha(image, ...startColor);

  // check if we're trying to fill with the same colour, if so, stop
  const matchFillColor = colorMatcher(image, ...[...fillColor, OPAQUE]);
  if (matchFillColor((startYCoord * width + startXCoord) * PIXEL)) {
    return image;
  }
  // begin with our start pixel
  const pixelStack = [[startXCoord, startYCoord]];
  while (pixelStack.length) {
    const [x, y] = pixelStack.pop();
    // column position is in cartesian space (x,y)
    let columnPosition = y;
    // pixel position is in 1D space (the raw image data UInt8ClampedArray)
    let pixelPos = (columnPosition * width + x) * PIXEL;
    // start moving directly up from our start position
    // until we find a different colour to the start colour
    // this is the beginning of our span
    while (columnPosition-- >= 0 && matchStartColorSpanStart(pixelPos)) {
      pixelPos -= row;
    }
    // move one row down (topmost pixel of fillable area)
    pixelPos += row;

    let reachLeft = false;
    let reachRight = false;
    // for each row, check if the first pixel still has the start colour
    // if it does, paint it and push surrounding pixels to the stack of pixels to check
    while (++columnPosition < height - 1 && matchStartColor(pixelPos)) {
      paintPixel(pixelPos);
      // check the pixel to the left
      if (x > 0) {
        if (matchStartColor(pixelPos - PIXEL)) {
          if (!reachLeft) {
            pixelStack.push([x - 1, columnPosition]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }
      // check the pixel to the right
      if (x < width - 1) {
        if (matchStartColor(pixelPos + PIXEL)) {
          if (!reachRight) {
            pixelStack.push([x + 1, columnPosition]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }
      // move to the next row
      pixelPos += row;
    }
  }

  return image;
};

export default floodFill;
