export default class Vector {
    constructor(
        public x: number,
        public y: number
    ) {}

    to(x: number, y: number): Vector {
        return new Vector(x - this.x, y - this.y);
    }

    scale(factor: number): void {
        this.x *= factor;
        this.y *= factor;
    }

    getMagnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    add(v: Vector): void {
        this.x += v.x;
        this.y += v.y;
    }

    sub(v: Vector): void {
        this.x -= v.x;
        this.y -= v.y;
    }

    static add(v1: Vector, v2: Vector): Vector {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    static sub(v1: Vector, v2: Vector): Vector {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    static Zero: Vector = new Vector(0, 0);
}