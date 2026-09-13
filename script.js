// Scene, Camera, and Renderer Set up
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Road (सडक)
const roadGeometry = new THREE.PlaneGeometry(10, 1000);
const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
scene.add(road);

// Player Car (कार)
const carGroup = new THREE.Group();

// Car Body
const bodyGeo = new THREE.BoxGeometry(1.5, 0.6, 3);
const bodyMat = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Red Car
const carBody = new THREE.Mesh(bodyGeo, bodyMat);
carBody.position.y = 0.5;
carGroup.add(carBody);

// Car Cabin
const cabinGeo = new THREE.BoxGeometry(1.2, 0.5, 1.5);
const cabinMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
const carCabin = new THREE.Mesh(cabinGeo, cabinMat);
carCabin.position.set(0, 0.9, -0.2);
carGroup.add(carCabin);

scene.add(carGroup);

// Camera Position
camera.position.set(0, 3, 6);
camera.lookAt(carGroup.position);
