class FunctionRectangle {
  constructor(x, y, w, h, f, renderFn, memoize = false, prepare = null) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.f = f;
    this.renderFn = renderFn;
    this.memoize = false;
    this.memo = {};
    this.prepare = prepare || ((x, y) => [x, y]);
  }
  
  draw() {
    rect(this.x, this.y, this.w, this.h);
    
    // loadPixels();
    for (let col = this.x; col < this.x + this.w; col++) {
      for (let row = this.y; row < this.y + this.h; row++) {
        let x = map(col, this.x, this.x + this.w, 0, 1);
        let y = map(row, this.y, this.y + this.h, 0, 1);

        let args = this.prepare(x, y);
        let value = this.evaluate(...args);
        let renderValue = this.renderFn(value, x, y);
        
        let bright = map(renderValue, 0, 1, 0, 255);
        let index = this.getPixelIndex(col, row);

        pixels[index + 0] = bright;
        pixels[index + 1] = bright;
        pixels[index + 2] = bright;
        pixels[index + 3] = 255;
      }
    }
    // updatePixels();
  }
  
  evaluate(...args) {
    // restrict args to 2 decimal places
    // console.log(args);
    if (this.memoize) {
      const roundedArgs = args.map(arg => Math.round(arg * 100) / 100);
      let key = roundedArgs.join(',');
      if (this.memo[key] === undefined) {
        this.memo[key] = this.f(...roundedArgs);
      }
      return this.memo[key];
    }

    return this.f(...args);
  }

  // finds the index of the pixel at the given column and row
  // needs to account for the x, and y offsets
  getPixelIndex(col, row) {
    let index = (col + (row * width)) * 4;
    return index;
  }
}

const trTwill = (x, y, t) => (sin(TWO_PI * y) / 2 + .5) * (300 / 8) % 1;
const trFuncRect = new FunctionRectangle(
  512-32, 32, 32, 512-32, 
  trTwill,
  (fx, x, y) => abs(fx - x) > .125 ? 0 : 1,
  false,
  (x, y) => [x, y, millis()]
  );

// const trSin = (x, y, t) => sin(TWO_PI * y * 4 + t / 700) / 2 + .5 ;
// const trFuncRect = new FunctionRectangle(
//   512-32, 32, 32, 512, 
//   trSin,
//   (fx, x, y) => abs(fx - x) > .05 ? 1 : 0,
//   false,
//   (x, y) => [x, y, millis() % 10000]
//   );

// const trNoise = (x, y, t) => {
//   let result = (noise(.5, abs( y - .5 )*15)) % 1;
//   return Math.round(result * 4) / 4;
// };
// const trNoiseRect = new FunctionRectangle(
//   512-32, 32, 32, 512, 
//   trNoise,
//   (fx, x, y) => abs(fx - x) > .125 ? 1 : 0,
//   false,
//   (x, y) => [x, y, millis() % 10000]
//   );

const thSin = (x, y, t) => (sin(TWO_PI * x) / 2 + .5 + t/16000) * (300 / 8) % 1;
const thFuncRect = new FunctionRectangle(
  0, 0, 512-32, 32, 
  thSin,
  (fx, x, y) => abs(fx - y) > .125 ? 0 : 1,
  false,
  (x, y) => [x, y, millis()]
  );

// const thNoise = (x, y, t) => {
//   let result = (memoNoise(.5, Math.pow(abs( x - .5 )*4, 2)) + t / 6000) * 3 % 1;
//   // result = result < .5 ? result : 1 - result;
//   let f =  Math.round(result * 26) / 26;
//   // return x > .5 ? f : 1 - f;
//   return f;
// };
// const thNoiseRect = new FunctionRectangle(
//   0, 0, 512-32, 32, 
//   thNoise,
//   (fx, x, y) => abs(fx - y) > .125 ? 0 : 1,
//   false,
//   (x, y) => [x, y, millis()]
//   );

const tieup = [
  [1, 1, 0, 0, 0, 0],
  [0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0],
  [0, 0, 0, 0, 1, 1],
  [1, 0, 0, 0, 0, 1]
];
const tieupValue = (x, y) => {
  const c = tieup.length - 0.00001;
  let x2 = map(x, 0, 1, 0, c);
  let tieupRow = tieup[Math.floor(y * c)];
  let tieupValue = interpolateArray(tieupRow, x2);
  
  return tieupValue;
}

// given an array and an index
// returns the value at that index with a blent amount from the next adjacent index
// proportional to the decimal part of the index
// [0, 1, 0, 0], 
//  0.25 -> 0.0
//  0.5 -> 0.0
//  0.75 -> 0.5
//  1 -> 1
//  1.99 -> 1
//  2 -> 1
//  2.25 -> 0.5
//  2.5 -> 0.0
const interpolateArray = (arr, idx) => {
	const base = arr[Math.floor(idx)];
	
	let part = 0;
	const floatIdx = idx % 1;
	if (floatIdx < 0.5 && idx >= 1) {
		// interp with next index
		const p = 1 - (floatIdx * 2);
		// console.log('p = ' + p);
		part = arr[Math.floor(idx) - 1] * p;
	} else if (floatIdx > .5 && idx < arr.length - 1) {
		// interp with previous index
		const p = (floatIdx - .5) * 2;
		// console.log('p = ' + p);
		part = arr[Math.ceil(idx)] * p;
	}
	return base + part;
}

const tieupRect = new FunctionRectangle(
  512-32, 0, 32, 32, 
  tieupValue,
  (fx, x, y) => 1 - fx > lcgRandom() ? 0 : 1,
  );

let seed = 123456789;
const a = 1664525;
const c = 1013904223;
const m = Math.pow(2, 32); // 2^32

function lcgRandom() {
    seed = (a * seed + c) % m;
    return seed / m;
}

const textile = (...args) => tieupValue(trFuncRect.f(...args), thFuncRect.f(...args));
// let a = Math.random();
const renderTextile = (fx, x, y) => fx < lcgRandom() ? 1 : 0
const textileRect = new FunctionRectangle(
  0, 32, 512-32, 512-32, 
  textile,
  (fx, x, y) => renderTextile(fx, x, y),
  true,
  (x, y) => [x, y, millis()]
  );

const noiseMap = new Map();
function memoNoise(x, y) {

  let roundedX = Math.round(x * 100) / 100;
  let roundedY = Math.round(y * 100) / 100;

  let key = `${roundedX},${roundedY}`;
  if (!noiseMap.has(key)) {
    noiseMap.set(key, noise(roundedX, roundedY));
  }
  return noiseMap.get(key);
}

function setup() {
  createCanvas(512, 512);
  noFill();
  stroke(0);
  strokeWeight(1);
  pixelDensity(1);
  // noLoop();
}

function draw() {
  background(255);
  loadPixels();
  trFuncRect.draw();
  // trNoiseRect.draw();
  thFuncRect.draw();
  // thNoiseRect.draw();
  textileRect.draw();
  tieupRect.draw();
  updatePixels();
}

