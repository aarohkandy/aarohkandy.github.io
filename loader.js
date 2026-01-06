
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
});

function initLoader() {
    const container = document.getElementById('loader-container');

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pitch black background to match image

    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8; // Zoomed out enough to see the whole cube
    camera.position.y = 2; // Slight angle looking down
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    // Key light
    const spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.position.set(10, 20, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    scene.add(spotLight);

    // Rim light / Fill light to catch edges
    const rimLight = new THREE.PointLight(0x4444ff, 0.5); // Slight bluish tint for cool dark mode feel
    rimLight.position.set(-10, 0, -10);
    scene.add(rimLight);

    // Ambient light for base visibility
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);


    // Cube / Group
    const rubiksCube = new THREE.Group();
    scene.add(rubiksCube);

    // Materials - aiming for that dark, textured look
    // 1. Glossy Black Plastic
    const materialGlossy = new THREE.MeshPhysicalMaterial({
        color: 0x111111,
        metalness: 0.1,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });

    // 2. Matte/Textured Black (Simulating the grid/perforated look via high roughness avoiding expensive textures for now)
    const materialMatte = new THREE.MeshStandardMaterial({
        color: 0x050505,
        metalness: 0.0,
        roughness: 0.9,
    });

    // 3. Metallic/Noise Black
    const materialMetallic = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.8,
        roughness: 0.4,
    });

    const materials = [materialGlossy, materialMatte, materialMetallic];

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

                // Add beveled edges effect (optional, keep simple for perf first)

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
