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
      window.matchMedia(
        "(pointer: coarse)"
      ).matches ||
      navigator.maxTouchPoints > 0;

    this.scene =
      new THREE.Scene();

    this.scene.background =
      new THREE.Color(
        0xcfe8ee
      );

    this.scene.fog =
      new THREE.Fog(
        0xcfe8ee,
        90,
        180
      );

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
      45,
      42,
      50
    );

    /*
     * 固定斜俯視鏡頭偏移。
     * 攝影機和跟隨目標會同步平移，
     * 不再因為 target 改變而旋轉晃動。
     */
    this.cameraOffset =
      new THREE.Vector3(
        45,
        42,
        50
      );

    /*
     * 實際使用的平滑跟隨中心。
     */
    this.cameraFollowTarget =
      new THREE.Vector3(
        0,
        0,
        0
      );

    /*
     * 相機安全區。
     * 足球在安全區內移動時，相機不移動；
     * 超出安全區後才開始平移。
     */
    this.cameraDeadZone = {
      x: 4.5,
      z: 2.8
    };

    this.renderer =
      new THREE.WebGLRenderer({
        antialias:
          !this.isTouchDevice,

        powerPreference:
          "high-performance"
      });

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        this.isTouchDevice
          ? 1.35
          : 2
      )
    );

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.renderer.shadowMap.enabled =
      true;

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

    this.controls.enableDamping =
      false;

    /*
     * 正式比賽鏡頭固定角度。
     * 關閉旋轉與平移，只保留縮放。
     */
    this.controls.enableRotate =
      false;

    this.controls.enablePan =
      false;

    this.controls.enableZoom =
      true;

    this.controls.minZoom =
      0.8;

    this.controls.maxZoom =
      2.2;

    this.controls.zoomSpeed =
      0.8;

    this.controls.update();

    this.world = null;
    this.teams = null;

    this.hasStarted =
      false;

    this.isResetting =
      false;

    this.resetTimer =
      0;

    this.ui =
      new MatchUI();

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

    this.animate =
      this.animate.bind(
        this
      );

    this.handleResize =
      this.handleResize.bind(
        this
      );

    this.handleVisibilityChange =
      this.handleVisibilityChange.bind(
        this
      );
  }

  start() {
    this.world =
      createWorld(
        this.scene,
        {
          isMobile:
            this.isTouchDevice
        }
      );

    this.teams =
      createTeams(
        this.scene,
        this.world
      );

    this.setupInterface();
    this.handleResize();
    this.resetCamera();

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

        this.hasStarted =
          true;

        this.startScreen?.classList.add(
          "hidden"
        );

        this.hud?.classList.remove(
          "hidden"
        );

        this.ui.reset();
        this.resetCamera();
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
    this.cameraFollowTarget.set(
      0,
      0,
      0
    );

    this.controls.target.copy(
      this.cameraFollowTarget
    );

    this.camera.position.copy(
      this.cameraFollowTarget
    );

    this.camera.position.add(
      this.cameraOffset
    );

    this.camera.zoom =
      1;

    this.camera.updateProjectionMatrix();

    this.controls.update();
  }

  updateMatch(
    deltaTime,
    elapsedTime
  ) {
    if (
      !this.hasStarted
    ) {
      return;
    }

    if (
      this.isResetting
    ) {
      this.resetTimer -=
        deltaTime;

      if (
        this.resetTimer <= 0
      ) {
        resetBall(
          this.world
        );

        resetTeams(
          this.teams
        );

        this.isResetting =
          false;

        this.ui.setStatus(
          "比賽進行中"
        );
      }

      return;
    }

    updateTeams(
      this.teams,
      this.world,
      deltaTime,
      elapsedTime
    );

    const goal =
      updateWorld(
        this.world,
        deltaTime,
        elapsedTime
      );

    if (goal) {
      this.ui.addGoal(
        goal
      );

      this.ui.setStatus(
        goal === "red"
          ? "赤櫻得分"
          : "蒼月得分"
      );

      this.isResetting =
        true;

      this.resetTimer =
        1.8;
    }

    this.ui.updateClock(
      deltaTime
    );
  }

  updateCamera(deltaTime) {
    if (
      !this.world?.ball
    ) {
      return;
    }

    const ballPosition =
      this.world.ball.position;

    /*
     * 限制相機跟隨範圍，
     * 避免看到球場外過多區域。
     */
    const ballTargetX =
      THREE.MathUtils.clamp(
        ballPosition.x,
        -20,
        20
      );

    const ballTargetZ =
      THREE.MathUtils.clamp(
        ballPosition.z,
        -9,
        9
      );

    const differenceX =
      ballTargetX -
      this.cameraFollowTarget.x;

    const differenceZ =
      ballTargetZ -
      this.cameraFollowTarget.z;

    const desiredTarget =
      this.cameraFollowTarget.clone();

    /*
     * 足球超出橫向安全區後，
     * 相機才開始橫向移動。
     */
    if (
      Math.abs(
        differenceX
      ) >
      this.cameraDeadZone.x
    ) {
      desiredTarget.x +=
        differenceX -
        Math.sign(
          differenceX
        ) *
        this.cameraDeadZone.x;
    }

    /*
     * 足球超出縱向安全區後，
     * 相機才開始縱向移動。
     */
    if (
      Math.abs(
        differenceZ
      ) >
      this.cameraDeadZone.z
    ) {
      desiredTarget.z +=
        differenceZ -
        Math.sign(
          differenceZ
        ) *
        this.cameraDeadZone.z;
    }

    desiredTarget.x =
      THREE.MathUtils.clamp(
        desiredTarget.x,
        -18,
        18
      );

    desiredTarget.z =
      THREE.MathUtils.clamp(
        desiredTarget.z,
        -7,
        7
      );

    /*
     * 使用較慢的平滑速度，
     * 避免足球快速傳遞時造成鏡頭突然移動。
     */
    const smoothing =
      1 -
      Math.exp(
        -2.2 *
        deltaTime
      );

    this.cameraFollowTarget.lerp(
      desiredTarget,
      smoothing
    );

    /*
     * 相機和 target 使用相同跟隨中心。
     * 兩者保持固定偏移，因此鏡頭不會旋轉。
     */
    const desiredCameraPosition =
      this.cameraFollowTarget
        .clone()
        .add(
          this.cameraOffset
        );

    this.camera.position.copy(
      desiredCameraPosition
    );

    this.controls.target.copy(
      this.cameraFollowTarget
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
      width /
      height;

    let verticalSize;

    if (
      this.isTouchDevice
    ) {
      /*
       * 手機直向：
       * 顯示較大的縱向範圍，
       * 但不強制看到完整球場。
       */
      verticalSize =
        aspect < 0.85
          ? 39
          : 31;
    } else {
      verticalSize =
        aspect < 0.85
          ? 46
          : 37;
    }

    const horizontalSize =
      verticalSize *
      aspect;

    this.camera.left =
      -horizontalSize /
      2;

    this.camera.right =
      horizontalSize /
      2;

    this.camera.top =
      verticalSize /
      2;

    this.camera.bottom =
      -verticalSize /
      2;

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
    if (
      document.hidden
    ) {
      this.clock.stop();
      return;
    }

    this.clock.start();
  }
}
