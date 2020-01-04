// make a class for Point
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }
}

// make a class for the mouse data
class Mouse extends Point {
  constructor() {
    super(0, 0);
    this.down = false;
    this.px = 0;
    this.py = 0;
  }

  setp(px, py) {
    this.px = px;
    this.py = py;
  }
}

module.exports = { Mouse, Point };
