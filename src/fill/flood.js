import {
  PIXEL,
  hexToRgb,
  pixelPainter,
  colorMatcher,
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
  const floorX = Math.floor(startX);
  const floorY = Math.floor(startY);
  const pixelStack = [[floorX, floorY]];
  // hex needs to be trasformed to rgb since colorLayer accepts RGB
  const fillColor = hexToRgb(color);
  const alpha = Math.min(globalAlpha * 10 * 255, 255);
  const colorPixel = pixelPainter(image, ...fillColor, startColor, alpha);
  const matchStartColor = colorMatcher(image, ...startColor);
  const matchFillColor = colorMatcher(image, ...[...fillColor, 255]);

  // check if we're trying to fill with the same colour, if so, stop
  if (matchFillColor((floorY * width + floorX) * PIXEL)) {
    return image;
  }

  while (pixelStack.length) {
    const newPos = pixelStack.pop();
    const x = newPos[0];
    let y = newPos[1];

    let pixelPos = (y * width + x) * PIXEL;

    while (y-- >= 0 && matchStartColor(pixelPos)) {
      pixelPos -= width * PIXEL;
    }
    pixelPos += width * PIXEL;

    ++y;

    let reachLeft = false;
    let reachRight = false;

    while (y++ < height - 1 && matchStartColor(pixelPos)) {
      colorPixel(pixelPos);

      if (x > 0) {
        if (matchStartColor(pixelPos - PIXEL)) {
          if (!reachLeft) {
            pixelStack.push([x - 1, y]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }

      if (x < width - 1) {
        if (matchStartColor(pixelPos + PIXEL)) {
          if (!reachRight) {
            pixelStack.push([x + 1, y]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }

      pixelPos += width * PIXEL;
    }
  }

  return image;
};

export default floodFill;
