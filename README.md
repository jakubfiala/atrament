# atrament.js
#### Tiny JS library for beautiful drawing and handwriting on the HTML Canvas
---

![](demo/img/muchotravka.png)

[![Build Status](https://travis-ci.org/jakubfiala/atrament.js.svg?branch=master)](https://travis-ci.org/jakubfiala/atrament.js)

Atrament is a lightweight library that enables the user to draw smooth, natural drawings and handwriting on the HTML canvas. The algorithm was originally developed about 2 weeks after I started learning JavaScript, as I wanted to build a collaborative drawing space on the web, which ended up being [1WALL](http://fiala.uk/1wall). I wanted the drawing to feel natural and comfortable, and the result to be smooth and pleasing. Years later, I've taken the algorithm, improved it, rewrote it in ES6 and made it into a neat little library.

[Here's a basic demo.](http://fiala.uk/atrament.js/demo/)

Enjoy!

## Installation

#### script tag

Include the script located at [dist/atrament.min.js](https://github.com/jakubfiala/atrament.js/raw/master/dist/atrament.min.js) in the `<head>` tag of your HTML.

Alternatively, you can use Bower: `bower install atrament` and include `bower_components/atrament/dist/atrament.min.js` as a script tag.

#### as a module

If you're using a tool like webpack or browserify to bundle your code, you can install it using npm.

+ install atrament as a dependency using ```npm install --save atrament```.
+ require the package in a module using ```var atrament = require('atrament');```
+ You can also access the Atrament class using ```var Atrament = require('atrament').Atrament;```

#### polymer

Thanks to [rubenstolk](https://github.com/rubenstolk), you can also use the [sc-atrament](https://github.com/safetychanger/sc-atrament) Polymer element.

## Usage

+ create a `<canvas>` tag, e.g.:
```html
<canvas id="mySketcher" width="500px" height="500px">
```
+ in your JavaScript, call `atrament` passing in the selector string of your canvas:
```js
var sketcher = atrament('#mySketcher');
//or use a more object-oriented style
var sketcher = new Atrament('#mySketcher');
//you can also pass the canvas Node itself
var sketcher = new Atrament(document.querySelector('#mySketcher'));
```
+ you can also pass the width, height and default colour to the function:
```js
var sketcher = atrament('#mySketcher', 500, 500, 'orange');
```
+ that's it, happy drawing!


## Options & config

+ clear the canvas:
```js
sketcher.clear();
```
+ change the line thickness:
```js
sketcher.weight = 20; //in pixels
```
+ change the color:
```js
sketcher.color = '#ff485e'; //just like CSS
```
+ toggle between modes:
```js
sketcher.mode = 'erase'; 	// eraser tool
sketcher.mode = 'fill'; 	// click to fill area
sketcher.mode = 'draw'; 	// default
```
+ toggle smoothing - having it on makes the drawings look much better, turning it off makes it feel a bit more responsive. `true` by default.
```js
sketcher.smoothing = false;
```
+ toggle adaptive stroke, i.e. line width changing based on drawing speed for a more natural effect. `true` by default.
```js
sketcher.adaptiveStroke = false;
```
+ change the opacity:
```js
sketcher.opacity = 0.5; //number between 0-1
```
+ export as image:
```js
//we have to get the dataURL of the image
var dataURL = sketcher.toImage();
//then we can, for instance, open a new window with it
window.open(dataURL);
```
+ `dirty` event – do something when the canvas becomes dirty:
```js
// this also fires when you clear the canvas
// the dirty property is then false
// note that we attach the event to canvas
canvas.addEventListener('dirty', e => console.info(sketcher.dirty));
```

## Development
To obtain the dependencies, `cd` into the atrament directory and run `npm install`.
You should be able to then build atrament by simply running `npm run build`.

I didn't bother writing tests because it's such a small package. Contributions are welcome!
