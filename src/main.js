import * as THREE from 'three';
import { VirtualJoystick, ActionButton } from './touchControls.js';

// ... scene, camera, renderer, lights, ground, player (unchanged) ...

// --- Input: keyboard + joystick ---
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

const joystick = new VirtualJoystick(
  document.getElementById('joystick'),
  document.getElementById('knob')
);

const actionBtn = new ActionButton(document.getElementById('action'));
actionBtn.onPress = () => {
  console.log('Action pressed');
  // Later: interact / open battle menu
};

// --- Camera-relative movement ---
const camForward = new THREE.Vector3();
const camRight = new THREE.Vector3();
const moveDir = new THREE.Vector3();

function updatePlayer(dt) {
  camForward.set(0, 0, -1).applyQuaternion(camera.quaternion);
  camForward.y = 0; camForward.normalize();

  camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
  camRight.y = 0; camRight.normalize();

  moveDir.set(0, 0, 0);

  // Keyboard
  if (keys['KeyW']) moveDir.add(camForward);
  if (keys['KeyS']) moveDir.sub(camForward);
  if (keys['KeyD']) moveDir.add(camRight);
  if (keys['KeyA']) moveDir.sub(camRight);

  // Joystick — note: y is inverted (up on stick = forward)
  if (joystick.vector.x !== 0 || joystick.vector.y !== 0) {
    moveDir.addScaledVector(camRight, joystick.vector.x);
    moveDir.addScaledVector(camForward, -joystick.vector.y);
  }

  if (moveDir.lengthSq() > 0) {
    // Clamp to 1 so diagonal isn't faster, but allow analog magnitude
    if (moveDir.lengthSq() > 1) moveDir.normalize();
    const speed = 6;
    player.position.addScaledVector(moveDir, speed * dt);
  }
}

// ... rest unchanged ...