import * as THREE from "three";

import {
  PointerLockControls
} from "three/addons/controls/PointerLockControls.js";

import {
  InputController
} from "./input.js";

import {
  createWorld,
  updateWorld
} from "./world.js";

export class Game {
  constructor(container) {
    this.container = container;

    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();

    this.scene.background =
      new THREE.Color(0x080d16);

    this.scene.fog =
      new THREE.FogExp2(
        0x0b1018,
        0.018
      );

    this.camera =
      new THREE.PerspectiveCamera(
        65,
        window.innerWidth /
          window.innerHeight,
        0.1,
        500
      );

    this.camera.position.set(
      0,
      2.2,
      30
    );

    this.camera.rotation.order = "YXZ";

    this.renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
      });

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
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
      new PointerLockControls(
        this.camera,
        this.renderer.domElement
      );

    this.input =
      new InputController();

    this.world = null;

    this.velocity =
      new THREE.Vector3();

    this.direction =
      new THREE.Vector3();

    this.normalSpeed = 7;
    this.sprintSpeed = 13;

    this.playerHeight = 2.2;

    this.isTouchDevice =
      window.matchMedia(
        "(pointer: coarse)"
      ).matches ||
      navigator.maxTouchPoints > 0;

    this.hasEnteredScene = false;

    this.mobileLook = {
      active: false,
      touchIdentifier: null,
      previousX: 0,
      previousY: 0,
      sensitivity: 0.004
    };

    this.startScreen =
      document.querySelector(
        "#start-screen"
      );

    this.pauseScreen =
      document.querySelector(
        "#pause-screen"
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
      createWorld(this.scene);

    this.setupControls();
    this.updateControlInstructions();

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

  setupControls() {
    this.startButton?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.enterScene();
      }
    );

    this.pauseScreen?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();

        this.resumeScene();
      }
    );

    this.controls.addEventListener(
      "lock",
      () => {
        this.hasEnteredScene = true;

        this.showGameView();
      }
    );

    this.controls.addEventListener(
      "unlock",
      () => {
        if (this.isTouchDevice) {
          return;
        }

        if (!this.hasEnteredScene) {
          return;
        }

        this.showPauseView();
      }
    );

    if (this.isTouchDevice) {
      this.setupTouchLook();
    }
  }

  enterScene() {
    this.hasEnteredScene = true;

    if (this.isTouchDevice) {
      this.showGameView();
      return;
    }

    this.controls.lock();
  }

  resumeScene() {
    if (this.isTouchDevice) {
      this.showGameView();
      return;
    }

    this.controls.lock();
  }

  showGameView() {
    this.startScreen?.classList.add(
      "hidden"
    );

    this.pauseScreen?.classList.add(
      "hidden"
    );

    this.hud?.classList.remove(
      "hidden"
    );
  }

  showPauseView() {
    this.pauseScreen?.classList.remove(
      "hidden"
    );

    this.hud?.classList.add(
      "hidden"
    );
  }

  updateControlInstructions() {
    if (!this.isTouchDevice) {
      return;
    }

    if (this.controlsInfo) {
      this.controlsInfo.innerHTML = `
        <span>單指拖曳</span>
        <span>旋轉視角</span>
        <span>橫向遊玩</span>
        <span>場景展示模式</span>
      `;
    }

    if (this.hint) {
      this.hint.textContent =
        "單指拖曳畫面旋轉視角";
    }
  }

  setupTouchLook() {
    const canvas =
      this.renderer.domElement;

    canvas.addEventListener(
      "touchstart",
      (event) => {
        if (!this.hasEnteredScene) {
          return;
        }

        if (
          !this.startScreen?.classList.contains(
            "hidden"
          )
        ) {
          return;
        }

        if (event.touches.length !== 1) {
          this.stopTouchLook();
          return;
        }

        const touch =
          event.touches[0];

        this.mobileLook.active = true;

        this.mobileLook.touchIdentifier =
          touch.identifier;

        this.mobileLook.previousX =
          touch.clientX;

        this.mobileLook.previousY =
          touch.clientY;
      },
      {
        passive: true
      }
    );

    canvas.addEventListener(
      "touchmove",
      (event) => {
        if (!this.mobileLook.active) {
          return;
        }

        const touch =
          this.findActiveTouch(
            event.touches
          );

        if (!touch) {
          this.stopTouchLook();
          return;
        }

        event.preventDefault();

        const deltaX =
          touch.clientX -
          this.mobileLook.previousX;

        const deltaY =
          touch.clientY -
          this.mobileLook.previousY;

        this.mobileLook.previousX =
          touch.clientX;

        this.mobileLook.previousY =
          touch.clientY;

        this.camera.rotation.y -=
          deltaX *
          this.mobileLook.sensitivity;

        this.camera.rotation.x -=
          deltaY *
          this.mobileLook.sensitivity;

        this.camera.rotation.x =
          THREE.MathUtils.clamp(
            this.camera.rotation.x,
            -Math.PI / 2 + 0.12,
            Math.PI / 2 - 0.12
          );
      },
      {
        passive: false
      }
    );

    canvas.addEventListener(
      "touchend",
      (event) => {
        const activeTouch =
          this.findActiveTouch(
            event.touches
          );

        if (!activeTouch) {
          this.stopTouchLook();
        }
      },
      {
        passive: true
      }
    );

    canvas.addEventListener(
      "touchcancel",
      () => {
        this.stopTouchLook();
      },
      {
        passive: true
      }
    );
  }

  findActiveTouch(touchList) {
    for (
      let index = 0;
      index < touchList.length;
      index += 1
    ) {
      const touch =
        touchList[index];

      if (
        touch.identifier ===
        this.mobileLook.touchIdentifier
      ) {
        return touch;
      }
    }

    return null;
  }

  stopTouchLook() {
    this.mobileLook.active = false;

    this.mobileLook.touchIdentifier =
      null;
  }

  updatePlayer(deltaTime) {
    if (this.isTouchDevice) {
      if (!this.hasEnteredScene) {
        return;
      }

      this.camera.position.y =
        this.playerHeight;

      return;
    }

    if (!this.controls.isLocked) {
      return;
    }

    const damping =
      Math.exp(
        -10 * deltaTime
      );

    this.velocity.x *= damping;
    this.velocity.z *= damping;

    this.direction.set(
      Number(
        this.input.isPressed(
          "KeyD"
        )
      ) -
        Number(
          this.input.isPressed(
            "KeyA"
          )
        ),

      0,

      Number(
        this.input.isPressed(
          "KeyW"
        )
      ) -
        Number(
          this.input.isPressed(
            "KeyS"
          )
        )
    );

    if (
      this.direction.lengthSq() > 0
    ) {
      this.direction.normalize();
    }

    const isSprinting =
      this.input.isPressed(
        "ShiftLeft"
      ) ||
      this.input.isPressed(
        "ShiftRight"
      );

    const speed =
      isSprinting
        ? this.sprintSpeed
        : this.normalSpeed;

    this.velocity.x +=
      this.direction.x *
      speed *
      deltaTime *
      8;

    this.velocity.z +=
      this.direction.z *
      speed *
      deltaTime *
      8;

    this.controls.moveRight(
      this.velocity.x *
      deltaTime
    );

    this.controls.moveForward(
      this.velocity.z *
      deltaTime
    );

    this.applyWorldBounds();

    this.camera.position.y =
      this.playerHeight;
  }

  applyWorldBounds() {
    const position =
      this.camera.position;

    position.x =
      THREE.MathUtils.clamp(
        position.x,
        -31,
        31
      );

    position.z =
      THREE.MathUtils.clamp(
        position.z,
        -46,
        35
      );

    const altarDistance =
      Math.hypot(
        position.x,
        position.z + 7
      );

    if (altarDistance < 4.5) {
      const angle =
        Math.atan2(
          position.z + 7,
          position.x
        );

      position.x =
        Math.cos(angle) * 4.5;

      position.z =
        Math.sin(angle) * 4.5 - 7;
    }

    if (
      position.z < -33 &&
      Math.abs(position.x) > 10
    ) {
      position.z = -33;
    }
  }

  animate() {
    const deltaTime =
      Math.min(
        this.clock.getDelta(),
        0.05
      );

    const elapsedTime =
      this.clock.elapsedTime;

    this.updatePlayer(
      deltaTime
    );

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
      window.innerWidth;

    const height =
      window.innerHeight;

    this.camera.aspect =
      width / height;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      width,
      height
    );

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );
  }

  handleVisibilityChange() {
    if (!document.hidden) {
      return;
    }

    this.stopTouchLook();

    if (
      !this.isTouchDevice &&
      this.controls.isLocked
    ) {
      this.controls.unlock();
    }
  }
}
