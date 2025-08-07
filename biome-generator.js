class BiomeGenerator {
    constructor() {
        this.width = 1200;
        this.height = 800;
        this.canvas = document.getElementById('terrainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.loadingOverlay = document.getElementById('loadingOverlay');

        this.biomes = [
            { name: 'Frozen Desert', color: '#e8e8e8' },
            { name: 'Tundra', color: '#dddddd' },
            { name: 'Taiga', color: '#ccd4bc' },
            { name: 'Alpine', color: '#6c6c6c' },
            { name: 'Desert', color: '#e4d5a7' },
            { name: 'Savanna', color: '#c5b68d' },
            { name: 'Grassland', color: '#90af7d' },
            { name: 'Temperate Forest', color: '#4b7337' },
            { name: 'Tropical Forest', color: '#2d4f1e' },
            { name: 'Rainforest', color: '#1b3312' },
            { name: 'Swamp', color: '#4b4f3a' },
            { name: 'Ocean', color: '#1e4d6d' },
            { name: 'Beach', color: '#e6d9ad' },
            { name: 'Snow Peak', color: '#ffffff' },
            { name: 'Rocky Mountain', color: '#7a7a7a' }
        ];

        this.setupEventListeners();
        this.createBiomeLegend();
        
        // Ensure initial generation happens after DOM is fully loaded
        requestAnimationFrame(() => this.generate());
    }

    setupEventListeners() {
        document.getElementById('generate').addEventListener('click', () => {
            this.generate();
        });
    }

    createBiomeLegend() {
        const biomeList = document.getElementById('biome-list');
        biomeList.innerHTML = '';
        
        this.biomes.forEach(biome => {
            const biomeItem = document.createElement('div');
            biomeItem.className = 'biome-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'biome-color';
            colorBox.style.backgroundColor = biome.color;
            
            const name = document.createElement('span');
            name.className = 'biome-name';
            name.textContent = biome.name;
            
            biomeItem.appendChild(colorBox);
            biomeItem.appendChild(name);
            biomeList.appendChild(biomeItem);
        });
    }

    async generate() {
        try {
            this.loadingOverlay.style.display = 'flex';
            const seed = parseInt(document.getElementById('seed').value) || Math.floor(Math.random() * 65536);
            
            // Clear the canvas first
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            await this.generateTerrain(seed);
        } catch (error) {
            console.error('Error generating terrain:', error);
        } finally {
            this.loadingOverlay.style.display = 'none';
        }
    }

    async generateTerrain(seed) {
        const heightNoise = new SimplexNoise(seed);
        const tempNoise = new SimplexNoise(seed + 1);
        const humidityNoise = new SimplexNoise(seed + 2);
        
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;

        for(let y = 0; y < this.height; y++) {
            if(y % 50 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            for(let x = 0; x < this.width; x++) {
                // Normalize coordinates
                const nx = x / this.width;
                const ny = y / this.height;
                
                // Generate noise values with different scales
                const height = this.getNormalizedNoise(heightNoise, nx, ny, 0.5);
                const temperature = this.getNormalizedNoise(tempNoise, nx, ny, 0.3);
                const humidity = this.getNormalizedNoise(humidityNoise, nx, ny, 0.4);
                
                const biome = this.getBiome(height, temperature, humidity);
                const color = this.hexToRgb(biome.color);
                
                const index = (y * this.width + x) * 4;
                data[index] = color.r;
                data[index + 1] = color.g;
                data[index + 2] = color.b;
                data[index + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    getNormalizedNoise(noise, x, y, scale) {
        // Multiple octaves of noise for more natural looking terrain
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;
        
        for(let i = 0; i < 4; i++) {
            value += amplitude * (noise.noise2D(x * frequency / scale, y * frequency / scale) * 0.5 + 0.5);
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        
        return value / maxValue;
    }

    getBiome(height, temperature, humidity) {
        if(height > 0.8) {
            return temperature < 0.2 ? this.biomes[13] : this.biomes[14];
        }
        
        if(height < 0.3) {
            return this.biomes[11];
        }
        
        if(height < 0.35) {
            return this.biomes[12];
        }
        
        if(temperature < 0.2) {
            return humidity < 0.5 ? this.biomes[0] : this.biomes[1];
        }
        
        if(temperature < 0.4) {
            return this.biomes[2];
        }
        
        if(height > 0.6) {
            return this.biomes[3];
        }
        
        if(temperature > 0.8) {
            if(humidity < 0.2) return this.biomes[4];
            if(humidity < 0.4) return this.biomes[5];
            return humidity > 0.8 ? this.biomes[9] : this.biomes[8];
        }
        
        if(humidity < 0.4) return this.biomes[6];
        if(humidity < 0.8) return this.biomes[7];
        return this.biomes[10];
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}

// Initialize the generator when the page loads
window.addEventListener('load', () => {
    new BiomeGenerator();
});
