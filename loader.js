
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
});

function initLoader() {
    const container = document.getElementById('loader-container');

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pitch black background to match image

    // Camera with better positioning
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(6, 4, 6); // Better angle to see lighting effects
    camera.lookAt(0, 0, 0);

    // Renderer with shadows enabled
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Enhanced Lighting Setup
    // Main directional light (key light) - simulates sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 8, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Secondary light from opposite side (fill light)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Rim light for edge definition
    const rimLight = new THREE.PointLight(0x88aaff, 1.2);
    rimLight.position.set(-8, 0, -8);
    scene.add(rimLight);

    // Ambient light for base illumination (reduced for better contrast)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);


    // Add a subtle ground plane for better light reflection
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x050505,
        metalness: 0.1,
        roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Cube / Group
    const rubiksCube = new THREE.Group();
    scene.add(rubiksCube);

    // Enhanced Materials with proper light interaction
    // 1. Glossy Black Plastic - high reflectivity
    const materialGlossy = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.2,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.0,
        reflectivity: 1.0
    });

    // 2. Semi-glossy - medium reflectivity
    const materialSemiGlossy = new THREE.MeshPhysicalMaterial({
        color: 0x151515,
        metalness: 0.1,
        roughness: 0.3,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.8
    });

    // 3. Metallic - high metalness for shine
    const materialMetallic = new THREE.MeshPhysicalMaterial({
        color: 0x2a2a2a,
        metalness: 0.9,
        roughness: 0.15,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.2
    });

    // 4. Matte - for contrast
    const materialMatte = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        metalness: 0.0,
        roughness: 0.95,
    });

    const materials = [materialGlossy, materialSemiGlossy, materialMetallic, materialMatte];

    // Geometry - 3x3x3 grid
    const cubeSize = 0.95; // Slightly smaller than 1 to leave gaps
    const offset = 1.0; // Distance between centers

    // Grid generation
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

                // Randomly assign one of the dark materials to this block
                const material = materials[Math.floor(Math.random() * materials.length)];

                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(x * offset, y * offset, z * offset);
                cube.castShadow = true;
                cube.receiveShadow = true;

                rubiksCube.add(cube);
            }
        }
    }

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Slow, hypnotic rotation
        rubiksCube.rotation.x += 0.005;
        rubiksCube.rotation.y += 0.01;

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Fade out logic
    window.addEventListener('load', () => {
        setTimeout(() => {
            container.style.opacity = '0';
            setTimeout(() => {
                container.style.display = 'none';
            }, 1000); // Wait for CSS transition
        }, 2500); // Minimum view time
    });
}
