import * as THREE from "three";

export const FIELD = {
  halfWidth: 32,
  halfDepth: 20,

  playableHalfWidth:
    30.5,

  playableHalfDepth:
    18.8,

  goalX: 32,

  goalHalfWidth:
    4.2
};

const COLORS = {
  sky: 0xcfe8ee,

  plaza: 0xe7dfcf,
  plazaDark: 0xcfc4b1,

  grassA: 0x49b85a,
  grassB: 0x3da950,
  grassEdge: 0x2d873d,

  line: 0xf4f1df,

  red: 0xc94b3f,
  redDark: 0x8f2f2b,

  blue: 0x4f73c9,

  wood: 0x7a4a32,
  woodDark: 0x4b2d22,

  cream: 0xf4e6c8,
  stone: 0xa9a196,

  cherry: 0xf2a8bc,
  cherryLight: 0xffc9d5,

  dark: 0x2b2a30,
  gold: 0xe8bf55,
  white: 0xffffff
};

export function createWorld(
  scene,
  options = {}
) {
  const world = {
    isMobile:
      Boolean(
        options.isMobile
      ),

    ball:
      null,

    ballVelocity:
      new THREE.Vector3(),

    ballState: {
      owner:
        null,

      lastTouch:
        null,

      lockTimer:
        0,

      possessionAge:
        0
    },

    petals:
      null,

    petalPositions:
      null,

    petalSpeeds:
      [],

    lanternMaterials:
      []
  };

  scene.background =
    new THREE.Color(
      COLORS.sky
    );

  scene.fog =
    new THREE.Fog(
      COLORS.sky,
      world.isMobile
        ? 72
        : 90,
      170
    );

  createLighting(
    scene,
    world
  );

  createBase(
    scene
  );

  createPitch(
    scene
  );

  createFieldMarkings(
    scene
  );

  createGoals(
    scene
  );

  createBall(
    scene,
    world
  );

  createSidelineDetails(
    scene
  );

  createGrandstand(
    scene
  );

  createTorii(
    scene
  );

  createFestivalDecor(
    scene,
    world
  );

  createCherryGarden(
    scene
  );

  createBoundary(
    scene
  );

  createPetals(
    scene,
    world
  );

  return world;
}

export function resetBall(
  world
) {
  world.ball.position.set(
    0,
    0.95,
    0
  );

  world.ballVelocity.set(
    0,
    0,
    0
  );

  world.ballState.owner =
    null;

  world.ballState.lastTouch =
    null;

  world.ballState.lockTimer =
    0.35;

  world.ballState.possessionAge =
    0;
}

export function giveBallToPlayer(
  world,
  player
) {
  if (
    !player
  ) {
    return;
  }

  world.ballState.owner =
    player;

  world.ballState.lastTouch =
    player.team;

  world.ballState.lockTimer =
    0.12;

  world.ballState.possessionAge =
    0;

  world.ballVelocity.set(
    0,
    0,
    0
  );

  snapBallToOwner(
    world
  );
}

export function releaseBall(
  world,
  player,
  target,
  speed,
  lift = 0.6
) {
  const direction =
    target
      .clone()
      .sub(
        world.ball.position
      );

  direction.y =
    0;

  if (
    direction.lengthSq() <
    0.001
  ) {
    return false;
  }

  direction.normalize();

  world.ballState.owner =
    null;

  world.ballState.lastTouch =
    player?.team ??
    world.ballState.lastTouch;

  world.ballState.lockTimer =
    0.18;

  world.ballState.possessionAge =
    0;

  world.ballVelocity.copy(
    direction.multiplyScalar(
      speed
    )
  );

  world.ballVelocity.y =
    lift;

  return true;
}

export function tryClaimBall(
  world,
  player,
  radius = 1.2
) {
  if (
    world.ballState.owner ||
    world.ballState.lockTimer >
      0
  ) {
    return false;
  }

  const dx =
    player.position.x -
    world.ball.position.x;

  const dz =
    player.position.z -
    world.ball.position.z;

  const distanceSq =
    dx * dx +
    dz * dz;

  if (
    distanceSq >
    radius * radius
  ) {
    return false;
  }

  giveBallToPlayer(
    world,
    player
  );

  return true;
}

export function updateWorld(
  world,
  deltaTime,
  elapsedTime,
  simulateBall = true
) {
  let goal =
    null;

  if (
    simulateBall
  ) {
    goal =
      updateBall(
        world,
        deltaTime
      );
  }

  updatePetals(
    world,
    deltaTime,
    elapsedTime
  );

  updateLanterns(
    world,
    elapsedTime
  );

  return goal;
}

function updateBall(
  world,
  deltaTime
) {
  world.ballState.lockTimer =
    Math.max(
      0,
      world.ballState.lockTimer -
        deltaTime
    );

  if (
    world.ballState.owner
  ) {
    world.ballState.possessionAge +=
      deltaTime;

    snapBallToOwner(
      world
    );

    return null;
  }

  const ball =
    world.ball;

  world.ballVelocity.y -=
    12 *
    deltaTime;

  ball.position.addScaledVector(
    world.ballVelocity,
    deltaTime
  );

  if (
    ball.position.y <
    0.95
  ) {
    ball.position.y =
      0.95;

    world.ballVelocity.y *=
      -0.22;

    if (
      Math.abs(
        world.ballVelocity.y
      ) <
      0.22
    ) {
      world.ballVelocity.y =
        0;
    }
  }

  const groundFriction =
    Math.exp(
      -1.35 *
      deltaTime
    );

  world.ballVelocity.x *=
    groundFriction;

  world.ballVelocity.z *=
    groundFriction;

  const insideGoal =
    Math.abs(
      ball.position.z
    ) <
    FIELD.goalHalfWidth;

  if (
    ball.position.x >
      FIELD.goalX +
        0.35 &&
    insideGoal
  ) {
    return "red";
  }

  if (
    ball.position.x <
      -FIELD.goalX -
        0.35 &&
    insideGoal
  ) {
    return "blue";
  }

  if (
    ball.position.z >
    FIELD.playableHalfDepth
  ) {
    ball.position.z =
      FIELD.playableHalfDepth;

    world.ballVelocity.z *=
      -0.55;
  }

  if (
    ball.position.z <
    -FIELD.playableHalfDepth
  ) {
    ball.position.z =
      -FIELD.playableHalfDepth;

    world.ballVelocity.z *=
      -0.55;
  }

  if (
    ball.position.x >
      FIELD.playableHalfWidth &&
    !insideGoal
  ) {
    ball.position.x =
      FIELD.playableHalfWidth;

    world.ballVelocity.x *=
      -0.55;
  }

  if (
    ball.position.x <
      -FIELD.playableHalfWidth &&
    !insideGoal
  ) {
    ball.position.x =
      -FIELD.playableHalfWidth;

    world.ballVelocity.x *=
      -0.55;
  }

  ball.rotation.x +=
    world.ballVelocity.z *
    deltaTime *
    0.75;

  ball.rotation.z -=
    world.ballVelocity.x *
    deltaTime *
    0.75;

  return null;
}

function snapBallToOwner(
  world
) {
  const owner =
    world.ballState.owner;

  if (
    !owner
  ) {
    return;
  }

  const forward =
    owner.forward?.lengthSq() >
      0.001
      ? owner.forward
      : new THREE.Vector3(
          owner.team === "red"
            ? 1
            : -1,
          0,
          0
        );

  const desired =
    owner.position
      .clone()
      .addScaledVector(
        forward,
        owner.role === "GK"
          ? 0.75
          : 0.95
      );

  desired.y =
    0.95;

  world.ball.position.lerp(
    desired,
    0.62
  );

  world.ballVelocity.set(
    0,
    0,
    0
  );

  world.ball.rotation.z -=
    owner.velocity.x *
    0.015;

  world.ball.rotation.x +=
    owner.velocity.z *
    0.015;
}

function createLighting(
  scene,
  world
) {
  const hemisphere =
    new THREE.HemisphereLight(
      0xf5fbff,
      0x796f60,
      2.1
    );

  scene.add(
    hemisphere
  );

  const sun =
    new THREE.DirectionalLight(
      0xfff3d6,
      3
    );

  sun.position.set(
    -42,
    68,
    38
  );

  sun.castShadow =
    true;

  const shadowSize =
    world.isMobile
      ? 1024
      : 2048;

  sun.shadow.mapSize.set(
    shadowSize,
    shadowSize
  );

  sun.shadow.camera.left =
    -68;

  sun.shadow.camera.right =
    68;

  sun.shadow.camera.top =
    58;

  sun.shadow.camera.bottom =
    -58;

  sun.shadow.camera.near =
    1;

  sun.shadow.camera.far =
    180;

  sun.shadow.bias =
    -0.00035;

  scene.add(
    sun
  );

  const fill =
    new THREE.DirectionalLight(
      0xb8d9f0,
      0.55
    );

  fill.position.set(
    42,
    28,
    -36
  );

  scene.add(
    fill
  );
}

function createBase(
  scene
) {
  const base =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        104,
        1.6,
        98
      ),
      new THREE.MeshStandardMaterial({
        color:
          COLORS.plaza,

        roughness:
          0.9
      })
    );

  base.position.y =
    -0.8;

  base.receiveShadow =
    true;

  scene.add(
    base
  );

  const lowerBase =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        108,
        1.5,
        102
      ),
      new THREE.MeshStandardMaterial({
        color:
          COLORS.plazaDark,

        roughness:
          0.96
      })
    );

  lowerBase.position.y =
    -1.75;

  lowerBase.receiveShadow =
    true;

  scene.add(
    lowerBase
  );
}

function createPitch(
  scene
) {
  const fieldWidth =
    64;

  const fieldDepth =
    40;

  const stripeCount =
    8;

  const edge =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        fieldWidth + 2.2,
        0.5,
        fieldDepth + 2.2
      ),
      new THREE.MeshStandardMaterial({
        color:
          COLORS.grassEdge,

        roughness:
          0.96
      })
    );

  edge.position.y =
    0.08;

  edge.receiveShadow =
    true;

  scene.add(
    edge
  );

  const stripeWidth =
    fieldWidth /
    stripeCount;

  for (
    let index = 0;
    index < stripeCount;
    index += 1
  ) {
    const stripe =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          stripeWidth + 0.03,
          0.28,
          fieldDepth
        ),
        new THREE.MeshStandardMaterial({
          color:
            index % 2 === 0
              ? COLORS.grassA
              : COLORS.grassB,

          roughness:
            0.94
        })
      );

    stripe.position.set(
      -fieldWidth / 2 +
        stripeWidth / 2 +
        index *
          stripeWidth,
      0.38,
      0
    );

    stripe.receiveShadow =
      true;

    scene.add(
      stripe
    );
  }
}

function createFieldMarkings(
  scene
) {
  const material =
    new THREE.MeshBasicMaterial({
      color:
        COLORS.line
    });

  const y =
    0.55;

  addFlatLine(
    scene,
    0,
    y,
    -20,
    64,
    0.18,
    material
  );

  addFlatLine(
    scene,
    0,
    y,
    20,
    64,
    0.18,
    material
  );

  addFlatLine(
    scene,
    -32,
    y,
    0,
    0.18,
    40,
    material
  );

  addFlatLine(
    scene,
    32,
    y,
    0,
    0.18,
    40,
    material
  );

  addFlatLine(
    scene,
    0,
    y,
    0,
    0.18,
    40,
    material
  );

  const centerCircle =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        5.1,
        0.11,
        6,
        64
      ),
      material
    );

  centerCircle.rotation.x =
    -Math.PI / 2;

  centerCircle.position.y =
    y + 0.01;

  scene.add(
    centerCircle
  );

  const centerSpot =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.2,
        0.2,
        0.04,
        16
      ),
      material
    );

  centerSpot.position.y =
    y + 0.02;

  scene.add(
    centerSpot
  );

  createPenaltyArea(
    scene,
    -32,
    1,
    y,
    material
  );

  createPenaltyArea(
    scene,
    32,
    -1,
    y,
    material
  );
}

function createPenaltyArea(
  scene,
  goalX,
  direction,
  y,
  material
) {
  const outerDepth =
    17;

  const outerLength =
    10;

  const innerDepth =
    8;

  const innerLength =
    4;

  const outerCenterX =
    goalX +
    direction *
      outerLength /
      2;

  const innerCenterX =
    goalX +
    direction *
      innerLength /
      2;

  addFlatLine(
    scene,
    outerCenterX,
    y,
    -outerDepth / 2,
    outerLength,
    0.16,
    material
  );

  addFlatLine(
    scene,
    outerCenterX,
    y,
    outerDepth / 2,
    outerLength,
    0.16,
    material
  );

  addFlatLine(
    scene,
    goalX +
      direction *
        outerLength,
    y,
    0,
    0.16,
    outerDepth,
    material
  );

  addFlatLine(
    scene,
    innerCenterX,
    y,
    -innerDepth / 2,
    innerLength,
    0.16,
    material
  );

  addFlatLine(
    scene,
    innerCenterX,
    y,
    innerDepth / 2,
    innerLength,
    0.16,
    material
  );

  addFlatLine(
    scene,
    goalX +
      direction *
        innerLength,
    y,
    0,
    0.16,
    innerDepth,
    material
  );
}

function addFlatLine(
  scene,
  x,
  y,
  z,
  width,
  depth,
  material
) {
  const line =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        0.04,
        depth
      ),
      material
    );

  line.position.set(
    x,
    y,
    z
  );

  scene.add(
    line
  );
}

function createGoals(
  scene
) {
  createGoal(
    scene,
    -32,
    -1
  );

  createGoal(
    scene,
    32,
    1
  );
}

function createGoal(
  scene,
  x,
  direction
) {
  const group =
    new THREE.Group();

  group.position.x =
    x;

  const postMaterial =
    new THREE.MeshStandardMaterial({
      color:
        COLORS.red,

      roughness:
        0.52
    });

  const netMaterial =
    new THREE.MeshBasicMaterial({
      color:
        COLORS.cream,

      transparent:
        true,

      opacity:
        0.38
    });

  const goalWidth =
    8.4;

  const goalHeight =
    3.5;

  const goalDepth =
    2.4;

  const leftPost =
    createBox(
      0.22,
      goalHeight,
      0.22,
      postMaterial
    );

  leftPost.position.set(
    0,
    goalHeight / 2 + 0.48,
    -goalWidth / 2
  );

  const rightPost =
    leftPost.clone();

  rightPost.position.z =
    goalWidth / 2;

  const crossbar =
    createBox(
      0.22,
      0.22,
      goalWidth,
      postMaterial
    );

  crossbar.position.set(
    0,
    goalHeight + 0.48,
    0
  );

  const backTop =
    createBox(
      0.14,
      0.14,
      goalWidth,
      postMaterial
    );

  backTop.position.set(
    direction *
      goalDepth,
    goalHeight + 0.48,
    0
  );

  group.add(
    leftPost,
    rightPost,
    crossbar,
    backTop
  );

  for (
    let index = 0;
    index <= 5;
    index += 1
  ) {
    const z =
      -goalWidth / 2 +
      index *
        (
          goalWidth /
          5
        );

    const netLine =
      createBox(
        goalDepth,
        0.03,
        0.03,
        netMaterial
      );

    netLine.position.set(
      direction *
        goalDepth /
        2,
      goalHeight + 0.42,
      z
    );

    group.add(
      netLine
    );
  }

  group.traverse(
    (object) => {
      if (
        object.isMesh
      ) {
        object.castShadow =
          true;
      }
    }
  );

  scene.add(
    group
  );
}

function createBall(
  scene,
  world
) {
  const ball =
    new THREE.Mesh(
      new THREE.IcosahedronGeometry(
        0.48,
        2
      ),
      new THREE.MeshStandardMaterial({
        color:
          COLORS.white,

        roughness:
          0.48
      })
    );

  ball.position.set(
    0,
    0.95,
    0
  );

  ball.castShadow =
    true;

  scene.add(
    ball
  );

  world.ball =
    ball;
}

function createSidelineDetails(
  scene
) {
  const material =
    new THREE.MeshStandardMaterial({
      color:
        COLORS.wood,

      roughness:
        0.78
    });

  for (
    const x of [
      -13,
      13
    ]
  ) {
    const bench =
      createBox(
        8.8,
        0.35,
        1.2,
        material
      );

    bench.position.set(
      x,
      1.1,
      23.5
    );

    bench.castShadow =
      true;

    scene.add(
      bench
    );
  }
}

function createGrandstand(
  scene
) {
  const stand =
    new THREE.Group();

  stand.position.set(
    0,
    0,
    -29.2
  );

  const stoneMaterial =
    new THREE.MeshStandardMaterial({
      color:
        COLORS.stone,

      roughness:
        0.94
    });

  const spectatorColors = [
    0xc94b3f,
    0x4f73c9,
    0xe8bf55,
    0x6fa65d,
    0xf2a8bc,
    0xf4e6c8
  ];

  for (
    let row = 0;
    row < 5;
    row += 1
  ) {
    const step =
      createBox(
        72,
        0.75 +
          row *
            0.62,
        2.15,
        stoneMaterial
      );

    step.position.set(
      0,
      0.38 +
        row *
          0.31,
      -row *
        2.15
    );

    step.receiveShadow =
      true;

    stand.add(
      step
    );

    for (
      let index = 0;
      index < 28;
      index += 1
    ) {
      if (
        (
          index +
          row
        ) %
          7 ===
        0
      ) {
        continue;
      }

      const person =
        new THREE.Mesh(
          new THREE.CapsuleGeometry(
            0.24,
            0.45,
            3,
            6
          ),
          new THREE.MeshStandardMaterial({
            color:
              spectatorColors[
                (
                  index +
                  row *
                    3
                ) %
                  spectatorColors.length
              ],

            roughness:
              0.82
          })
        );

      person.position.set(
        -33 +
          index *
            2.45,
        1.7 +
          row *
            0.65,
        -row *
          2.15 +
          0.2
      );

      stand.add(
        person
      );
    }
  }

  const scoreboard =
    createScoreboard();

  scoreboard.position.set(
    0,
    7.4,
    -10.7
  );

  stand.add(
    scoreboard
  );

  scene.add(
    stand
  );
}

function createScoreboard() {
  const group =
    new THREE.Group();

  const frame =
    createBox(
      15,
      4.2,
      0.8,
      new THREE.MeshStandardMaterial({
        color:
          COLORS.dark,

        roughness:
          0.58
      })
    );

  group.add(
    frame
  );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    1024;

  canvas.height =
    256;

  const context =
    canvas.getContext(
      "2d"
    );

  if (
    context
  ) {
    context.fillStyle =
      "#202126";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle =
      "#f0dfb8";

    context.font =
      "700 78px sans-serif";

    context.textAlign =
      "center";

    context.fillText(
      "SAKURA ARENA",
      512,
      92
    );

    context.fillStyle =
      "#ffffff";

    context.font =
      "700 86px sans-serif";

    context.fillText(
      "11 VS 11 · V0.5",
      512,
      205
    );
  }

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  const screen =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        13.7,
        3.2
      ),
      new THREE.MeshBasicMaterial({
        map:
          texture
      })
    );

  screen.position.z =
    0.42;

  group.add(
    screen
  );

  return group;
}

function createTorii(
  scene
) {
  const group =
    new THREE.Group();

  group.position.set(
    -13,
    0,
    -43.2
  );

  const redMaterial =
    new THREE.MeshStandardMaterial({
      color:
        COLORS.red,

      roughness:
        0.56
    });

  const leftPost =
    createBox(
      0.9,
      8.8,
      0.9,
      redMaterial
    );

  leftPost.position.set(
    -4.3,
    4.4,
    0
  );

  const rightPost =
    leftPost.clone();

  rightPost.position.x =
    4.3;

  const lowerBeam =
    createBox(
      10.4,
      0.75,
      1,
      redMaterial
    );

  lowerBeam.position.y =
    6.5;

  const topBeam =
    createBox(
      12.4,
      0.9,
      1.25,
      redMaterial
    );

  topBeam.position.y =
    8.15;

  group.add(
    leftPost,
    rightPost,
    lowerBeam,
    topBeam
  );

  scene.add(
    group
  );
}

function createFestivalDecor(
  scene,
  world
) {
  for (
    const z of [
      -25.5,
      25.5
    ]
  ) {
    for (
      let index = 0;
      index < 18;
      index += 1
    ) {
      const material =
        new THREE.MeshStandardMaterial({
          color:
            index % 3 === 0
              ? COLORS.red
              : COLORS.cream,

          emissive:
            index % 3 === 0
              ? COLORS.red
              : COLORS.gold,

          emissiveIntensity:
            0.42,

          roughness:
            0.6
        });

      const lantern =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.34,
            0.34,
            0.8,
            10
          ),
          material
        );

      lantern.position.set(
        -32 +
          index *
            3.8,
        4.3,
        z
      );

      scene.add(
        lantern
      );

      world.lanternMaterials.push(
        material
      );
    }
  }
}

function createCherryGarden(
  scene
) {
  const positions = [
    [-45, -27, 1.15],
    [-38, -35, 1.05],
    [34, -37, 1.2],
    [44, -28, 1],
    [-45, 30, 1.1],
    [43, 29, 1.1]
  ];

  positions.forEach(
    (
      [
        x,
        z,
        scale
      ],
      index
    ) => {
      const tree =
        createCherryTree(
          index
        );

      tree.position.set(
        x,
        0,
        z
      );

      tree.scale.setScalar(
        scale
      );

      scene.add(
        tree
      );
    }
  );
}

function createCherryTree(
  seed
) {
  const group =
    new THREE.Group();

  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.62,
        0.9,
        6.8,
        8
      ),
      new THREE.MeshStandardMaterial({
        color:
          COLORS.woodDark,

        roughness:
          0.9
      })
    );

  trunk.position.y =
    3.4;

  trunk.castShadow =
    true;

  group.add(
    trunk
  );

  const materials = [
    new THREE.MeshStandardMaterial({
      color:
        COLORS.cherry,

      roughness:
        0.86
    }),

    new THREE.MeshStandardMaterial({
      color:
        COLORS.cherryLight,

      roughness:
        0.86
    })
  ];

  for (
    let index = 0;
    index < 10;
    index += 1
  ) {
    const angle =
      index *
        2.399 +
      seed;

    const blossom =
      new THREE.Mesh(
        new THREE.IcosahedronGeometry(
          1.7 +
            pseudoRandom(
              index +
                seed
            ) *
              0.8,
          1
        ),
        materials[
          index %
            materials.length
        ]
      );

    blossom.position.set(
      Math.cos(
        angle
      ) *
        (
          1.4 +
          pseudoRandom(
            index
          ) *
            3.4
        ),

      6.6 +
        pseudoRandom(
          seed +
            index *
              2.7
        ) *
          3.1,

      Math.sin(
        angle
      ) *
        (
          1.4 +
          pseudoRandom(
            index +
              4
          ) *
            3.4
        )
    );

    blossom.castShadow =
      true;

    group.add(
      blossom
    );
  }

  return group;
}

function createBoundary(
  scene
) {
  const wallMaterial =
    new THREE.MeshStandardMaterial({
      color:
        COLORS.cream,

      roughness:
        0.92
    });

  for (
    const z of [
      -47.5,
      47.5
    ]
  ) {
    const wall =
      createBox(
        100,
        1.2,
        0.8,
        wallMaterial
      );

    wall.position.set(
      0,
      0.6,
      z
    );

    scene.add(
      wall
    );
  }

  for (
    const x of [
      -50.5,
      50.5
    ]
  ) {
    const wall =
      createBox(
        0.8,
        1.2,
        94,
        wallMaterial
      );

    wall.position.set(
      x,
      0.6,
      0
    );

    scene.add(
      wall
    );
  }
}

function createPetals(
  scene,
  world
) {
  const count =
    world.isMobile
      ? 150
      : 320;

  const positions =
    new Float32Array(
      count *
        3
    );

  const speeds =
    [];

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    positions[
      index *
        3
    ] =
      randomRange(
        index *
          2.1,
        -50,
        50
      );

    positions[
      index *
        3 +
        1
    ] =
      randomRange(
        index *
          3.7,
        1,
        18
      );

    positions[
      index *
        3 +
        2
    ] =
      randomRange(
        index *
          5.3,
        -35,
        35
      );

    speeds.push(
      randomRange(
        index *
          7.1,
        0.35,
        0.95
      )
    );
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  const petals =
    new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color:
          COLORS.cherryLight,

        size:
          world.isMobile
            ? 0.17
            : 0.21,

        transparent:
          true,

        opacity:
          0.72,

        depthWrite:
          false
      })
    );

  scene.add(
    petals
  );

  world.petals =
    petals;

  world.petalPositions =
    positions;

  world.petalSpeeds =
    speeds;
}

function updatePetals(
  world,
  deltaTime,
  elapsedTime
) {
  if (
    !world.petals ||
    !world.petalPositions
  ) {
    return;
  }

  const positions =
    world.petalPositions;

  for (
    let index = 0;
    index <
      positions.length /
        3;
    index += 1
  ) {
    const xIndex =
      index *
      3;

    const yIndex =
      xIndex +
      1;

    const zIndex =
      xIndex +
      2;

    positions[yIndex] -=
      world.petalSpeeds[index] *
      deltaTime;

    positions[xIndex] +=
      Math.sin(
        elapsedTime *
          0.8 +
          index
      ) *
      deltaTime *
      0.3;

    positions[zIndex] +=
      Math.cos(
        elapsedTime *
          0.55 +
          index *
            0.7
      ) *
      deltaTime *
      0.16;

    if (
      positions[yIndex] <
      0.8
    ) {
      positions[yIndex] =
        randomRange(
          index *
            4.2 +
            elapsedTime,
          12,
          22
        );
    }
  }

  world.petals.geometry
    .attributes
    .position
    .needsUpdate =
      true;
}

function updateLanterns(
  world,
  elapsedTime
) {
  world.lanternMaterials.forEach(
    (
      material,
      index
    ) => {
      material.emissiveIntensity =
        0.36 +
        Math.sin(
          elapsedTime *
            2.4 +
            index
        ) *
          0.08;
    }
  );
}

function createBox(
  width,
  height,
  depth,
  material
) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      height,
      depth
    ),
    material
  );
}

function pseudoRandom(
  seed
) {
  const value =
    Math.sin(
      seed *
        12.9898 +
        78.233
    ) *
    43758.5453;

  return value -
    Math.floor(
      value
    );
}

function randomRange(
  seed,
  min,
  max
) {
  return min +
    pseudoRandom(
      seed
    ) *
      (
        max -
        min
      );
}
