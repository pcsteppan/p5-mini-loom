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
        part = arr[Math.floor(idx) - 1] * p;
    } else if (floatIdx > .5 && idx < arr.length - 1) {
        // interp with previous index
        const p = (floatIdx - .5) * 2;
        part = arr[Math.ceil(idx)] * p;
    }
    return base + part;
}

let seed = 123456789;
const a = 1664525;
const c = 1013904223;
const m = Math.pow(2, 32);

function lcgRandom() {
    seed = (a * seed + c) % m;
    return seed / m;
}

// 4x4 dither array
const dither = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
];

// given a value and a dither index
// returns 1 if the value is greater than the dither value
// returns 0 if the value is less than the dither value
const ditherValue = (value, x, y) => value > (dither[x % 4][y % 4] / 16) ? 1 : 0;
