import * as THREE from "three";

import {
  OrbitControls
} from "three/addons/controls/OrbitControls.js";

import {
  createWorld,
  updateWorld,
  resetBall
} from "./world.js";

import {
  createTeams,
  updateTeams,
  resetTeams
} from "./player.js";

import {
  MatchUI
} from "./ui.js";

export class Game {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();

    this.isTouchDevice =
      window.matchMedia("(pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcfe8ee);
    this.scene.fog = new THREE.Fog(0xcfe8ee, 90, 180);

    this.camera = new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      0.1,
      300
    );

    this.camera.position.set(45, 42, 50);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isTouchDevice,
      powerPreference: "high-performance"
    });

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        this.isTouchDevice ? 1.35 : 2
      )
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

    this.container.appendChild(
      this.renderer.domElement
    );

    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    this.controls.target.set(0, 0, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.minZoom = 0.72;
    this.controls.maxZoom = 2.2;

    this.controls.minPolarAngle =
      THREE.MathUtils.degToRad(42);

    this.controls.maxPolarAngle =
      THREE.MathUtils.degToRad(62);

    this.controls.update();

    this.world = null;
    this.teams = null;

    this.hasStarted = false;
    this.isResetting = false;
    this.resetTimer = 0;

    this.ui = new MatchUI();

    this.startScreen =
      document.querySelector("#start-screen");

    this.startButton =
      document.querySelector("#start-button");

    this.hud =
      document.querySelector("#hud");

    this.animate =
      this.animate.bind(this);

    this.handleResize =
      this.handleResize.bind(this);

    this.handleVisibilityChange =
      this.handleVisibilityChange.bind(this);
  }

  start() {
    this.world = createWorld(
      this.scene,
      {
        isMobile: this.isTouchDevice
      }
    );

    this.teams = createTeams(
      this.scene,
      this.world
    );

    this.setupInterface();
    this.handleResize();

    window.addEventListener(
      "resize",
      this.handleResize
    );

    window.addEventListener(
      "orientationchange",
      this.handleResize
    );

    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

    this.renderer.setAnimationLoop(
      this.animate
    );
  }

  setupInterface() {
    this.startButton?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.hasStarted = true;

        this.startScreen?.classList.add("hidden");
        this.hud?.classList.remove("hidden");

        this.ui.reset();
      }
    );

    this.renderer.domElement.addEventListener(
      "dblclick",
      () => {
        this.resetCamera();
      }
    );
  }

  resetCamera() {
    this.camera.position.set(
      45,
      42,
      50
    );

    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();

    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  updateMatch(deltaTime, elapsedTime) {
    if (!this.hasStarted) {
      return;
    }

    if (this.isResetting) {
      this.resetTimer -= deltaTime;

      if (this.resetTimer <= 0) {
        resetBall(this.world);
        resetTeams(this.teams);

        this.isResetting = false;
        this.ui.setStatus("比賽進行中");
      }

      return;
    }

    updateTeams(
      this.teams,
      this.world,
      deltaTime,
      elapsedTime
    );

    const goal = updateWorld(
      this.world,
      deltaTime,
      elapsedTime
    );

    if (goal) {
      this.ui.addGoal(goal);
      this.ui.setStatus(
        goal === "red"
          ? "赤櫻得分"
          : "蒼月得分"
      );

      this.isResetting = true;
      this.resetTimer = 1.8;
    }

    this.ui.updateClock(deltaTime);
  }

  updateCamera(deltaTime) {
    if (!this.world?.ball) {
      return;
    }

    const ballPosition =
      this.world.ball.position;

    const followTarget =
      new THREE.Vector3(
        THREE.MathUtils.clamp(
          ballPosition.x,
          -18,
          18
        ),
        0,
        THREE.MathUtils.clamp(
          ballPosition.z,
          -8,
          8
        )
      );

    const smoothing =
      1 - Math.exp(-3 * deltaTime);

    this.controls.target.lerp(
      followTarget,
      smoothing
    );

    this.controls.update();
  }

  animate() {
    const deltaTime =
      Math.min(
        this.clock.getDelta(),
        0.05
      );

    const elapsedTime =
      this.clock.elapsedTime;

    this.updateMatch(
      deltaTime,
      elapsedTime
    );

    this.updateCamera(
      deltaTime
    );

    this.renderer.render(
      this.scene,
      this.camera
    );
  }

  handleResize() {
    const width =
      Math.max(
        window.innerWidth,
        1
      );

    const height =
      Math.max(
        window.innerHeight,
        1
      );

    const aspect =
      width / height;

    let verticalSize;

    if (this.isTouchDevice) {
      verticalSize =
        aspect < 0.85
          ? 40
          : 32;
    } else {
      verticalSize =
        aspect < 0.85
          ? 48
          : 38;
    }

    const horizontalSize =
      verticalSize * aspect;

    this.camera.left =
      -horizontalSize / 2;

    this.camera.right =
      horizontalSize / 2;

    this.camera.top =
      verticalSize / 2;

    this.camera.bottom =
      -verticalSize / 2;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      width,
      height
    );

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        this.isTouchDevice
          ? 1.35
          : 2
      )
    );
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.clock.stop();
      return;
    }

    this.clock.start();
  }
}
