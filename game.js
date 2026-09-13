// ============================================
// ULTIMATE 3D RACING
// game.js
// ============================================

const CONFIG = {
    laps: 3,
    opponents: 5,

    maxSpeed: 58,
    acceleration: 24,
    braking: 38,
    friction: 9,

    steering: 2.7,

    nitroMultiplier: 1.75,
    nitroDrain: 30,
    nitroRecharge: 10,

    trackRadiusX: 75,
    trackRadiusZ: 48,
    trackWidth: 18
};

// ---------- GLOBAL VARIABLES ----------

let scene;
let camera;
let renderer;
let clock;

let player;
let opponents = [];

let trackAngle = 0;
let playerSpeed = 0;
let nitro = 100;

let currentLap = 1;
let raceTime = 0;
let collectedCoins = 0;

let raceStarted = false;
let paused = false;
let finished = false;

let accelerate = false;
let brake = false;
let turnLeft = false;
let turnRight = false;
let nitroPressed = false;

let selectedCar =
    Number(localStorage.getItem("selectedCar")) || 0;

let bestScore =
    Number(localStorage.getItem("bestScore")) || 0;

let totalCoins =
    Number(localStorage.getItem("totalCoins")) || 0;


// ---------- CAR DATA ----------

const cars = [
    {
        name: "Street Racer",
        speed: 1.0,
        handling: 1.0,
        acceleration: 1.0,
        color: 0xff2020
    },
    {
        name: "Blue Storm",
        speed: 1.12,
        handling: 0.95,
        acceleration: 1.08,
        color: 0x2080ff
    },
    {
        name: "Green Flash",
        speed: 1.06,
        handling: 1.12,
        acceleration: 1.04,
        color: 0x20d060
    },
    {
        name: "Golden X",
        speed: 1.2,
        handling: 1.08,
        acceleration: 1.15,
        color: 0xffb300
    }
];


// ---------- DOM ----------

const $ = id => document.getElementById(id);


// ---------- START ----------

window.addEventListener("load", () => {

    setupButtons();
    setupControls();

    updateMenuStats();
    updateGarage();

});


// ---------- THREE.JS SETUP ----------

function initGame() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x87ceeb);

    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.shadowMap.enabled = true;

    $("gameContainer").appendChild(renderer.domElement);


    // LIGHT

    const ambient = new THREE.HemisphereLight(
        0xffffff,
        0x557755,
        2
    );

    scene.add(ambient);


    const sun = new THREE.DirectionalLight(
        0xffffff,
        2
    );

    sun.position.set(100, 150, 50);
    sun.castShadow = true;

    scene.add(sun);


    // WORLD

    createEnvironment();
    createTrack();

    player = createCar(
        cars[selectedCar].color
    );

    scene.add(player);

    player.position.set(
        CONFIG.trackRadiusX,
        0.8,
        0
    );

    player.rotation.y = Math.PI / 2;


    // OPPONENTS

    opponents = [];

    for (let i = 0; i < CONFIG.opponents; i++) {

        const opponent =
            createCar(
                [
                    0x222222,
                    0xffffff,
                    0x7c2cff,
                    0x00d9ff,
                    0xff6b00
                ][i]
            );

        opponent.userData.angle =
            -0.35 - i * 0.55;

        opponent.userData.speed =
            0.75 + Math.random() * 0.12;

        scene.add(opponent);

        opponents.push(opponent);
    }


    // CAMERA

    camera.position.set(
        72,
        9,
        -15
    );

    camera.lookAt(
        player.position
    );


    window.addEventListener(
        "resize",
        resize
    );

    animate();
}


// ---------- ENVIRONMENT ----------

function createEnvironment() {

    // Ground

    const groundGeometry =
        new THREE.PlaneGeometry(
            500,
            500
        );

    const groundMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x398a3b
        });

    const ground =
        new THREE.Mesh(
            groundGeometry,
            groundMaterial
        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);


    // Mountains

    for (let i = 0; i < 24; i++) {

        const mountain =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    12 + Math.random() * 15,
                    25 + Math.random() * 30,
                    6
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x526b52
                })
            );

        const angle =
            Math.random() * Math.PI * 2;

        const radius = 145;

        mountain.position.set(
            Math.cos(angle) * radius,
            10,
            Math.sin(angle) * radius
        );

        scene.add(mountain);
    }


    // Trees

    for (let i = 0; i < 100; i++) {

        const tree =
            new THREE.Group();


        const trunk =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.4,
                    0.55,
                    3
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x754c24
                })
            );

        trunk.position.y = 1.5;


        const leaves =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    2.3,
                    5,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x145c24
                })
            );

        leaves.position.y = 5;


        tree.add(trunk);
        tree.add(leaves);


        const angle =
            Math.random() * Math.PI * 2;

        const radius =
            95 + Math.random() * 45;

        tree.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );

        scene.add(tree);
    }
}


// ---------- TRACK ----------

function createTrack() {

    const outer =
        new THREE.Shape();

    const points = [];

    for (
        let i = 0;
        i <= 100;
        i++
    ) {

        const a =
            (i / 100) * Math.PI * 2;

        points.push(
            new THREE.Vector2(
                Math.cos(a) *
                    (CONFIG.trackRadiusX +
                        CONFIG.trackWidth / 2),

                Math.sin(a) *
                    (CONFIG.trackRadiusZ +
                        CONFIG.trackWidth / 2)
            )
        );
    }

    outer.moveTo(
        points[0].x,
        points[0].y
    );

    for (let p of points.slice(1)) {
        outer.lineTo(p.x, p.y);
    }


    const inner =
        new THREE.Path();

    for (
        let i = 0;
        i <= 100;
        i++
    ) {

        const a =
            (i / 100) * Math.PI * 2;

        const x =
            Math.cos(a) *
            (CONFIG.trackRadiusX -
                CONFIG.trackWidth / 2);

        const y =
            Math.sin(a) *
            (CONFIG.trackRadiusZ -
                CONFIG.trackWidth / 2);

        if (i === 0)
            inner.moveTo(x, y);
        else
            inner.lineTo(x, y);
    }

    outer.holes.push(inner);


    const geometry =
        new THREE.ShapeGeometry(
            outer,
            64
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x303030
        });

    const road =
        new THREE.Mesh(
            geometry,
            material
        );

    road.rotation.x =
        -Math.PI / 2;

    road.position.y = 0.02;

    road.receiveShadow = true;

    scene.add(road);


    // Track center lines

    const lineMaterial =
        new THREE.LineBasicMaterial({
            color: 0xffff00
        });

    const linePoints = [];

    for (
        let i = 0;
        i <= 100;
        i++
    ) {

        const a =
            (i / 100) *
            Math.PI * 2;

        linePoints.push(
            new THREE.Vector3(
                Math.cos(a) *
                    CONFIG.trackRadiusX,
                0.08,
                Math.sin(a) *
                    CONFIG.trackRadiusZ
            )
        );
    }

    const lineGeometry =
        new THREE.BufferGeometry()
            .setFromPoints(linePoints);

    const centerLine =
        new THREE.Line(
            lineGeometry,
            lineMaterial
        );

    scene.add(centerLine);


    // Start line

    const start =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2,
                0.1,
                CONFIG.trackWidth
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffffff
            })
        );

    start.position.set(
        CONFIG.trackRadiusX,
        0.12,
        0
    );

    scene.add(start);
}


// ---------- CREATE CAR ----------

function createCar(color) {

    const car =
        new THREE.Group();


    // Body

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                4.2,
                1.1,
                2
            ),
            new THREE.MeshStandardMaterial({
                color
            })
        );

    body.position.y = 1;

    body.castShadow = true;

    car.add(body);


    // Cabin

    const cabin =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.2,
                0.9,
                1.65
            ),
            new THREE.MeshStandardMaterial({
                color: 0x111827,
                metalness: 0.3,
                roughness: 0.25
            })
        );

    cabin.position.set(
        -0.25,
        1.8,
        0
    );

    cabin.castShadow = true;

    car.add(cabin);


    // Wheels

    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.48,
            0.48,
            0.35,
            16
        );

    const wheelMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x101010
        });

    const wheelPositions = [
        [1.35, 0.55, 1.05],
        [1.35, 0.55, -1.05],
        [-1.35, 0.55, 1.05],
        [-1.35, 0.55, -1.05]
    ];

    for (const pos of wheelPositions) {

        const wheel =
            new THREE.Mesh(
                wheelGeometry,
                wheelMaterial
            );

        wheel.rotation.x =
            Math.PI / 2;

        wheel.position.set(
            pos[0],
            pos[1],
            pos[2]
        );

        wheel.castShadow = true;

        car.add(wheel);
    }


    // Headlights

    const lightMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 1
        });

    for (
        const z of [-0.65, 0.65]
    ) {

        const light =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.15,
                    0.25,
                    0.35
                ),
                lightMaterial
            );

        light.position.set(
            2.12,
            1.05,
            z
        );

        car.add(light);
    }


    return car;
}


// ---------- START RACE ----------

function startRace() {

    $("mainMenu").classList.add("hidden");
    $("garageScreen").classList.add("hidden");
    $("settingsScreen").classList.add("hidden");

    $("loadingScreen").classList.remove("hidden");

    $("loadingText").textContent =
        "Preparing race...";

    let progress = 0;

    const loading =
        setInterval(() => {

            progress += 10;

            $("loadingFill").style.width =
                progress + "%";

            if (progress >= 100) {

                clearInterval(loading);

                $("loadingScreen")
                    .classList.add("hidden");

                $("hud")
                    .classList.remove("hidden");

                $("mobileControls")
                    .classList.remove("hidden");

                initGame();

                countdownStart();
            }

        }, 100);
}


// ---------- COUNTDOWN ----------

function countdownStart() {

    const count =
        $("countdown");

    let number = 3;

    count.classList.remove("hidden");

    count.textContent = number;

    const timer =
        setInterval(() => {

            number--;

            if (number > 0) {

                count.textContent =
                    number;

            } else {

                count.textContent =
                    "GO!";

                raceStarted = true;

                setTimeout(() => {
                    count.classList.add("hidden");
                }, 700);

                clearInterval(timer);
            }

        }, 1000);
}


// ---------- GAME LOOP ----------

function animate() {

    requestAnimationFrame(
        animate
    );

    if (!renderer)
        return;

    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );

    if (
        raceStarted &&
        !paused &&
        !finished
    ) {

        updatePlayer(delta);
        updateOpponents(delta);
        updateCamera();

        raceTime += delta;

        updateHUD();
        checkFinish();
    }

    renderer.render(
        scene,
        camera
    );
}


// ---------- PLAYER ----------

function updatePlayer(delta) {

    const carData =
        cars[selectedCar];


    // Acceleration

    if (accelerate) {

        playerSpeed +=
            CONFIG.acceleration *
            carData.acceleration *
            delta;

    } else {

        playerSpeed -=
            CONFIG.friction *
            delta;
    }


    // Brake

    if (brake) {

        playerSpeed -=
            CONFIG.braking *
            delta;
    }


    // Nitro

    if (
        nitroPressed &&
        nitro > 0 &&
        playerSpeed > 5
    ) {

        playerSpeed +=
            CONFIG.acceleration *
            delta;

        playerSpeed *=
            1 +
            (CONFIG.nitroMultiplier - 1)
            * delta;

        nitro -=
            CONFIG.nitroDrain *
            delta;

    } else {

        nitro +=
            CONFIG.nitroRecharge *
            delta;
    }


    nitro =
        THREE.MathUtils.clamp(
            nitro,
            0,
            100
        );


    const max =
        CONFIG.maxSpeed *
        carData.speed *
        (nitroPressed && nitro > 0
            ? CONFIG.nitroMultiplier
            : 1);

    playerSpeed =
        THREE.MathUtils.clamp(
            playerSpeed,
            0,
            max
        );


    // Steering

    let steering = 0;

    if (turnLeft)
        steering -= 1;

    if (turnRight)
        steering += 1;

    trackAngle +=
        steering *
        CONFIG.steering *
        delta *
        (0.35 + playerSpeed / 60);


    // Move around track

    const radiusX =
        CONFIG.trackRadiusX;

    const radiusZ =
        CONFIG.trackRadiusZ;

    const angularSpeed =
        playerSpeed /
        45;

    trackAngle +=
        angularSpeed * delta;


    player.position.x =
        Math.cos(trackAngle) *
        radiusX;

    player.position.z =
        Math.sin(trackAngle) *
        radiusZ;


    player.rotation.y =
        -trackAngle -
        Math.PI / 2;
}


// ---------- OPPONENT AI ----------

function updateOpponents(delta) {

    opponents.forEach(
        opponent => {

            opponent.userData.angle +=
                opponent.userData.speed *
                delta *
                0.45;

            const a =
                opponent.userData.angle;

            opponent.position.x =
                Math.cos(a) *
                CONFIG.trackRadiusX;

            opponent.position.z =
                Math.sin(a) *
                CONFIG.trackRadiusZ;

            opponent.position.y =
                0.8;

            opponent.rotation.y =
                -a -
                Math.PI / 2;
        }
    );
}


// ---------- CAMERA ----------

function updateCamera() {

    if (!player)
        return;

    const behind =
        new THREE.Vector3(
            -Math.cos(trackAngle) * 11,
            6,
            -Math.sin(trackAngle) * 11
        );

    const target =
        player.position
            .clone()
            .add(behind);

    camera.position.lerp(
        target,
        0.08
    );

    const look =
        player.position
            .clone();

    look.y += 1;

    camera.lookAt(look);
}


// ---------- HUD ----------

function updateHUD() {

    const kmh =
        Math.round(
            playerSpeed * 3.6
        );

    $("speed").textContent =
        kmh;

    $("speedFill").style.width =
        Math.min(
            100,
            (kmh / 240) * 100
        ) + "%";

    $("nitroFill").style.width =
        nitro + "%";

    $("lap").textContent =
        ${currentLap}/${CONFIG.laps};

    $("raceTimer").textContent =
        formatTime(raceTime);

    $("coins").textContent =
        collectedCoins;

    $("position").textContent =
        calculatePosition();
}


// ---------- POSITION ----------

function calculatePosition() {

    let position = 1;

    const playerProgress =
        trackAngle % (Math.PI * 2);

    opponents.forEach(
        opponent => {

            const opponentProgress =
                opponent.userData.angle %
                (Math.PI * 2);

            if (
                opponentProgress >
                playerProgress
            ) {
                position++;
            }
        }
    );

    return position + " / " +
        (CONFIG.opponents + 1);
}


// ---------- FINISH ----------

function checkFinish() {

    if (
        trackAngle >=
        Math.PI * 2
    ) {

        currentLap++;

        trackAngle -=
            Math.PI * 2;

        collectedCoins += 10;

        if (
            currentLap >
            CONFIG.laps
        ) {

            finishRace();
        }
    }
}


// ---------- FINISH SCREEN ----------

function finishRace() {

    finished = true;
    raceStarted = false;

    const position =
        calculatePosition();

    const score =
        Math.max(
            0,
            Math.round(
                10000 -
                raceTime * 25 +
                collectedCoins * 100
            )
        );

    totalCoins +=
        collectedCoins;

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "bestScore",
            bestScore
        );
    }

    localStorage.setItem(
        "totalCoins",
        totalCoins
    );


    $("hud")
        .classList.add("hidden");

    $("mobileControls")
        .classList.add("hidden");

    $("finishScreen")
        .classList.remove("hidden");


    $("finishPosition").textContent =
        position;

    $("finalTime").textContent =
        formatTime(raceTime);

    $("finalLap").textContent =
        CONFIG.laps;

    $("finalCoins").textContent =
        collectedCoins;

    $("finalScore").textContent =
        score;
}


// ---------- PAUSE ----------

function pauseGame() {

    if (finished)
        return;

    paused = true;

    $("pauseMenu")
        .classList.remove("hidden");
}


function resumeGame() {

    paused = false;

    $("pauseMenu")
        .classList.add("hidden");

    clock.getDelta();
}


function restartRace() {

    location.reload();
}


function quitRace() {

    location.reload();
}


// ---------- GARAGE ----------

function updateGarage() {

    const car =
        cars[selectedCar];

    $("carName").textContent =
        car.name;

    $("carSpeedStat").textContent =
        Math.round(car.speed * 100) +
        "%";

    $("carHandlingStat").textContent =
        Math.round(car.handli
