import * as THREE from 'three';

// Game state
const gameState = {
    isPlaying: true,
    score: 0,
    wave: 1,
    health: 100,
    ammo: 75,
    maxAmmo: 75,
    isReloading: false,
    reloadTime: 2000,
    lastShot: 0,
    fireRate: 100,
    zombies: [],
    lasers: [],
    mouse: new THREE.Vector2(),
    raycaster: new THREE.Raycaster()
};

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0a0a);
scene.fog = new THREE.Fog(0x1a0a0a, 50, 200);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'gameCanvas';
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

const greenLight = new THREE.PointLight(0x00ff00, 1, 50);
greenLight.position.set(0, 20, 0);
scene.add(greenLight);

// Ground
const groundGeometry = new THREE.CircleGeometry(150, 64);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a1a1a,
    roughness: 0.8
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Tower
const towerGroup = new THREE.Group();
const towerBase = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 6, 15, 8),
    new THREE.MeshStandardMaterial({ color: 0x4a4a4a })
);
towerBase.position.y = 7.5;
towerBase.castShadow = true;
towerGroup.add(towerBase);

const towerTop = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 5, 2, 8),
    new THREE.MeshStandardMaterial({ color: 0x3a3a3a })
);
towerTop.position.y = 16;
towerTop.castShadow = true;
towerGroup.add(towerTop);

scene.add(towerGroup);

// Player character (black with afro)
const playerGroup = new THREE.Group();

// Body (military armor)
const bodyGeometry = new THREE.BoxGeometry(1.5, 2, 1);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.castShadow = true;
playerGroup.add(body);

// Head
const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
const headMaterial = new THREE.MeshStandardMaterial({ color: 0x2a1a1a });
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 1.6;
head.castShadow = true;
playerGroup.add(head);

// Afro
const afroGeometry = new THREE.SphereGeometry(0.9, 16, 16);
const afroMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1 });
const afro = new THREE.Mesh(afroGeometry, afroMaterial);
afro.position.y = 1.8;
afro.scale.set(1, 1.1, 1);
afro.castShadow = true;
playerGroup.add(afro);

// Arms
const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5);
const armMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });

const leftArm = new THREE.Mesh(armGeometry, armMaterial);
leftArm.position.set(-0.9, 0.2, 0);
leftArm.rotation.z = Math.PI / 6;
leftArm.castShadow = true;
playerGroup.add(leftArm);

const rightArm = new THREE.Mesh(armGeometry, armMaterial);
rightArm.position.set(0.9, 0.2, 0);
rightArm.rotation.z = -Math.PI / 6;
rightArm.castShadow = true;
playerGroup.add(rightArm);

// AK47 Gun
const gunGroup = new THREE.Group();

// Gun body
const gunBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 2),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a })
);
gunBody.position.z = -1;
gunGroup.add(gunBody);

// Gun barrel
const gunBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 1),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
);
gunBarrel.rotation.x = Math.PI / 2;
gunBarrel.position.z = -2;
gunGroup.add(gunBarrel);

// Gun magazine
const magazine = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.8, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
);
magazine.position.set(0, -0.4, -0.5);
gunGroup.add(magazine);

gunGroup.position.set(0.5, 0.5, -0.5);
playerGroup.add(gunGroup);

playerGroup.position.set(0, 17.5, 0);
scene.add(playerGroup);

// Camera position (third-person view)
camera.position.set(0, 25, 20);
camera.lookAt(0, 17, 0);

// Mouse tracking
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    gameState.mouse.x = mouseX;
    gameState.mouse.y = mouseY;
});

// Shooting
window.addEventListener('click', (event) => {
    console.log('Click detected!', { isPlaying: gameState.isPlaying, isReloading: gameState.isReloading, ammo: gameState.ammo });

    if (!gameState.isPlaying) {
        console.log('Game not playing');
        return;
    }

    if (gameState.isReloading) {
        console.log('Currently reloading');
        return;
    }

    const currentTime = Date.now();
    if (currentTime - gameState.lastShot < gameState.fireRate) {
        console.log('Fire rate limit');
        return;
    }

    if (gameState.ammo > 0) {
        console.log('Shooting!');
        shoot();
        gameState.ammo--;
        gameState.lastShot = currentTime;
        updateUI();

        if (gameState.ammo === 0) {
            reload();
        }
    } else {
        console.log('Out of ammo!');
    }
});

// Reload
window.addEventListener('keydown', (event) => {
    console.log('Key pressed:', event.key);

    if (event.key === 'r' || event.key === 'R') {
        console.log('Reload key pressed', { isReloading: gameState.isReloading, ammo: gameState.ammo });

        if (!gameState.isReloading && gameState.ammo < gameState.maxAmmo) {
            console.log('Reloading...');
            reload();
        }
    }
});

function reload() {
    gameState.isReloading = true;
    document.getElementById('reloading').style.display = 'block';

    setTimeout(() => {
        gameState.ammo = gameState.maxAmmo;
        gameState.isReloading = false;
        document.getElementById('reloading').style.display = 'none';
        updateUI();
    }, gameState.reloadTime);
}

function shoot() {
    // Create laser
    const laserGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2);
    const laserMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 1
    });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);

    // Position laser at gun barrel
    const gunWorldPos = new THREE.Vector3();
    gunGroup.getWorldPosition(gunWorldPos);
    laser.position.set(gunWorldPos.x, playerGroup.position.y + 0.5, gunWorldPos.z);

    // Calculate direction using raycaster
    gameState.raycaster.setFromCamera(gameState.mouse, camera);

    // Create a ground plane to intersect with
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1);
    const intersectPoint = new THREE.Vector3();
    const didIntersect = gameState.raycaster.ray.intersectPlane(groundPlane, intersectPoint);

    let direction;
    if (didIntersect && intersectPoint) {
        // Shoot toward mouse position
        direction = new THREE.Vector3()
            .subVectors(intersectPoint, laser.position)
            .normalize();
    } else {
        // Fallback: shoot forward
        direction = new THREE.Vector3(0, 0, -1);
    }

    // Set laser rotation to point in direction
    const targetPos = laser.position.clone().add(direction);
    laser.lookAt(targetPos);
    laser.rotation.x += Math.PI / 2;

    laser.userData.velocity = direction.clone().multiplyScalar(2);

    scene.add(laser);
    gameState.lasers.push(laser);

    // Laser glow
    const glowLight = new THREE.PointLight(0x00ff00, 2, 10);
    glowLight.position.copy(laser.position);
    scene.add(glowLight);
    laser.userData.light = glowLight;

    // Muzzle flash effect
    const flash = new THREE.PointLight(0x00ff00, 5, 15);
    flash.position.copy(laser.position);
    scene.add(flash);
    setTimeout(() => scene.remove(flash), 50);
}

// Zombie creation
function createZombie() {
    const zombieGroup = new THREE.Group();

    // Zombie body
    const zombieBody = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x2a4a2a })
    );
    zombieBody.castShadow = true;
    zombieGroup.add(zombieBody);

    // Zombie head
    const zombieHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x3a5a3a })
    );
    zombieHead.position.y = 1.4;
    zombieHead.castShadow = true;
    zombieGroup.add(zombieHead);

    // Arms
    const zombieArmLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 1.2, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x2a4a2a })
    );
    zombieArmLeft.position.set(-0.7, 0.2, 0);
    zombieArmLeft.rotation.z = Math.PI / 4;
    zombieGroup.add(zombieArmLeft);

    const zombieArmRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 1.2, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x2a4a2a })
    );
    zombieArmRight.position.set(0.7, 0.2, 0);
    zombieArmRight.rotation.z = -Math.PI / 4;
    zombieGroup.add(zombieArmRight);

    // Random spawn position at edge
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 20;
    zombieGroup.position.set(
        Math.cos(angle) * distance,
        1,
        Math.sin(angle) * distance
    );

    zombieGroup.userData.health = 3;
    zombieGroup.userData.speed = 0.05 + Math.random() * 0.03;

    scene.add(zombieGroup);
    gameState.zombies.push(zombieGroup);
}

// Spawn waves
let lastSpawn = 0;
const spawnInterval = 2000;

function spawnWave() {
    const zombiesPerWave = 5 + gameState.wave * 2;
    for (let i = 0; i < zombiesPerWave; i++) {
        setTimeout(() => createZombie(), i * 500);
    }
}

// Initial wave
spawnWave();

// Game loop
function animate() {
    requestAnimationFrame(animate);

    if (!gameState.isPlaying) {
        renderer.render(scene, camera);
        return;
    }

    // Update gun rotation to follow mouse
    const gunTargetRotationY = mouseX * Math.PI * 0.5;
    const gunTargetRotationX = -mouseY * Math.PI * 0.3;

    playerGroup.rotation.y += (gunTargetRotationY - playerGroup.rotation.y) * 0.1;
    gunGroup.rotation.x += (gunTargetRotationX - gunGroup.rotation.x) * 0.1;

    // Update lasers
    for (let i = gameState.lasers.length - 1; i >= 0; i--) {
        const laser = gameState.lasers[i];
        laser.position.add(laser.userData.velocity);

        if (laser.userData.light) {
            laser.userData.light.position.copy(laser.position);
        }

        // Check collision with zombies
        let hit = false;
        for (let j = gameState.zombies.length - 1; j >= 0; j--) {
            const zombie = gameState.zombies[j];
            const distance = laser.position.distanceTo(zombie.position);

            if (distance < 2) {
                zombie.userData.health--;
                hit = true;

                if (zombie.userData.health <= 0) {
                    scene.remove(zombie);
                    gameState.zombies.splice(j, 1);
                    gameState.score += 10;
                    updateUI();
                }
                break;
            }
        }

        // Remove laser if hit or out of bounds
        if (hit || laser.position.length() > 150) {
            scene.remove(laser);
            if (laser.userData.light) {
                scene.remove(laser.userData.light);
            }
            gameState.lasers.splice(i, 1);
        }
    }

    // Update zombies
    for (let i = gameState.zombies.length - 1; i >= 0; i--) {
        const zombie = gameState.zombies[i];

        // Move toward tower
        const direction = new THREE.Vector3(0, 0, 0).sub(zombie.position).normalize();
        zombie.position.add(direction.multiplyScalar(zombie.userData.speed));

        // Rotate to face tower
        zombie.lookAt(0, zombie.position.y, 0);

        // Animate arms
        const time = Date.now() * 0.003;
        zombie.children[2].rotation.z = Math.PI / 4 + Math.sin(time + i) * 0.3;
        zombie.children[3].rotation.z = -Math.PI / 4 - Math.sin(time + i) * 0.3;

        // Check if reached tower
        if (zombie.position.length() < 8) {
            gameState.health -= 10;
            scene.remove(zombie);
            gameState.zombies.splice(i, 1);
            updateUI();

            if (gameState.health <= 0) {
                gameOver();
            }
        }
    }

    // Spawn new wave
    if (gameState.zombies.length === 0) {
        gameState.wave++;
        updateUI();
        spawnWave();
    }

    // Auto spawn zombies
    const currentTime = Date.now();
    if (currentTime - lastSpawn > spawnInterval && gameState.zombies.length < 30) {
        createZombie();
        lastSpawn = currentTime;
    }

    updateUI();
    renderer.render(scene, camera);
}

function updateUI() {
    document.getElementById('ammo').textContent = `${gameState.ammo}/${gameState.maxAmmo}`;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('wave').textContent = gameState.wave;
    document.getElementById('zombies').textContent = gameState.zombies.length;
    document.getElementById('health').textContent = gameState.health;
}

function gameOver() {
    gameState.isPlaying = false;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').textContent = gameState.score;
}

function restartGame() {
    // Clear zombies and lasers
    gameState.zombies.forEach(zombie => scene.remove(zombie));
    gameState.lasers.forEach(laser => {
        scene.remove(laser);
        if (laser.userData.light) scene.remove(laser.userData.light);
    });

    gameState.zombies = [];
    gameState.lasers = [];
    gameState.score = 0;
    gameState.wave = 1;
    gameState.health = 100;
    gameState.ammo = 75;
    gameState.isReloading = false;
    gameState.isPlaying = true;

    document.getElementById('gameOver').style.display = 'none';

    spawnWave();
    updateUI();
}

// Initialize game when DOM is ready
function initGame() {
    console.log('Game initializing...');

    // Setup restart button
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
        console.log('Restart button initialized');
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Start game
    console.log('Starting game loop...');
    updateUI();
    animate();
    console.log('Game started! Click to shoot, R to reload');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
