const trTwill = (x, y, t) => (sin(TWO_PI * y * 2) / 2 + .5) * (300 / 16) % 1;
const trFuncRect = new FunctionRectangle(
  512 - 32, 32, 32, 512 - 32,
  trTwill,
  (fx, x, y) => abs(fx - x) > .125 ? 1 : 0,
  (x, y) => [x, y, millis()]
);

const thSin = (x, y, t) => (sin(TWO_PI * x * 2) / 2 + .5 + t / 12000) * (300 / 16) % 1;
const thFuncRect = new FunctionRectangle(
  0, 0, 512 - 32, 32,
  thSin,
  (fx, x, y) => abs(fx - y) > .125 ? 1 : 0,
  (x, y) => [x, y, millis()]
);

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
const tieupRect = new FunctionRectangle(
  512 - 32, 0, 32, 32,
  tieupValue,
  (fx, x, y) => 1 - fx > lcgRandom() ? 0 : 1,
);

const textile = (...args) => tieupValue(
  trFuncRect.evaluateFn(...args),
  thFuncRect.evaluateFn(...args)
);
const renderTextile = (fx, x, y) => {
  const xi = Math.floor(x * 512);
  const yi = Math.floor(y * 512);
  const dither = ditherValue(fx, xi, yi);
  return dither;
}

const textileRect = new FunctionRectangle(
  0, 32, 512 - 32, 512 - 32,
  textile,
  (fx, x, y) => renderTextile(fx, x, y),
  (x, y) => [x, y, millis()]
);

function setup() {
  createCanvas(512, 512);
  pixelDensity(1);
}

function draw() {
  loadPixels();
  // treadling
  trFuncRect.draw();

  // threading
  thFuncRect.draw();

  // tieup
  tieupRect.draw();

  // textile
  textileRect.draw();
  updatePixels();
}