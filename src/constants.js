const C = {};
C.floodFillInterval = 100;
C.maxLineThickness = 50;
C.minLineThickness = 1;
C.lineThicknessRange = C.maxLineThickness - C.minLineThickness;
C.thicknessIncrement = 0.5;
C.minSmoothingFactor = 0.87;
C.initialSmoothingFactor = 0.85;
C.weightSpread = 10;
C.initialThickness = 2;

module.exports = C;
