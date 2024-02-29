class FunctionRectangle {
    constructor(x, y, w, h, evaluateFn, renderFn, prepareFn = null) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.evaluateFn = evaluateFn;
        this.renderFn = renderFn;
        this.prepareFn = prepareFn || ((x, y) => [x, y]);
    }

    draw() {
        for (let col = this.x; col < this.x + this.w; col++) {
            for (let row = this.y; row < this.y + this.h; row++) {
                let x = map(col, this.x, this.x + this.w, 0, 1);
                let y = map(row, this.y, this.y + this.h, 0, 1);

                let args = this.prepareFn(x, y);
                let value = this.evaluateFn(...args);
                let renderValue = this.renderFn(value, x, y);

                let bright = map(renderValue, 0, 1, 0, 255);
                let index = this.getPixelIndex(col, row);

                pixels[index + 0] = 255 - bright;
                pixels[index + 1] = 255 - bright;
                pixels[index + 2] = 255;
                pixels[index + 3] = 255;
            }
        }
    }

    // finds the index of the pixel at the given column and row
    // needs to account for the x, and y offsets
    getPixelIndex(col, row) {
        let index = (col + (row * width)) * 4;
        return index;
    }
}
