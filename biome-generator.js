class BiomeGenerator {
    constructor() {
        // Set up canvas
        this.canvas = document.getElementById('terrainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 1200;
        this.height = 800;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Define biomes with clear, distinct colors
        this.biomes = [
            { name: 'Deep Ocean', color: '#000080' },
            { name: 'Ocean', color: '#0000FF' },
            { name: 'Beach', color: '#FFE4B5' },
            { name: 'Desert', color: '#FFD700' },
            { name: 'Grassland', color: '#32CD32' },
            { name: 'Forest', color: '#228B22' },
            { name: 'Rainforest', color: '#006400' },
            { name: 'Tundra', color: '#F0FFFF' },
            { name: 'Snow', color: '#FFFFFF' },
            { name: 'Mountain', color: '#808080' },
            { name: 'High Mountain', color: '#A9A9A9' },
            { name: 'Volcano', color: '#8B0000' },
            { name: 'Savanna', color: '#DAA520' },
            { name: 'Swamp', color: '#2F4F4F' },
            { name: 'Taiga', color: '#90EE90' }
        ];

        this.setupEventListeners();
        this.createBiomeLegend();
        this.generate();
    }

    setupEventListeners() {
        const generateBtn = document.getElementById('generate');
        generateBtn.addEventListener('click', () => this.generate());
    }

    createBiomeLegend() {
        const biomeList = document.getElementById('biome-list');
        biomeList.innerHTML = '';
        
        this.biomes.forEach(biome => {
            const item = document.createElement('div');
            item.className = 'biome-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'biome-color';
            colorBox.style.backgroundColor = biome.color;
            
            const name = document.createElement('span');
            name.className = 'biome-name';
            name.textContent = biome.name;
            
            item.appendChild(colorBox);
            item.appendChild(name);
            biomeList.appendChild(item);
        });
    }

    generate() {
        const seed = parseInt(document.getElementById('seed').value) || Math.floor(Math.random() * 10000);
        console.log('Generating map with seed:', seed);

        // Create noise generators
        const heightNoise = new SimplexNoise(seed);
        const tempNoise = new SimplexNoise(seed + 1);
        const humidityNoise = new SimplexNoise(seed + 2);

        // Create image data
        const imageData = this.ctx.createImageData(this.width, this.height);

        // Generate terrain
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // Generate noise values
                const nx = x / this.width;
                const ny = y / this.height;
                
                const height = this.getNoiseValue(heightNoise, nx, ny, 5);
                const temp = this.getNoiseValue(tempNoise, nx, ny, 3);
                const humidity = this.getNoiseValue(humidityNoise, nx, ny, 4);

                // Get biome color
                const biome = this.getBiome(height, temp, humidity);
                const color = this.hexToRgb(biome.color);

                // Set pixel color
                const index = (y * this.width + x) * 4;
                imageData.data[index] = color.r;
                imageData.data[index + 1] = color.g;
                imageData.data[index + 2] = color.b;
                imageData.data[index + 3] = 255;
            }
        }

        // Draw the image data to the canvas
        this.ctx.putImageData(imageData, 0, 0);
        console.log('Map generation complete');
    }

    getNoiseValue(noise, x, y, scale) {
        const octaves = 4;
        let value = 0;
        let amp = 1;
        let freq = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            value += amp * noise.noise2D(x * freq * scale, y * freq * scale);
            maxValue += amp;
            amp *= 0.5;
            freq *= 2;
        }

        // Normalize to 0-1 range
        return (value / maxValue + 1) / 2;
    }

    getBiome(height, temp, humidity) {
        if (height < 0.2) return this.biomes[0]; // Deep Ocean
        if (height < 0.3) return this.biomes[1]; // Ocean
        if (height < 0.32) return this.biomes[2]; // Beach

        if (height > 0.8) {
            if (height > 0.9) return this.biomes[11]; // Volcano
            if (temp < 0.2) return this.biomes[8]; // Snow
            return this.biomes[10]; // High Mountain
        }

        if (height > 0.6) return this.biomes[9]; // Mountain

        if (temp < 0.2) return this.biomes[7]; // Tundra
        if (temp < 0.4) return this.biomes[14]; // Taiga

        if (temp > 0.8) {
            if (humidity < 0.3) return this.biomes[3]; // Desert
            if (humidity > 0.6) return this.biomes[6]; // Rainforest
            return this.biomes[12]; // Savanna
        }

        if (humidity > 0.6) {
            if (temp > 0.6) return this.biomes[13]; // Swamp
            return this.biomes[5]; // Forest
        }

        return this.biomes[4]; // Grassland
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
    }
}

// Initialize when the page loads
window.addEventListener('load', () => {
    console.log('Initializing BiomeGenerator');
    new BiomeGenerator();
});
