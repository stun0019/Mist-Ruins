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
  resetTeams,
  setKickoffPossession
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

    this.cameraOffset =
      new THREE.Vector3(
        45,
        42,
        50
      );

    this.cameraFollowTarget =
      new THREE.Vector3();

    this.cameraDeadZone = {
      x: 6,
      z: 4
    };

    this.camera.position.copy(
      this.cameraOffset
    );

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
          ? 1.3
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

    this.controls.enableRotate =
      false;

    this.controls.enablePan =
      false;

    this.controls.enableZoom =
      true;

    this.controls.minZoom =
      0.85;

    this.controls.maxZoom =
      2.1;

    this.controls.zoomSpeed =
      0.75;

    this.controls.update();

    this.world = null;
    this.teams = null;

    this.hasStarted =
      false;

    this.isResetting =
      false;

    this.resetTimer =
      0;

    this.nextKickoffTeam =
      "red";

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
        this.scene
      );

    resetBall(
      this.world
    );

    resetTeams(
      this.teams
    );

    setKickoffPossession(
      this.teams,
      this.world,
      "red"
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

        resetBall(
          this.world
        );

        resetTeams(
          this.teams
        );

        setKickoffPossession(
          this.teams,
          this.world,
          "red"
        );

        this.hasStarted =
          true;

        this.isResetting =
          false;

        this.resetTimer =
          0;

        this.startScreen?.classList.add(
          "hidden"
        );

        this.hud?.classList.remove(
          "hidden"
        );

        this.ui.reset();

        this.ui.setPossession(
          "red"
        );

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

    this.camera.position.copy(
      this.cameraFollowTarget
    );

    this.camera.position.add(
      this.cameraOffset
    );

    this.controls.target.copy(
      this.cameraFollowTarget
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
      updateWorld(
        this.world,
        deltaTime,
        elapsedTime,
        false
      );

      return;
    }

    if (
      this.isResetting
    ) {
      updateWorld(
        this.world,
        deltaTime,
        elapsedTime,
        false
      );

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

        setKickoffPossession(
          this.teams,
          this.world,
          this.nextKickoffTeam
        );

        this.ui.setPossession(
          this.nextKickoffTeam
        );

        this.ui.setStatus(
          "比賽進行中"
        );

        this.isResetting =
          false;
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
        elapsedTime,
        true
      );

    const possessionTeam =
      this.world
        .ballState
        .owner
        ?.team ??
      null;

    this.ui.setPossession(
      possessionTeam
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

      this.nextKickoffTeam =
        goal === "red"
          ? "blue"
          : "red";

      this.isResetting =
        true;

      this.resetTimer =
        1.6;
    }

    this.ui.updateClock(
      deltaTime
    );
  }

  updateCamera(
    deltaTime
  ) {
    if (
      !this.world?.ball
    ) {
      return;
    }

    const focus =
      this.world
        .ballState
        .owner
        ?.position ??
      this.world.ball.position;

    const ballTargetX =
      THREE.MathUtils.clamp(
        focus.x,
        -21,
        21
      );

    const ballTargetZ =
      THREE.MathUtils.clamp(
        focus.z,
        -10,
        10
      );

    const differenceX =
      ballTargetX -
      this.cameraFollowTarget.x;

    const differenceZ =
      ballTargetZ -
      this.cameraFollowTarget.z;

    const desiredTarget =
      this.cameraFollowTarget.clone();

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
        -6,
        6
      );

    const smoothing =
      1 -
      Math.exp(
        -1.7 *
        deltaTime
      );

    this.cameraFollowTarget.lerp(
      desiredTarget,
      smoothing
    );

    this.camera.position.copy(
      this.cameraFollowTarget
    );

    this.camera.position.add(
      this.cameraOffset
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
      verticalSize =
        aspect < 0.85
          ? 39
          : 31;
    } else {
      verticalSize =
        aspect < 0.85
          ? 45
          : 37;
    }

    const horizontalSize =
      verticalSize *
      aspect;

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
          ? 1.3
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
