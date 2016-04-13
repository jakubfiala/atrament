//make a class for Point
class Point {
	constructor(x, y) {
		if (arguments.length < 2) throw new Error('not enough coordinates for Point.');
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
		if (arguments.length < 2) throw new Error('not enough coordinates for Point.set');
		this._x = x;
		this._y = y;
	}
}

//make a class for the mouse data
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

class Atrament {
	constructor(selector, width, height, color) {
		if (!document) throw new Error('no DOM found');

		//get canvas element
		if (selector instanceof Node && selector.tagName === 'CANVAS') this.canvas = selector;
		else if (typeof selector === 'string') this.canvas = document.querySelector(selector);
		else throw new Error(`can\'t look for canvas based on \'${selector}\'`);
		if (!this.canvas) throw new Error('canvas not found');

		//set external canvas params
		this.canvas.width = width ? width : 500;
		this.canvas.height = height ? height : 500;
		this.canvas.style.cursor = 'crosshair';

		//create a mouse object
		this.mouse = new Mouse();

		//mousemove handler
		let mouseMove = (mousePosition) => {
			mousePosition.preventDefault();
			//get position
			let mx, my;
			if (mousePosition.changedTouches) { // touchscreens
				mx = mousePosition.changedTouches[0].pageX - mousePosition.target.offsetLeft;
				my = mousePosition.changedTouches[0].pageY - mousePosition.target.offsetTop;
			}
			else if (mousePosition.layerX || mousePosition.layerX == 0) { // Firefox
				mx = mousePosition.layerX;
				my = mousePosition.layerY;
			}
			else if (mousePosition.offsetX || mousePosition.offsetX == 0) { // Opera
				mx = mousePosition.offsetX;
				my = mousePosition.offsetY;
			};
			//draw if we should draw
			if (this.mouse.down) {
				this.draw(mx, my);
			}
			//if not, just update position
			else {
				this.mouse.x = mx;
				this.mouse.y = my;
			}
		}

		//mousedown handler
		let mouseDown = (mousePosition) => {
			mousePosition.preventDefault();
			//update position just in case
			mouseMove(mousePosition);
			//remember it
			this.mouse.px = this.mouse.x;
			this.mouse.py = this.mouse.y;
			//begin drawing
			this.mouse.down = true;
			this.context.beginPath();
			this.context.moveTo(this.mouse.px, this.mouse.py);
		}
		let mouseUp = (mousePosition) => {
			mousePosition.preventDefault();
			this.mouse.down = false;
			//stop drawing
			this.context.closePath();
		}

		//attach listeners
		this.canvas.addEventListener('mousemove', mouseMove);
		this.canvas.addEventListener('mousedown', mouseDown);
		this.canvas.addEventListener('mouseup', mouseUp);
		this.canvas.addEventListener('touchstart', mouseDown);
		this.canvas.addEventListener('touchend', mouseUp);
		this.canvas.addEventListener('touchmove', mouseMove);

		//set internal canvas params
		this.context = this.canvas.getContext('2d');
		this.context.globalCompositeOperation = 'source-over';
		this.context.globalAlpha = 1;
		this.context.strokeStyle = color ? color : 'black';
		this.context.lineCap = 'round';
		this.context.lineJoin = 'round';

		//set drawing params
		this.SMOOTHING_INIT = 0.85;
		this.WEIGHT_SPREAD = 10;
		this._smoothing = this.SMOOTHING_INIT;
		this._maxWeight = 12;
		this._thickness = 2;
		this._targetThickness = 2;
		this._weight = 2;
	}

	static lineDistance(x1, y1, x2, y2) {
		//calculate euclidean distance between (x1, y1) and (x2, y2)
		var xs = 0;
	    var ys = 0;

	    xs = x2 - x1;
	    xs = xs * xs;

	    ys = y2 - y1;
	    ys = ys * ys;

	    return Math.sqrt( xs + ys );
	}

	draw(mX, mY) {
		let mouse = this.mouse;
		let context = this.context;

		//calculate distance from previous point
		let raw_dist = Atrament.lineDistance(mX, mY, mouse.px, mouse.py)

		//now, here we scale the initial smoothing factor by the raw distance
		//this means that when the mouse moves fast, there is more smoothing
		//and when we're drawing small detailed stuff, we have more control
		//also we hard clip at 1
		let smoothingFactor = Math.min(0.87, this._smoothing + (raw_dist - 60) / 3000);

		//calculate smoothed coordinates
		mouse.x = mX - (mX - mouse.px) * smoothingFactor;
		mouse.y = mY - (mY - mouse.py) * smoothingFactor;

		//recalculate distance from previous point, this time relative to the smoothed coords
		let dist = Atrament.lineDistance(mouse.x, mouse.y, mouse.px, mouse.py)

		//calculate target thickness based on the new distance
		this._targetThickness = (dist - 1) / (50 - 1) * (this._maxWeight - this._weight) + this._weight;
		//approach the target gradually
		if (this._thickness > this._targetThickness) {
			this._thickness -= 0.5;
		}
		else if (this._thickness < this._targetThickness) {
			this._thickness += 0.5;
		}
		//set line width
		context.lineWidth = this._thickness;

		//draw using quad interpolation
		context.quadraticCurveTo(mouse.px, mouse.py, mouse.x, mouse.y);
		context.stroke();

		//remember
		mouse.px = mouse.x;
		mouse.py = mouse.y;
	}

	get color() {
		return this.context.strokeStyle;
	}

	set color(c) {
		if (typeof c !== 'string') throw new Error('wrong argument type');
		this.context.strokeStyle = c;
	}

	get weight() {
		return this._weight;
	}

	set weight(w) {
		if (typeof w !== 'number') throw new Error('wrong argument type');
		this._weight = w;
		this._thickness = w;
		this._targetThickness = w;
		this._maxWeight = w + this.WEIGHT_SPREAD;
	}

	get mode() {
		return this.context.globalCompositeOperation === 'destination-out' ? 'erase' : 'draw';
	}

	set mode(m) {
		if (typeof m !== 'string') throw new Error('wrong argument type');
		this.context.globalCompositeOperation = m === 'erase' ? 'destination-out' : 'source-over';
	}

	get smoothing() {
		return this._smoothing === this.SMOOTHING_INIT;
	}

	set smoothing(s) {
		if (typeof s !== 'boolean') throw new Error('wrong argument type');
		this._smoothing = s ? this.SMOOTHING_INIT : 0;
	}

	set opacity(o) {
		if (typeof o !== 'number') throw new Error('wrong argument type');
		//now, we need to scale this, because our drawing method means we don't just get uniform transparency all over the drawn line.
		//so we scale it down a lot, meaning that it'll look nicely semi-transparent
		//unless opacity is 1, then we should go full on to 1
		if (o >= 1) this.context.globalAlpha = 1;
		else this.context.globalAlpha = o/10;
	}

	clear() {
		//make sure we're in the right compositing mode, and erase everything
		if (this.context.globalCompositeOperation === 'destination-out') {
			this.mode = 'draw';
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.mode = 'erase';
		}
		else {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}

	toImage() {
		return this.canvas.toDataURL();
	}


}

//for people who like functional programming
function atrament(selector, width, height, color) {
	return new Atrament(selector, width, height, color);
}

module.exports = atrament;
module.exports.Atrament = Atrament;
