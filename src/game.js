import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

import { InputController } from "./input.js";
import { createWorld, updateWorld } from "./world.js";

export class Game {
  constructor(container) {
    this.container = container;

    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x080d16);
    this.scene.fog = new THREE.FogExp2(0x0b1018, 0.018);

    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    this.camera.position.set(0, 2.2, 30);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);

    this.controls = new PointerLockControls(
      this.camera,
      this.renderer.domElement
    );

    this.input = new InputController();

    this.world = null;

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.normalSpeed = 7;
    this.sprintSpeed = 13;

    this.playerHeight = 2.2;

    this.startScreen = document.querySelector("#start-screen");
    this.pauseScreen = document.querySelector("#pause-screen");
    this.startButton = document.querySelector("#start-button");
    this.hud = document.querySelector("#hud");

    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  start() {
    this.world = createWorld(this.scene);

    this.setupControls();

    window.addEventListener("resize", this.handleResize);

    this.renderer.setAnimationLoop(this.animate);
  }

  setupControls() {
    this.startButton?.addEventListener("click", () => {
      this.controls.lock();
    });

    this.pauseScreen?.addEventListener("click", () => {
      this.controls.lock();
    });

    this.controls.addEventListener("lock", () => {
      this.startScreen?.classList.add("hidden");
      this.pauseScreen?.classList.add("hidden");
      this.hud?.classList.remove("hidden");
    });

    this.controls.addEventListener("unlock", () => {
      const hasStarted =
        this.startScreen?.classList.contains("hidden");

      if (hasStarted) {
        this.pauseScreen?.classList.remove("hidden");
        this.hud?.classList.add("hidden");
      }
    });
  }

  updatePlayer(deltaTime) {
    if (!this.controls.isLocked) {
      return;
    }

    const damping = Math.exp(-10 * deltaTime);

    this.velocity.x *= damping;
    this.velocity.z *= damping;

    this.direction.set(
      Number(this.input.isPressed("KeyD")) -
        Number(this.input.isPressed("KeyA")),

      0,

      Number(this.input.isPressed("KeyW")) -
        Number(this.input.isPressed("KeyS"))
    );

    if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
    }

    const isSprinting =
      this.input.isPressed("ShiftLeft") ||
      this.input.isPressed("ShiftRight");

    const speed = isSprinting
      ? this.sprintSpeed
      : this.normalSpeed;

    this.velocity.x +=
      this.direction.x * speed * deltaTime * 8;

    this.velocity.z +=
      this.direction.z * speed * deltaTime * 8;

    this.controls.moveRight(
      this.velocity.x * deltaTime
    );

    this.controls.moveForward(
      this.velocity.z * deltaTime
    );

    this.applyWorldBounds();

    this.camera.position.y = this.playerHeight;
  }

  applyWorldBounds() {
    const position = this.camera.position;

    position.x = THREE.MathUtils.clamp(
      position.x,
      -31,
      31
    );

    position.z = THREE.MathUtils.clamp(
      position.z,
      -46,
      35
    );

    const altarDistance = Math.hypot(
      position.x,
      position.z + 7
    );

    if (altarDistance < 4.5) {
      const angle = Math.atan2(
        position.z + 7,
        position.x
      );

      position.x = Math.cos(angle) * 4.5;
      position.z = Math.sin(angle) * 4.5 - 7;
    }

    if (
      position.z < -33 &&
      Math.abs(position.x) > 10
    ) {
      position.z = -33;
    }
  }

  animate() {
    const deltaTime = Math.min(
      this.clock.getDelta(),
      0.05
    );

    const elapsedTime = this.clock.elapsedTime;

    this.updatePlayer(deltaTime);

    if (this.world) {
      updateWorld(
        this.world,
        deltaTime,
        elapsedTime
      );
    }

    this.renderer.render(
      this.scene,
      this.camera
    );
  }

  handleResize() {
    this.camera.aspect =
      window.innerWidth / window.innerHeight;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );
  }
}
