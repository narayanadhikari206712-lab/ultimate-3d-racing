// Check if Three.js is loaded
if (typeof THREE === 'undefined') {
    document.body.innerHTML += '<h1 style="color:red;position:absolute;top:50px;left:20px;">Three.js Load भएन! index.html जाँच गर्नुहोस्।</h1>';
} else {
    // Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const container = document.getElementById('game-container');
    if (container) {
        container.appendChild(renderer.domElement);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Ground / Road
    const roadGeo = new THREE.PlaneGeometry(10, 1000);
    const roadMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // Car Group
    const car = new THREE.Group();

    // Car Body
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.6, 3);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const carBody = new THREE.Mesh(bodyGeo, bodyMat);
    carBody.position.y = 0.5;
    car.add(carBody);

    // Car Cabin
    const cabinGeo = new THREE.BoxGeometry(1.2, 0.5, 1.5);
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const carCabin = new THREE.Mesh(cabinGeo, cabinMat);
    carCabin.position.set(0, 0.9, -0.2);
    car.add(carCabin);

    scene.add(car);

    // Camera Position
    camera.position.set(0, 3, 6);
    camera.lookAt(car.position);

    // Keyboard Controls
    const keys = { left: false, right: false };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        if (keys.left && car.position.x > -3.5) {
            car.position.x -= 0.1;
        }
        if (keys.right && car.position.x < 3.5) {
            car.position.x += 0.1;
        }

        camera.position.x = car.position.x;
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
