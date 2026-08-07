import * as THREE from "three";

import {
  OrbitControls
} from "three/addons/controls/OrbitControls.js";

import {
  createWorld,
  updateWorld
} from "./world.js";

export class Game {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();

    this.isTouchDevice =
      window.matchMedia(
        "(pointer: coarse)"
      ).matches ||
      navigator.maxTouchPoints > 0;

    this.scene = new THREE.Scene();

    this.scene.background =
      new THREE.Color(0xcfe8ee);

    this.scene.fog =
      new THREE.Fog(
        0xcfe8ee,
        90,
        180
      );

    this.viewSize = 60;

    this.camera =
      new THREE.OrthographicCamera(
        -1,
        1,
        1,
        -1,
        0.1,
        300
      );

    this.camera.position.set(
      58,
      54,
      66
    );

    this.renderer =
      new THREE.WebGLRenderer({
        antialias: !this.isTouchDevice,
        powerPreference: "high-performance"
      });

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        this.isTouchDevice ? 1.5 : 2
      )
    );

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.renderer.shadowMap.enabled = true;

    this.renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    this.renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    this.renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    this.renderer.toneMappingExposure =
      1.05;

    this.container.appendChild(
      this.renderer.domElement
    );

    this.controls =
      new OrbitControls(
        this.camera,
        this.renderer.domElement
      );

    this.controls.target.set(
      0,
      0,
      0
    );

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;

    this.controls.enablePan = false;
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;

    this.controls.minZoom = 0.72;
    this.controls.maxZoom = 1.8;

    this.controls.minPolarAngle =
      THREE.MathUtils.degToRad(38);

    this.controls.maxPolarAngle =
      THREE.MathUtils.degToRad(68);

    this.controls.minAzimuthAngle =
      THREE.MathUtils.degToRad(-125);

    this.controls.maxAzimuthAngle =
      THREE.MathUtils.degToRad(125);

    this.controls.update();

    this.world = null;
    this.hasEnteredScene = false;

    this.startScreen =
      document.querySelector(
        "#start-screen"
      );

    this.startButton =
      document.querySelector(
        "#start-button"
      );

    this.hud =
      document.querySelector(
        "#hud"
      );

    this.hint =
      document.querySelector(
        ".hint"
      );

    this.controlsInfo =
      document.querySelector(
        ".controls"
      );

    this.animate =
      this.animate.bind(this);

    this.handleResize =
      this.handleResize.bind(this);

    this.handleVisibilityChange =
      this.handleVisibilityChange.bind(this);
  }

  start() {
    this.world =
      createWorld(
        this.scene,
        {
          isMobile: this.isTouchDevice
        }
      );

    this.setupInterface();
    this.updateControlInstructions();
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

        this.enterScene();
      }
    );

    this.renderer.domElement.addEventListener(
      "dblclick",
      () => {
        this.resetCamera();
      }
    );
  }

  enterScene() {
    this.hasEnteredScene = true;

    this.startScreen?.classList.add(
      "hidden"
    );

    this.hud?.classList.remove(
      "hidden"
    );
  }

  updateControlInstructions() {
    if (this.isTouchDevice) {
      if (this.controlsInfo) {
        this.controlsInfo.innerHTML = `
          <span>單指拖曳旋轉</span>
          <span>雙指縮放</span>
          <span>橫向建議</span>
          <span>純場景展示</span>
        `;
      }

      if (this.hint) {
        this.hint.textContent =
          "單指拖曳視角 · 雙指縮放";
      }

      return;
    }

    if (this.hint) {
      this.hint.textContent =
        "拖曳旋轉 · 滾輪縮放 · 雙擊重置";
    }
  }

  resetCamera() {
    this.camera.position.set(
      58,
      54,
      66
    );

    this.camera.zoom = 1;

    this.camera.updateProjectionMatrix();

    this.controls.target.set(
      0,
      0,
      0
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

    this.controls.update();

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

    const verticalSize =
      aspect < 0.85
        ? 76
        : aspect > 2
          ? 56
          : this.viewSize;

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
        this.isTouchDevice ? 1.5 : 2
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
