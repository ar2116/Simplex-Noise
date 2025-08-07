// A robust SimplexNoise implementation
class SimplexNoise {
    constructor(seed) {
        this.F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        this.G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        
        this.grad3 = [
            [1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0],
            [1,0,1], [-1,0,1], [1,0,-1], [-1,0,-1],
            [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1]
        ];

        this.p = new Array(256);
        this.perm = new Array(512);
        
        this.seed(seed || 0);
    }

    seed(seed) {
        if(seed > 0 && seed < 1) {
            seed *= 65536;
        }

        seed = Math.floor(seed);
        if(seed < 256) {
            seed |= seed << 8;
        }

        for(let i = 0; i < 256; i++) {
            let v;
            if (i & 1) {
                v = this.p[i] ^ (seed & 255);
            } else {
                v = this.p[i] ^ ((seed >> 8) & 255);
            }

            this.perm[i] = this.perm[i + 256] = v;
            this.p[i] = i;
        }
    }

    noise2D(xin, yin) {
        let n0, n1, n2;

        const s = (xin + yin) * this.F2;
        let i = Math.floor(xin + s);
        let j = Math.floor(yin + s);

        const t = (i + j) * this.G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;

        let i1, j1;
        if(x0 > y0) {
            i1 = 1;
            j1 = 0;
        } else {
            i1 = 0;
            j1 = 1;
        }

        const x1 = x0 - i1 + this.G2;
        const y1 = y0 - j1 + this.G2;
        const x2 = x0 - 1.0 + 2.0 * this.G2;
        const y2 = y0 - 1.0 + 2.0 * this.G2;

        i &= 255;
        j &= 255;

        const g0 = this.grad3[this.perm[(i + this.perm[j]) & 255] % 12];
        const g1 = this.grad3[this.perm[(i + i1 + this.perm[j + j1]) & 255] % 12];
        const g2 = this.grad3[this.perm[(i + 1 + this.perm[j + 1]) & 255] % 12];

        let t0 = 0.5 - x0*x0 - y0*y0;
        if(t0 < 0) {
            n0 = 0.0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(g0, x0, y0);
        }

        let t1 = 0.5 - x1*x1 - y1*y1;
        if(t1 < 0) {
            n1 = 0.0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(g1, x1, y1);
        }

        let t2 = 0.5 - x2*x2 - y2*y2;
        if(t2 < 0) {
            n2 = 0.0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(g2, x2, y2);
        }

        return 70.0 * (n0 + n1 + n2);
    }

    dot(g, x, y) {
        return g[0]*x + g[1]*y;
    }
}
