// make a class for Point
class Point {
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  set x(x) {
    this._x = x;
  }

  set y(y) {
    this._y = y;
  }

  set(x, y) {
    this._x = x;
    this._y = y;
  }
}

// make a class for the mouse data
class Mouse extends Point {
  constructor() {
    super(0, 0);
    this._down = false;
    this._px = 0;
    this._py = 0;
  }

  get down() {
    return this._down;
  }

  set down(d) {
    this._down = d;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  set x(x) {
    this._x = x;
  }

  set y(y) {
    this._y = y;
  }

  get px() {
    return this._px;
  }

  get py() {
    return this._py;
  }

  set px(px) {
    this._px = px;
  }

  set py(py) {
    this._py = py;
  }

}

export default Mouse;
