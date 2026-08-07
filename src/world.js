import * as THREE from "three";

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

  wood: 0x7a4a32,
  woodDark: 0x4b2d22,

  cream: 0xf4e6c8,

  stone: 0xa9a196,
  stoneDark: 0x746e67,

  cherry: 0xf2a8bc,
  cherryLight: 0xffc9d5,

  leaf: 0x6fa65d,
  water: 0x7bc8d2,

  dark: 0x2b2a30,
  gold: 0xe8bf55,
  blue: 0x4f73c9,
  white: 0xffffff
};

export function createWorld(
  scene,
  options = {}
) {
  const isMobile =
    Boolean(
      options.isMobile
    );

  const world = {
    isMobile,

    petals: null,
    petalPositions: null,
    petalSpeeds: [],

    flags: [],
    lanternMaterials: [],
    cloudGroups: []
  };

  scene.background =
    new THREE.Color(
      COLORS.sky
    );

  scene.fog =
    new THREE.Fog(
      COLORS.sky,
      isMobile ? 82 : 96,
      180
    );

  createLighting(
    scene,
    world
  );

  createBase(scene);
  createPitch(scene);
  createFieldMarkings(scene);
  createGoals(scene);
  createSidelineDetails(scene);
  createGrandstand(scene);
  createTorii(scene);

  createFestivalDecor(
    scene,
    world
  );

  createCherryGarden(scene);
  createPagoda(scene);
  createBoundary(scene);

  createPetals(
    scene,
    world
  );

  createClouds(
    scene,
    world
  );

  return world;
}

function createLighting(
  scene,
  world
) {
  const hemisphere =
    new THREE.HemisphereLight(
      0xf5fbff,
      0x796f60,
      2.2
    );

  scene.add(
    hemisphere
  );

  const sun =
    new THREE.DirectionalLight(
      0xfff3d6,
      3.1
    );

  sun.position.set(
    -42,
    68,
    38
  );

  sun.castShadow = true;

  const shadowSize =
    world.isMobile
      ? 1024
      : 2048;

  sun.shadow.mapSize.set(
    shadowSize,
    shadowSize
  );

  sun.shadow.camera.left = -68;
  sun.shadow.camera.right = 68;
  sun.shadow.camera.top = 58;
  sun.shadow.camera.bottom = -58;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 180;

  sun.shadow.bias =
    -0.00035;

  scene.add(
    sun
  );

  const fill =
    new THREE.DirectionalLight(
      0xb7ddff,
      0.75
    );

  fill.position.set(
    50,
    25,
    -45
  );

  scene.add(
    fill
  );
}

function createBase(scene) {
  const base =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        104,
        1.6,
        98
      ),
      new THREE.MeshStandardMaterial({
        color: COLORS.plaza,
        roughness: 0.9,
        metalness: 0
      })
    );

  base.position.y = -0.8;
  base.receiveShadow = true;

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
        color: COLORS.plazaDark,
        roughness: 0.96
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

function createPitch(scene) {
  const fieldWidth = 64;
  const fieldDepth = 40;
  const stripeCount = 8;

  const stripeWidth =
    fieldWidth /
    stripeCount;

  const edge =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        fieldWidth + 2.2,
        0.5,
        fieldDepth + 2.2
      ),
      new THREE.MeshStandardMaterial({
        color: COLORS.grassEdge,
        roughness: 0.96
      })
    );

  edge.position.y = 0.08;
  edge.receiveShadow = true;

  scene.add(
    edge
  );

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
          roughness: 0.94
        })
      );

    stripe.position.set(
      -fieldWidth / 2 +
        stripeWidth / 2 +
        index * stripeWidth,
      0.38,
      0
    );

    stripe.receiveShadow = true;

    scene.add(
      stripe
    );
  }
}

function createFieldMarkings(scene) {
  const material =
    new THREE.MeshBasicMaterial({
      color: COLORS.line
    });

  const y = 0.55;

  createLineBox(
    scene,
    64,
    40,
    y,
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
        0.22,
        0.22,
        0.04,
        20
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

  createCornerArc(
    scene,
    -32,
    -20,
    0,
    material
  );

  createCornerArc(
    scene,
    -32,
    20,
    Math.PI / 2,
    material
  );

  createCornerArc(
    scene,
    32,
    20,
    Math.PI,
    material
  );

  createCornerArc(
    scene,
    32,
    -20,
    Math.PI * 1.5,
    material
  );
}

function createLineBox(
  scene,
  width,
  depth,
  y,
  material
) {
  addFlatLine(
    scene,
    0,
    y,
    -depth / 2,
    width,
    0.18,
    material
  );

  addFlatLine(
    scene,
    0,
    y,
    depth / 2,
    width,
    0.18,
    material
  );

  addFlatLine(
    scene,
    -width / 2,
    y,
    0,
    0.18,
    depth,
    material
  );

  addFlatLine(
    scene,
    width / 2,
    y,
    0,
    0.18,
    depth,
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
  const outerDepth = 17;
  const outerLength = 10;

  const innerDepth = 8;
  const innerLength = 4;

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

  const spot =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.17,
        0.17,
        0.04,
        16
      ),
      material
    );

  spot.position.set(
    goalX +
      direction *
        7.5,
    y + 0.02,
    0
  );

  scene.add(
    spot
  );
}

function createCornerArc(
  scene,
  x,
  z,
  rotation,
  material
) {
  const arc =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        1.15,
        0.09,
        5,
        24,
        Math.PI / 2
      ),
      material
    );

  arc.rotation.x =
    -Math.PI / 2;

  arc.rotation.z =
    rotation;

  arc.position.set(
    x,
    0.56,
    z
  );

  scene.add(
    arc
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

function createGoals(scene) {
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

  group.position.x = x;

  const postMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.red,
      roughness: 0.52,
      metalness: 0.08
    });

  const netMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xf4f0df,
      transparent: true,
      opacity: 0.48
    });

  const goalWidth = 8.4;
  const goalHeight = 3.5;
  const goalDepth = 2.4;

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

  const backLeft =
    createBox(
      0.14,
      goalHeight,
      0.14,
      postMaterial
    );

  backLeft.position.set(
    direction *
      goalDepth,
    goalHeight / 2 + 0.48,
    -goalWidth / 2
  );

  const backRight =
    backLeft.clone();

  backRight.position.z =
    goalWidth / 2;

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
    backLeft,
    backRight,
    backTop
  );

  for (
    let index = 0;
    index <= 7;
    index += 1
  ) {
    const z =
      -goalWidth / 2 +
      goalWidth /
        7 *
        index;

    const line =
      createBox(
        goalDepth,
        0.035,
        0.035,
        netMaterial
      );

    line.position.set(
      direction *
        goalDepth /
        2,
      goalHeight + 0.46,
      z
    );

    group.add(
      line
    );
  }

  for (
    let index = 0;
    index <= 4;
    index += 1
  ) {
    const y =
      0.48 +
      goalHeight /
        4 *
        index;

    const line =
      createBox(
        goalDepth,
        0.035,
        0.035,
        netMaterial
      );

    line.position.set(
      direction *
        goalDepth /
        2,
      y,
      -goalWidth / 2
    );

    group.add(
      line
    );

    const second =
      line.clone();

    second.position.z =
      goalWidth / 2;

    group.add(
      second
    );
  }

  group.traverse(
    (object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    }
  );

  scene.add(
    group
  );
}

function createSidelineDetails(scene) {
  const benchMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.wood,
      roughness: 0.78
    });

  createBench(
    scene,
    -13,
    23.5,
    benchMaterial
  );

  createBench(
    scene,
    13,
    23.5,
    benchMaterial
  );

  for (
    const x of [
      -24,
      -8,
      8,
      24
    ]
  ) {
    createCornerFlag(
      scene,
      x,
      -22.4,
      x % 16 === 0
        ? COLORS.blue
        : COLORS.red
    );
  }

  createCornerFlag(
    scene,
    -31.2,
    20.8,
    COLORS.red
  );

  createCornerFlag(
    scene,
    31.2,
    20.8,
    COLORS.blue
  );

  const ballRack =
    new THREE.Group();

  ballRack.position.set(
    0,
    0,
    24.5
  );

  const rack =
    createBox(
      4.8,
      0.45,
      1.2,
      new THREE.MeshStandardMaterial({
        color: COLORS.woodDark,
        roughness: 0.8
      })
    );

  rack.position.y = 0.5;

  ballRack.add(
    rack
  );

  for (
    let index = 0;
    index < 5;
    index += 1
  ) {
    const ball =
      new THREE.Mesh(
        new THREE.IcosahedronGeometry(
          0.34,
          1
        ),
        new THREE.MeshStandardMaterial({
          color:
            index % 2 === 0
              ? COLORS.white
              : COLORS.gold,
          roughness: 0.72
        })
      );

    ball.position.set(
      -1.6 +
        index *
          0.8,
      1.05,
      0
    );

    ball.castShadow = true;

    ballRack.add(
      ball
    );
  }

  scene.add(
    ballRack
  );
}

function createBench(
  scene,
  x,
  z,
  material
) {
  const group =
    new THREE.Group();

  group.position.set(
    x,
    0,
    z
  );

  const seat =
    createBox(
      8.8,
      0.35,
      1.2,
      material
    );

  seat.position.y = 1.1;

  const back =
    createBox(
      8.8,
      1.5,
      0.28,
      material
    );

  back.position.set(
    0,
    1.9,
    0.45
  );

  const legLeft =
    createBox(
      0.35,
      1.1,
      0.7,
      material
    );

  legLeft.position.set(
    -3.4,
    0.55,
    0
  );

  const legRight =
    legLeft.clone();

  legRight.position.x =
    3.4;

  group.add(
    seat,
    back,
    legLeft,
    legRight
  );

  group.traverse(
    (object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    }
  );

  scene.add(
    group
  );
}

function createCornerFlag(
  scene,
  x,
  z,
  color
) {
  const group =
    new THREE.Group();

  group.position.set(
    x,
    0,
    z
  );

  const pole =
    createBox(
      0.1,
      2.8,
      0.1,
      new THREE.MeshStandardMaterial({
        color: COLORS.cream,
        roughness: 0.55
      })
    );

  pole.position.y = 1.7;

  const flagMaterial =
    new THREE.MeshStandardMaterial({
      color,
      side: THREE.DoubleSide,
      roughness: 0.7
    });

  const flag =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        1.1,
        0.65
      ),
      flagMaterial
    );

  flag.position.set(
    0.58,
    2.65,
    0
  );

  group.add(
    pole,
    flag
  );

  scene.add(
    group
  );
}

function createGrandstand(scene) {
  const stand =
    new THREE.Group();

  stand.position.set(
    0,
    0,
    -29.2
  );

  const stoneMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.stone,
      roughness: 0.94
    });

  const stepDepth = 2.15;

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
        stepDepth,
        stoneMaterial
      );

    step.position.set(
      0,
      0.38 +
        row *
          0.31,
      -row *
        stepDepth
    );

    step.castShadow = true;
    step.receiveShadow = true;

    stand.add(
      step
    );

    createSpectatorRow(
      stand,
      row,
      -row *
        stepDepth +
        0.2
    );
  }

  const backWall =
    createBox(
      75,
      4.4,
      1.2,
      new THREE.MeshStandardMaterial({
        color: COLORS.cream,
        roughness: 0.9
      })
    );

  backWall.position.set(
    0,
    2.2,
    -11.5
  );

  stand.add(
    backWall
  );

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

function createSpectatorRow(
  parent,
  row,
  z
) {
  const colors = [
    0xc94b3f,
    0x4f73c9,
    0xe8bf55,
    0x6fa65d,
    0xf2a8bc,
    0xf4e6c8
  ];

  const count = 28;

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    if (
      (index + row) %
        7 ===
      0
    ) {
      continue;
    }

    const person =
      new THREE.Group();

    person.position.set(
      -33 +
        index *
          2.45,
      1.2 +
        row *
          0.65,
      z
    );

    const body =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.28,
          0.48,
          3,
          6
        ),
        new THREE.MeshStandardMaterial({
          color:
            colors[
              (
                index +
                row *
                  3
              ) %
                colors.length
            ],
          roughness: 0.82
        })
      );

    body.position.y = 0.55;

    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.22,
          8,
          6
        ),
        new THREE.MeshStandardMaterial({
          color: 0xe6ba94,
          roughness: 0.9
        })
      );

    head.position.y = 1.18;

    person.add(
      body,
      head
    );

    parent.add(
      person
    );
  }
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
        color: COLORS.dark,
        roughness: 0.58
      })
    );

  group.add(
    frame
  );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 1024;
  canvas.height = 256;

  const context =
    canvas.getContext(
      "2d"
    );

  if (context) {
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
      "700 82px sans-serif";

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
      "700 92px sans-serif";

    context.fillText(
      "0   -   0",
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
        map: texture
      })
    );

  screen.position.z = 0.42;

  group.add(
    screen
  );

  return group;
}

function createTorii(scene) {
  const group =
    new THREE.Group();

  group.position.set(
    -13,
    0,
    -43.2
  );

  const redMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.red,
      roughness: 0.56
    });

  const darkMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.redDark,
      roughness: 0.65
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

  const cap =
    createBox(
      13.8,
      0.42,
      1.45,
      darkMaterial
    );

  cap.position.y =
    8.75;

  const centerPlaque =
    createBox(
      2.5,
      1.5,
      0.35,
      darkMaterial
    );

  centerPlaque.position.set(
    0,
    7.2,
    0.68
  );

  group.add(
    leftPost,
    rightPost,
    lowerBeam,
    topBeam,
    cap,
    centerPlaque
  );

  group.traverse(
    (object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    }
  );

  scene.add(
    group
  );
}

function createFestivalDecor(
  scene,
  world
) {
  const ropeMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.woodDark,
      roughness: 0.8
    });

  for (
    const z of [
      -25.5,
      25.5
    ]
  ) {
    const rope =
      createBox(
        68,
        0.07,
        0.07,
        ropeMaterial
      );

    rope.position.set(
      0,
      5.2,
      z
    );

    scene.add(
      rope
    );

    for (
      let index = 0;
      index < 18;
      index += 1
    ) {
      const x =
        -32 +
        index *
          3.8;

      const lantern =
        createLantern(
          index
        );

      lantern.position.set(
        x,
        4.3 +
          Math.sin(
            index *
              0.7
          ) *
            0.18,
        z
      );

      scene.add(
        lantern
      );

      world.lanternMaterials.push(
        lantern.userData
          .glowMaterial
      );
    }
  }

  for (
    const x of [
      -43,
      43
    ]
  ) {
    for (
      let index = 0;
      index < 6;
      index += 1
    ) {
      const banner =
        createBanner(
          index % 2 === 0
            ? COLORS.red
            : COLORS.blue
        );

      banner.position.set(
        x,
        0,
        -19 +
          index *
            7.5
      );

      banner.rotation.y =
        x < 0
          ? Math.PI / 2
          : -Math.PI / 2;

      scene.add(
        banner
      );

      world.flags.push(
        banner.userData.flag
      );
    }
  }
}

function createLantern(index) {
  const group =
    new THREE.Group();

  const glowMaterial =
    new THREE.MeshStandardMaterial({
      color:
        index % 3 === 0
          ? COLORS.red
          : COLORS.cream,

      emissive:
        index % 3 === 0
          ? COLORS.red
          : COLORS.gold,

      emissiveIntensity: 0.42,
      roughness: 0.6
    });

  const lantern =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.34,
        0.34,
        0.8,
        10
      ),
      glowMaterial
    );

  const capMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.woodDark,
      roughness: 0.7
    });

  const top =
    createBox(
      0.52,
      0.1,
      0.52,
      capMaterial
    );

  top.position.y = 0.46;

  const bottom =
    top.clone();

  bottom.position.y =
    -0.46;

  group.add(
    lantern,
    top,
    bottom
  );

  group.userData.glowMaterial =
    glowMaterial;

  return group;
}

function createBanner(color) {
  const group =
    new THREE.Group();

  const pole =
    createBox(
      0.16,
      5.4,
      0.16,
      new THREE.MeshStandardMaterial({
        color: COLORS.woodDark,
        roughness: 0.8
      })
    );

  pole.position.y = 2.7;

  const flagMaterial =
    new THREE.MeshStandardMaterial({
      color,
      side: THREE.DoubleSide,
      roughness: 0.76
    });

  const flag =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        1.6,
        2.6,
        6,
        4
      ),
      flagMaterial
    );

  flag.position.set(
    0.88,
    3.75,
    0
  );

  group.add(
    pole,
    flag
  );

  group.userData.flag =
    flag;

  return group;
}

function createCherryGarden(scene) {
  const positions = [
    [-45, -27, 1.15],
    [-38, -35, 1.05],
    [34, -37, 1.2],
    [44, -28, 1],
    [-45, 30, 1.1],
    [43, 29, 1.1],
    [-35, 31, 0.9],
    [35, 31, 0.95]
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

function createCherryTree(seed) {
  const group =
    new THREE.Group();

  const trunkMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.woodDark,
      roughness: 0.9
    });

  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.62,
        0.9,
        6.8,
        8
      ),
      trunkMaterial
    );

  trunk.position.y = 3.4;
  trunk.castShadow = true;

  group.add(
    trunk
  );

  for (
    let branch = 0;
    branch < 4;
    branch += 1
  ) {
    const limb =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.24,
          0.42,
          4.4,
          7
        ),
        trunkMaterial
      );

    limb.position.set(
      Math.cos(
        branch *
          Math.PI /
          2
      ) *
        1.35,

      6.25,

      Math.sin(
        branch *
          Math.PI /
          2
      ) *
        1.35
    );

    limb.rotation.z =
      Math.PI / 3.25;

    limb.rotation.y =
      branch *
      Math.PI /
      2;

    limb.castShadow = true;

    group.add(
      limb
    );
  }

  const blossomMaterials = [
    new THREE.MeshStandardMaterial({
      color: COLORS.cherry,
      roughness: 0.86
    }),

    new THREE.MeshStandardMaterial({
      color: COLORS.cherryLight,
      roughness: 0.86
    }),

    new THREE.MeshStandardMaterial({
      color: 0xe98cab,
      roughness: 0.86
    })
  ];

  const clusters = 11;

  for (
    let index = 0;
    index < clusters;
    index += 1
  ) {
    const angle =
      index *
        2.399 +
      seed;

    const radius =
      index < 3
        ? 1.4
        : 2.5 +
          pseudoRandom(
            seed *
              30 +
              index
          ) *
            2.2;

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
        blossomMaterials[
          index %
            blossomMaterials.length
        ]
      );

    blossom.position.set(
      Math.cos(
        angle
      ) *
        radius,

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
        radius
    );

    blossom.rotation.set(
      angle *
        0.2,
      angle,
      angle *
        0.35
    );

    blossom.castShadow = true;
    blossom.receiveShadow = true;

    group.add(
      blossom
    );
  }

  return group;
}

function createPagoda(scene) {
  const group =
    new THREE.Group();

  group.position.set(
    34,
    0,
    -45
  );

  const wallMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.cream,
      roughness: 0.84
    });

  const roofMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.redDark,
      roughness: 0.68
    });

  for (
    let level = 0;
    level < 3;
    level += 1
  ) {
    const y =
      level *
      3.3;

    const width =
      7.8 -
      level *
        1.35;

    const body =
      createBox(
        width *
          0.64,
        2.7,
        width *
          0.64,
        wallMaterial
      );

    body.position.y =
      y +
      1.35;

    group.add(
      body
    );

    const roof =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          width *
            0.72,
          width,
          1.15,
          4
        ),
        roofMaterial
      );

    roof.rotation.y =
      Math.PI / 4;

    roof.position.y =
      y +
      3;

    roof.castShadow = true;

    group.add(
      roof
    );
  }

  const finial =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        0.45,
        2.6,
        8
      ),
      new THREE.MeshStandardMaterial({
        color: COLORS.gold,
        roughness: 0.5
      })
    );

  finial.position.y =
    11.4;

  group.add(
    finial
  );

  group.traverse(
    (object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    }
  );

  scene.add(
    group
  );
}

function createBoundary(scene) {
  const wallMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.cream,
      roughness: 0.92
    });

  const redMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.red,
      roughness: 0.72
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

    const rail =
      createBox(
        100,
        0.24,
        0.24,
        redMaterial
      );

    rail.position.set(
      0,
      2.35,
      z
    );

    scene.add(
      rail
    );

    for (
      let x = -48;
      x <= 48;
      x += 4
    ) {
      const post =
        createBox(
          0.24,
          2.5,
          0.24,
          redMaterial
        );

      post.position.set(
        x,
        1.25,
        z
      );

      scene.add(
        post
      );
    }
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

    const rail =
      createBox(
        0.24,
        0.24,
        94,
        redMaterial
      );

    rail.position.set(
      x,
      2.35,
      0
    );

    scene.add(
      rail
    );

    for (
      let z = -44;
      z <= 44;
      z += 4
    ) {
      const post =
        createBox(
          0.24,
          2.5,
          0.24,
          redMaterial
        );

      post.position.set(
        x,
        1.25,
        z
      );

      scene.add(
        post
      );
    }
  }
}

function createPetals(
  scene,
  world
) {
  const count =
    world.isMobile
      ? 280
      : 560;

  const positions =
    new Float32Array(
      count *
        3
    );

  const speeds = [];

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

  const material =
    new THREE.PointsMaterial({
      color: COLORS.cherryLight,
      size:
        world.isMobile
          ? 0.18
          : 0.22,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      sizeAttenuation: true
    });

  const petals =
    new THREE.Points(
      geometry,
      material
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

function createClouds(
  scene,
  world
) {
  const cloudMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.36,
      depthWrite: false
    });

  for (
    let index = 0;
    index < 5;
    index += 1
  ) {
    const group =
      new THREE.Group();

    group.position.set(
      -80 +
        index *
          38,
      35 +
        index *
          2.5,
      -70 +
        index *
          12
    );

    for (
      let puff = 0;
      puff < 5;
      puff += 1
    ) {
      const cloud =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            5 +
              pseudoRandom(
                index +
                  puff
              ) *
                3,
            12,
            8
          ),
          cloudMaterial
        );

      cloud.scale.y =
        0.48;

      cloud.position.x =
        puff *
        5.5;

      cloud.position.y =
        Math.sin(
          puff
        ) *
        1.2;

      group.add(
        cloud
      );
    }

    scene.add(
      group
    );

    world.cloudGroups.push(
      group
    );
  }
}

export function updateWorld(
  world,
  deltaTime,
  elapsedTime
) {
  updatePetals(
    world,
    deltaTime,
    elapsedTime
  );

  updateFlags(
    world,
    elapsedTime
  );

  updateLanterns(
    world,
    elapsedTime
  );

  updateClouds(
    world,
    deltaTime
  );
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

  const count =
    positions.length /
    3;

  for (
    let index = 0;
    index < count;
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
      0.45;

    positions[zIndex] +=
      Math.cos(
        elapsedTime *
          0.55 +
          index *
            0.7
      ) *
      deltaTime *
      0.22;

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

      positions[xIndex] =
        randomRange(
          index *
            6.1 +
            elapsedTime,
          -50,
          50
        );

      positions[zIndex] =
        randomRange(
          index *
            8.3 +
            elapsedTime,
          -35,
          35
        );
    }
  }

  world.petals.geometry
    .attributes
    .position
    .needsUpdate = true;
}

function updateFlags(
  world,
  elapsedTime
) {
  world.flags.forEach(
    (
      flag,
      index
    ) => {
      const positions =
        flag.geometry
          .attributes
          .position;

      for (
        let vertex = 0;
        vertex < positions.count;
        vertex += 1
      ) {
        const x =
          positions.getX(
            vertex
          );

        positions.setZ(
          vertex,
          Math.sin(
            elapsedTime *
              2.2 +
              index +
              x *
                2.7
          ) *
            0.08 *
            (
              x +
              0.8
            )
        );
      }

      positions.needsUpdate =
        true;

      flag.geometry
        .computeVertexNormals();
    }
  );
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

function updateClouds(
  world,
  deltaTime
) {
  world.cloudGroups.forEach(
    (
      cloud,
      index
    ) => {
      cloud.position.x +=
        deltaTime *
        (
          0.35 +
          index *
            0.05
        );

      if (
        cloud.position.x >
        105
      ) {
        cloud.position.x =
          -105;
      }
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

function pseudoRandom(seed) {
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
