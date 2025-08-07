class BiomeGenerator {
    constructor() {
        // Increased canvas size
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
        this.generate();
    }

    setupEventListeners() {
        document.getElementById('generate').addEventListener('click', () => {
            this.generate();
        });
    }

    createBiomeLegend() {
        const biomeList = document.getElementById('biome-list');
        biomeList.innerHTML = ''; // Clear existing items
        
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
        this.loadingOverlay.style.display = 'flex';
        const seed = parseInt(document.getElementById('seed').value) || Math.random() * 65536;
        
        // Use setTimeout to allow the loading overlay to appear
        setTimeout(async () => {
            try {
                await this.generateTerrain(seed);
            } finally {
                this.loadingOverlay.style.display = 'none';
            }
        }, 0);
    }

    async generateTerrain(seed) {
        const heightNoise = new SimplexNoise(seed);
        const tempNoise = new SimplexNoise(seed + 1);
        const humidityNoise = new SimplexNoise(seed + 2);
        
        const imageData = this.ctx.createImageData(this.width, this.height);
        const chunkSize = 100; // Process in chunks to prevent blocking

        for(let y = 0; y < this.height; y++) {
            if(y % chunkSize === 0) {
                // Allow other tasks to run between chunks
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            for(let x = 0; x < this.width; x++) {
                const height = this.getNormalizedNoise(heightNoise, x, y, 150);
                const temperature = this.getNormalizedNoise(tempNoise, x, y, 200);
                const humidity = this.getNormalizedNoise(humidityNoise, x, y, 180);
                
                const biome = this.getBiome(height, temperature, humidity);
                const color = this.hexToRgb(biome.color);
                
                const index = (y * this.width + x) * 4;
                imageData.data[index] = color.r;
                imageData.data[index + 1] = color.g;
                imageData.data[index + 2] = color.b;
                imageData.data[index + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    getNormalizedNoise(noise, x, y, scale) {
        // Added octaves for more natural-looking terrain
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;
        
        for(let i = 0; i < 4; i++) {
            value += amplitude * noise.noise2D(x * frequency / scale, y * frequency / scale);
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        
        return (value / maxValue + 1) / 2;
    }

    getBiome(height, temperature, humidity) {
        if(height > 0.8) {
            return temperature < 0.2 ? this.biomes[13] : this.biomes[14]; // Snow Peak or Rocky Mountain
        }
        
        if(height < 0.3) {
            return this.biomes[11]; // Ocean
        }
        
        if(height < 0.35) {
            return this.biomes[12]; // Beach
        }
        
        if(temperature < 0.2) {
            return humidity < 0.5 ? this.biomes[0] : this.biomes[1]; // Frozen Desert or Tundra
        }
        
        if(temperature < 0.4) {
            return this.biomes[2]; // Taiga
        }
        
        if(height > 0.6) {
            return this.biomes[3]; // Alpine
        }
        
        if(temperature > 0.8) {
            if(humidity < 0.2) return this.biomes[4]; // Desert
            if(humidity < 0.4) return this.biomes[5]; // Savanna
            return humidity > 0.8 ? this.biomes[9] : this.biomes[8]; // Rainforest or Tropical Forest
        }
        
        if(humidity < 0.4) return this.biomes[6]; // Grassland
        if(humidity < 0.8) return this.biomes[7]; // Temperate Forest
        return this.biomes[10]; // Swamp
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
