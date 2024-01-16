import * as Pixels from '../pixels.js';

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
  const fillColor = Pixels.hexToRgb(color);
  const alpha = Math.min(globalAlpha * 10 * 255, 255);
  const colorPixel = Pixels.colorPixel(image, ...fillColor, startColor, alpha);
  const matchColor = Pixels.matchColor(image, ...startColor);
  const matchFillColor = Pixels.matchColor(image, ...[...fillColor, 255]);

  // check if we're trying to fill with the same colour, if so, stop
  if (matchFillColor((floorY * width + floorX) * 4)) {
    return image;
  }

  while (pixelStack.length) {
    const newPos = pixelStack.pop();
    const x = newPos[0];
    let y = newPos[1];

    let pixelPos = (y * width + x) * 4;

    while (y-- >= 0 && matchColor(pixelPos)) {
      pixelPos -= width * 4;
    }
    pixelPos += width * 4;

    ++y;

    let reachLeft = false;
    let reachRight = false;

    while (y++ < height - 1 && matchColor(pixelPos)) {
      colorPixel(pixelPos);

      if (x > 0) {
        if (matchColor(pixelPos - 4)) {
          if (!reachLeft) {
            pixelStack.push([x - 1, y]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }

      if (x < width - 1) {
        if (matchColor(pixelPos + 4)) {
          if (!reachRight) {
            pixelStack.push([x + 1, y]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }

      pixelPos += width * 4;
    }
  }

  return image;
};

export default floodFill;
