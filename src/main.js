import * as THREE from 'three';

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111122);

// --- Isometric camera ---
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  -10 * aspect, 10 * aspect, 10, -10, 0.1, 1000
);
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- Lights ---
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(10, 20, 10);
scene.add(dir);

// --- Ground ---
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x335533 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// --- Player (placeholder cube) ---
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshStandardMaterial({ color: 0x4488ff })
);
player.position.y = 1;
scene.add(player);

// --- Input ---
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// --- Camera-relative movement (the iso trick) ---
const camForward = new THREE.Vector3();
const camRight = new THREE.Vector3();
const moveDir = new THREE.Vector3();

function updatePlayer(dt) {
  camForward.set(0, 0, -1).applyQuaternion(camera.quaternion);
  camForward.y = 0; camForward.normalize();

  camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
  camRight.y = 0; camRight.normalize();

  moveDir.set(0, 0, 0);
  if (keys['KeyW']) moveDir.add(camForward);
  if (keys['KeyS']) moveDir.sub(camForward);
  if (keys['KeyD']) moveDir.add(camRight);
  if (keys['KeyA']) moveDir.sub(camRight);

  if (moveDir.lengthSq() > 0) {
    moveDir.normalize();
    const speed = 6;
    player.position.addScaledVector(moveDir, speed * dt);
  }
}

// --- Camera follow ---
const camOffset = new THREE.Vector3(20, 20, 20);
function updateCamera() {
  camera.position.copy(player.position).add(camOffset);
  camera.lookAt(player.position);
}

// --- Resize ---
window.addEventListener('resize', () => {
  const a = window.innerWidth / window.innerHeight;
  camera.left = -10 * a;
  camera.right = 10 * a;
  camera.top = 10;
  camera.bottom = -10;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Game loop ---
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  updatePlayer(dt);
  updateCamera();
  renderer.render(scene, camera);
}
animate();
