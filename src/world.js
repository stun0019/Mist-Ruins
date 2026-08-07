import * as THREE from "three";

const COLORS = {
  background: 0x04030a,

  stone: 0x292636,
  stoneDark: 0x12111a,
  stoneLight: 0x403b50,

  metal: 0x181521,

  purple: 0x8055ff,
  purpleLight: 0xb99cff,
  blue: 0x4d79ff,

  shadow: 0x090812,
  throne: 0x100e18
};

export function createWorld(scene) {
  const isMobile =
    window.matchMedia(
      "(pointer: coarse)"
    ).matches ||
    navigator.maxTouchPoints > 0;

  const world = {
    isMobile,

    runeMaterials: [],
    portalMaterials: [],
    shadowMaterials: [],

    magicLights: [],
    floatingStones: [],

    magicParticles: null,
    magicPositions: null,
    magicSpeeds: [],

    shadowParticles: null,
    shadowPositions: null,
    shadowSpeeds: [],

    portalRing: null,
    portalCore: null,

    altarCore: null,
    throneAura: null
  };

  scene.background =
    new THREE.Color(
      COLORS.background
    );

  scene.fog =
    new THREE.FogExp2(
      0x080711,
      isMobile ? 0.017 : 0.014
    );

  createLighting(scene, world);
  createMainFloor(scene);
  createEntranceCorridor(scene);
  createRunePath(scene, world);
  createGreatHall(scene);
  createColumns(scene);
  createCentralAltar(scene, world);
  createThrone(scene, world);
  createShadowRift(scene, world);
  createFloatingDebris(scene, world);
  createWallRuins(scene);
  createMagicParticles(scene, world);
  createShadowParticles(scene, world);

  return world;
}

function createLighting(scene, world) {
  const ambientLight =
    new THREE.HemisphereLight(
      0x25345c,
      0x08050d,
      0.62
    );

  scene.add(ambientLight);

  const topLight =
    new THREE.DirectionalLight(
      0x779cff,
      1.75
    );

  topLight.position.set(
    -12,
    34,
    18
  );

  topLight.castShadow = true;

  const shadowSize =
    world.isMobile
      ? 1024
      : 2048;

  topLight.shadow.mapSize.set(
    shadowSize,
    shadowSize
  );

  topLight.shadow.camera.left = -40;
  topLight.shadow.camera.right = 40;
  topLight.shadow.camera.top = 55;
  topLight.shadow.camera.bottom = -55;
  topLight.shadow.camera.near = 1;
  topLight.shadow.camera.far = 130;

  topLight.shadow.bias = -0.0005;

  scene.add(topLight);

  const hallBackLight =
    new THREE.PointLight(
      COLORS.purple,
      44,
      78,
      2
    );

  hallBackLight.position.set(
    0,
    12,
    -48
  );

  scene.add(hallBackLight);

  world.magicLights.push(
    hallBackLight
  );

  const blueFill =
    new THREE.PointLight(
      COLORS.blue,
      24,
      60,
      2
    );

  blueFill.position.set(
    -18,
    14,
    -12
  );

  scene.add(blueFill);
}

function createMainFloor(scene) {
  const floorMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.stoneDark,
      roughness: 0.84,
      metalness: 0.05
    });

  const floor =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        72,
        130
      ),
      floorMaterial
    );

  floor.rotation.x =
    -Math.PI / 2;

  floor.position.set(
    0,
    -0.04,
    -18
  );

  floor.receiveShadow = true;

  scene.add(floor);

  const sideVoidMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x020207
    });

  const leftVoid =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        36,
        130
      ),
      sideVoidMaterial
    );

  leftVoid.rotation.x =
    -Math.PI / 2;

  leftVoid.position.set(
    -52,
    0,
    -18
  );

  const rightVoid =
    leftVoid.clone();

  rightVoid.position.x = 52;

  scene.add(
    leftVoid,
    rightVoid
  );
}

function createEntranceCorridor(scene) {
  const floorMaterial =
    createStoneMaterial(
      COLORS.stone
    );

  for (
    let index = 0;
    index < 15;
    index += 1
  ) {
    const slab =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          8.5,
          0.32,
          3.1
        ),
        floorMaterial
      );

    slab.position.set(
      randomRange(
        index * 4.7,
        -0.18,
        0.18
      ),
      0.12,
      33 - index * 3
    );

    slab.rotation.y =
      randomRange(
        index * 8.2,
        -0.025,
        0.025
      );

    slab.castShadow = true;
    slab.receiveShadow = true;

    scene.add(slab);
  }

  const wallMaterial =
    createStoneMaterial(
      COLORS.stoneDark
    );

  for (
    let side = -1;
    side <= 1;
    side += 2
  ) {
    for (
      let index = 0;
      index < 7;
      index += 1
    ) {
      const wall =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            2.3,
            8 + pseudoRandom(index) * 3,
            5
          ),
          wallMaterial
        );

      wall.position.set(
        side * 8.2,
        wall.geometry.parameters
          .height / 2,
        30 - index * 6.2
      );

      wall.rotation.y =
        side *
        randomRange(
          index * 3.8,
          -0.05,
          0.05
        );

      wall.castShadow = true;
      wall.receiveShadow = true;

      scene.add(wall);
    }
  }

  createEntranceArch(scene);
}

function createEntranceArch(scene) {
  const material =
    createStoneMaterial(
      COLORS.stone
    );

  const left =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        3.2,
        14,
        4
      ),
      material
    );

  left.position.set(
    -7.2,
    7,
    11
  );

  const right =
    left.clone();

  right.position.x = 7.2;

  const top =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        17.5,
        3,
        4
      ),
      material
    );

  top.position.set(
    0,
    13.2,
    11
  );

  [
    left,
    right,
    top
  ].forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);
  });
}

function createRunePath(scene, world) {
  const runeMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.purple,
      emissive: COLORS.purple,
      emissiveIntensity: 2.1,
      roughness: 0.4,
      metalness: 0.08
    });

  world.runeMaterials.push(
    runeMaterial
  );

  const centerLine =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.15,
        0.035,
        76
      ),
      runeMaterial
    );

  centerLine.position.set(
    0,
    0.28,
    -10
  );

  scene.add(centerLine);

  for (
    let index = 0;
    index < 18;
    index += 1
  ) {
    const z =
      27 - index * 4.25;

    const leftRune =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          2.2,
          0.04,
          0.11
        ),
        runeMaterial
      );

    leftRune.position.set(
      -1.5,
      0.29,
      z
    );

    leftRune.rotation.y =
      index % 2 === 0
        ? 0.45
        : -0.45;

    const rightRune =
      leftRune.clone();

    rightRune.position.x = 1.5;
    rightRune.rotation.y *= -1;

    scene.add(
      leftRune,
      rightRune
    );

    if (index % 3 === 0) {
      const circle =
        new THREE.Mesh(
          new THREE.TorusGeometry(
            1.8,
            0.065,
            6,
            28
          ),
          runeMaterial
        );

      circle.rotation.x =
        -Math.PI / 2;

      circle.position.set(
        0,
        0.31,
        z
      );

      scene.add(circle);
    }
  }
}

function createGreatHall(scene) {
  const hallMaterial =
    createStoneMaterial(
      COLORS.stoneDark
    );

  const hallBase =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        27,
        29,
        0.8,
        16
      ),
      hallMaterial
    );

  hallBase.position.set(
    0,
    0.2,
    -30
  );

  hallBase.castShadow = true;
  hallBase.receiveShadow = true;

  scene.add(hallBase);

  const innerMaterial =
    createStoneMaterial(
      COLORS.stone
    );

  const innerFloor =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        23,
        16
      ),
      innerMaterial
    );

  innerFloor.rotation.x =
    -Math.PI / 2;

  innerFloor.position.set(
    0,
    0.61,
    -30
  );

  innerFloor.receiveShadow = true;

  scene.add(innerFloor);

  createFloorCracks(scene);
}

function createFloorCracks(scene) {
  const crackMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x07060b
    });

  const crackData = [
    [-8, -20, 8, 0.18, 0.3],
    [7, -23, 6, 0.16, -0.7],
    [-12, -32, 7, 0.14, 0.8],
    [11, -35, 9, 0.17, -0.2],
    [-5, -43, 8, 0.16, 0.5],
    [5, -47, 6, 0.13, -0.85]
  ];

  crackData.forEach(
    ([
      x,
      z,
      length,
      width,
      rotation
    ]) => {
      const crack =
        new THREE.Mesh(
          new THREE.PlaneGeometry(
            length,
            width
          ),
          crackMaterial
        );

      crack.rotation.x =
        -Math.PI / 2;

      crack.rotation.z =
        rotation;

      crack.position.set(
        x,
        0.625,
        z
      );

      scene.add(crack);
    }
  );
}

function createColumns(scene) {
  const material =
    createStoneMaterial(
      COLORS.stone
    );

  const positions = [
    [-18, -14],
    [18, -14],

    [-22, -25],
    [22, -25],

    [-22, -38],
    [22, -38],

    [-17, -50],
    [17, -50]
  ];

  positions.forEach(
    ([x, z], index) => {
      const height =
        index === 2 ||
        index === 5
          ? 12
          : 18;

      const column =
        createColumn(
          material,
          height,
          index
        );

      column.position.set(
        x,
        0,
        z
      );

      scene.add(column);
    }
  );
}

function createColumn(
  material,
  height,
  index
) {
  const group =
    new THREE.Group();

  const base =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        1.8,
        2.25,
        1.1,
        8
      ),
      material
    );

  base.position.y = 0.55;

  const lower =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        1.3,
        1.55,
        1.1,
        8
      ),
      material
    );

  lower.position.y = 1.55;

  const shaftHeight =
    height - 3;

  const shaft =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        1.05,
        1.22,
        shaftHeight,
        8
      ),
      material
    );

  shaft.position.y =
    2.1 + shaftHeight / 2;

  const top =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        1.75,
        1.1,
        1,
        8
      ),
      material
    );

  top.position.y =
    height - 0.5;

  [
    base,
    lower,
    shaft,
    top
  ].forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    group.add(mesh);
  });

  if (
    index === 2 ||
    index === 5
  ) {
    group.rotation.z =
      index === 2
        ? -0.08
        : 0.07;
  }

  return group;
}

function createCentralAltar(
  scene,
  world
) {
  const baseMaterial =
    createStoneMaterial(
      COLORS.stoneDark
    );

  const upperMaterial =
    createStoneMaterial(
      COLORS.stoneLight
    );

  const base =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        7,
        8,
        1.2,
        12
      ),
      baseMaterial
    );

  base.position.set(
    0,
    1.2,
    -29
  );

  const middle =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        5.2,
        6,
        0.8,
        12
      ),
      upperMaterial
    );

  middle.position.set(
    0,
    2.15,
    -29
  );

  const upper =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        3.5,
        4.4,
        0.7,
        12
      ),
      baseMaterial
    );

  upper.position.set(
    0,
    2.88,
    -29
  );

  [
    base,
    middle,
    upper
  ].forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);
  });

  const coreMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.purpleLight,
      emissive: COLORS.purple,
      emissiveIntensity: 3.2,
      roughness: 0.18,
      metalness: 0.2
    });

  world.runeMaterials.push(
    coreMaterial
  );

  const core =
    new THREE.Mesh(
      new THREE.OctahedronGeometry(
        1.25,
        0
      ),
      coreMaterial
    );

  core.position.set(
    0,
    5,
    -29
  );

  core.castShadow = true;

  scene.add(core);

  world.altarCore = core;

  const ringMaterial =
    new THREE.MeshBasicMaterial({
      color: COLORS.purpleLight,
      transparent: true,
      opacity: 0.72,
      blending:
        THREE.AdditiveBlending,
      depthWrite: false
    });

  const ring =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        2.1,
        0.08,
        8,
        36
      ),
      ringMaterial
    );

  ring.position.set(
    0,
    5,
    -29
  );

  ring.rotation.x =
    Math.PI / 2;

  scene.add(ring);

  world.portalMaterials.push(
    ringMaterial
  );

  const altarLight =
    new THREE.PointLight(
      COLORS.purple,
      world.isMobile ? 34 : 52,
      25,
      2
    );

  altarLight.position.set(
    0,
    5,
    -29
  );

  scene.add(altarLight);

  world.magicLights.push(
    altarLight
  );
}

function createThrone(scene, world) {
  const throneGroup =
    new THREE.Group();

  throneGroup.position.set(
    0,
    0,
    -51
  );

  const throneMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.throne,
      roughness: 0.65,
      metalness: 0.25
    });

  const base =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        10,
        1.2,
        7
      ),
      throneMaterial
    );

  base.position.y = 1;

  const seat =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        6,
        1.1,
        4
      ),
      throneMaterial
    );

  seat.position.set(
    0,
    2.5,
    0.4
  );

  const back =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        7,
        12,
        1.5
      ),
      throneMaterial
    );

  back.position.set(
    0,
    8,
    -1.1
  );

  const leftWing =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        2,
        11,
        1.4
      ),
      throneMaterial
    );

  leftWing.position.set(
    -4.1,
    7.5,
    -1
  );

  leftWing.rotation.z = 0.22;

  const rightWing =
    leftWing.clone();

  rightWing.position.x = 4.1;
  rightWing.rotation.z = -0.22;

  const leftArm =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.3,
        1.1,
        5
      ),
      throneMaterial
    );

  leftArm.position.set(
    -3.6,
    4,
    0.4
  );

  const rightArm =
    leftArm.clone();

  rightArm.position.x = 3.6;

  [
    base,
    seat,
    back,
    leftWing,
    rightWing,
    leftArm,
    rightArm
  ].forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    throneGroup.add(mesh);
  });

  scene.add(throneGroup);

  const auraMaterial =
    new THREE.MeshBasicMaterial({
      color: COLORS.purple,
      transparent: true,
      opacity: 0.18,
      blending:
        THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

  const aura =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        16,
        22
      ),
      auraMaterial
    );

  aura.position.set(
    0,
    10,
    -52.2
  );

  scene.add(aura);

  world.throneAura = aura;
  world.shadowMaterials.push(
    auraMaterial
  );

  const throneLight =
    new THREE.PointLight(
      COLORS.purple,
      world.isMobile ? 24 : 42,
      32,
      2
    );

  throneLight.position.set(
    0,
    9,
    -49
  );

  scene.add(throneLight);

  world.magicLights.push(
    throneLight
  );
}

function createShadowRift(
  scene,
  world
) {
  const ringMaterial =
    new THREE.MeshBasicMaterial({
      color: COLORS.purpleLight,
      transparent: true,
      opacity: 0.82,
      blending:
        THREE.AdditiveBlending,
      depthWrite: false
    });

  const outerMaterial =
    new THREE.MeshBasicMaterial({
      color: COLORS.blue,
      transparent: true,
      opacity: 0.34,
      blending:
        THREE.AdditiveBlending,
      depthWrite: false
    });

  const coreMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x100624,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide
    });

  const outerRing =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        8,
        0.42,
        12,
        64
      ),
      outerMaterial
    );

  outerRing.position.set(
    0,
    10,
    -55
  );

  const innerRing =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        6.8,
        0.2,
        10,
        64
      ),
      ringMaterial
    );

  innerRing.position.set(
    0,
    10,
    -54.8
  );

  const core =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        6.6,
        64
      ),
      coreMaterial
    );

  core.position.set(
    0,
    10,
    -55.1
  );

  scene.add(
    core,
    outerRing,
    innerRing
  );

  world.portalRing =
    outerRing;

  world.portalCore =
    innerRing;

  world.portalMaterials.push(
    ringMaterial,
    outerMaterial,
    coreMaterial
  );

  createRiftSpikes(
    scene,
    ringMaterial
  );
}

function createRiftSpikes(
  scene,
  material
) {
  const spikeCount = 16;

  for (
    let index = 0;
    index < spikeCount;
    index += 1
  ) {
    const angle =
      index /
      spikeCount *
      Math.PI *
      2;

    const radius = 8.8;

    const length =
      1.4 +
      pseudoRandom(index * 7.8) *
      2.8;

    const spike =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.18,
          length,
          5
        ),
        material
      );

    spike.position.set(
      Math.cos(angle) * radius,
      10 +
        Math.sin(angle) *
        radius,
      -54.6
    );

    spike.rotation.z =
      angle - Math.PI / 2;

    scene.add(spike);
  }
}

function createFloatingDebris(
  scene,
  world
) {
  const material =
    createStoneMaterial(
      COLORS.stoneDark
    );

  const count =
    world.isMobile
      ? 14
      : 26;

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const size =
      0.35 +
      pseudoRandom(index * 5.2) *
      1.15;

    const stone =
      new THREE.Mesh(
        new THREE.DodecahedronGeometry(
          size,
          0
        ),
        material
      );

    const angle =
      pseudoRandom(index * 8.3) *
      Math.PI *
      2;

    const radius =
      8 +
      pseudoRandom(index * 3.6) *
      9;

    stone.position.set(
      Math.cos(angle) * radius,
      4 +
        pseudoRandom(index * 9.4) *
        15,
      -48 +
        Math.sin(angle) *
        5
    );

    stone.rotation.set(
      pseudoRandom(index) * Math.PI,
      pseudoRandom(index * 2) * Math.PI,
      pseudoRandom(index * 3) * Math.PI
    );

    stone.userData = {
      baseY: stone.position.y,

      floatSpeed:
        0.35 +
        pseudoRandom(index * 7) *
        0.6,

      floatOffset:
        pseudoRandom(index * 11) *
        Math.PI *
        2,

      rotateSpeed:
        0.08 +
        pseudoRandom(index * 13) *
        0.18
    };

    stone.castShadow = true;

    scene.add(stone);

    world.floatingStones.push(
      stone
    );
  }
}

function createWallRuins(scene) {
  const material =
    createStoneMaterial(
      COLORS.stoneDark
    );

  const wallData = [
    [-30, 7, -18, 5, 14, 22],
    [30, 7, -18, 5, 14, 22],

    [-32, 8, -40, 6, 16, 22],
    [32, 8, -40, 6, 16, 22],

    [-25, 5, -59, 12, 10, 5],
    [25, 5, -59, 12, 10, 5]
  ];

  wallData.forEach(
    ([
      x,
      y,
      z,
      width,
      height,
      depth
    ], index) => {
      const wall =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            width,
            height,
            depth
          ),
          material
        );

      wall.position.set(
        x,
        y,
        z
      );

      wall.rotation.y =
        randomRange(
          index * 5.8,
          -0.08,
          0.08
        );

      wall.castShadow = true;
      wall.receiveShadow = true;

      scene.add(wall);
    }
  );

  createRubble(scene, material);
}

function createRubble(
  scene,
  material
) {
  const groups = [
    [-13, -17],
    [14, -19],
    [-19, -34],
    [19, -37],
    [-12, -54],
    [13, -56]
  ];

  groups.forEach(
    ([x, z], groupIndex) => {
      for (
        let index = 0;
        index < 6;
        index += 1
      ) {
        const size =
          0.35 +
          pseudoRandom(
            groupIndex * 8 + index
          ) *
          1;

        const rubble =
          new THREE.Mesh(
            new THREE.DodecahedronGeometry(
              size,
              0
            ),
            material
          );

        rubble.position.set(
          x +
            randomRange(
              groupIndex * 30 + index,
              -3,
              3
            ),

          size * 0.45,

          z +
            randomRange(
              groupIndex * 60 + index,
              -3,
              3
            )
        );

        rubble.rotation.set(
          pseudoRandom(index) *
            Math.PI,

          pseudoRandom(index * 4) *
            Math.PI,

          pseudoRandom(index * 8) *
            Math.PI
        );

        rubble.castShadow = true;
        rubble.receiveShadow = true;

        scene.add(rubble);
      }
    }
  );
}

function createMagicParticles(
  scene,
  world
) {
  const particleCount =
    world.isMobile
      ? 280
      : 760;

  const positions =
    new Float32Array(
      particleCount * 3
    );

  const speeds = [];

  for (
    let index = 0;
    index < particleCount;
    index += 1
  ) {
    positions[index * 3] =
      randomRange(
        index * 1.7,
        -25,
        25
      );

    positions[index * 3 + 1] =
      randomRange(
        index * 2.3,
        0.5,
        21
      );

    positions[index * 3 + 2] =
      randomRange(
        index * 3.1,
        -59,
        25
      );

    speeds.push(
      0.14 +
      pseudoRandom(index * 5.7) *
      0.42
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
      color: COLORS.purpleLight,

      size:
        world.isMobile
          ? 0.085
          : 0.1,

      transparent: true,
      opacity: 0.78,

      depthWrite: false,

      blending:
        THREE.AdditiveBlending,

      sizeAttenuation: true
    });

  const particles =
    new THREE.Points(
      geometry,
      material
    );

  scene.add(particles);

  world.magicParticles =
    particles;

  world.magicPositions =
    positions;

  world.magicSpeeds =
    speeds;
}

function createShadowParticles(
  scene,
  world
) {
  const particleCount =
    world.isMobile
      ? 90
      : 220;

  const positions =
    new Float32Array(
      particleCount * 3
    );

  const speeds = [];

  for (
    let index = 0;
    index < particleCount;
    index += 1
  ) {
    positions[index * 3] =
      randomRange(
        index * 2.4,
        -10,
        10
      );

    positions[index * 3 + 1] =
      randomRange(
        index * 4.1,
        1,
        18
      );

    positions[index * 3 + 2] =
      randomRange(
        index * 6.3,
        -56,
        -44
      );

    speeds.push(
      0.08 +
      pseudoRandom(index * 8.1) *
      0.24
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
      color: 0x1a102f,

      size:
        world.isMobile
          ? 0.25
          : 0.35,

      transparent: true,
      opacity: 0.52,

      depthWrite: false,

      blending:
        THREE.NormalBlending,

      sizeAttenuation: true
    });

  const particles =
    new THREE.Points(
      geometry,
      material
    );

  scene.add(particles);

  world.shadowParticles =
    particles;

  world.shadowPositions =
    positions;

  world.shadowSpeeds =
    speeds;
}

export function updateWorld(
  world,
  deltaTime,
  elapsedTime
) {
  updateRuneMaterials(
    world,
    elapsedTime
  );

  updateMagicLights(
    world,
    elapsedTime
  );

  updateAltar(
    world,
    elapsedTime
  );

  updatePortal(
    world,
    deltaTime,
    elapsedTime
  );

  updateFloatingStones(
    world,
    deltaTime,
    elapsedTime
  );

  updateMagicParticles(
    world,
    deltaTime,
    elapsedTime
  );

  updateShadowParticles(
    world,
    deltaTime,
    elapsedTime
  );

  updateThroneAura(
    world,
    elapsedTime
  );
}

function updateRuneMaterials(
  world,
  elapsedTime
) {
  world.runeMaterials.forEach(
    (material, index) => {
      material.emissiveIntensity =
        1.9 +
        Math.sin(
          elapsedTime * 1.8 +
          index
        ) *
        0.38;
    }
  );
}

function updateMagicLights(
  world,
  elapsedTime
) {
  world.magicLights.forEach(
    (light, index) => {
      const baseIntensity =
        world.isMobile
          ? 28
          : 44;

      light.intensity =
        baseIntensity +
        Math.sin(
          elapsedTime *
          (2.1 + index * 0.37)
        ) *
        4 +
        Math.sin(
          elapsedTime *
          (5.3 + index * 0.21)
        ) *
        1.5;
    }
  );
}

function updateAltar(
  world,
  elapsedTime
) {
  if (!world.altarCore) {
    return;
  }

  world.altarCore.rotation.y =
    elapsedTime * 0.75;

  world.altarCore.rotation.x =
    Math.sin(
      elapsedTime * 0.8
    ) * 0.18;

  world.altarCore.position.y =
    5 +
    Math.sin(
      elapsedTime * 1.6
    ) *
    0.22;

  const scale =
    1 +
    Math.sin(
      elapsedTime * 2.3
    ) *
    0.06;

  world.altarCore.scale.setScalar(
    scale
  );
}

function updatePortal(
  world,
  deltaTime,
  elapsedTime
) {
  if (world.portalRing) {
    world.portalRing.rotation.z +=
      deltaTime * 0.12;

    const scale =
      1 +
      Math.sin(
        elapsedTime * 1.35
      ) *
      0.035;

    world.portalRing.scale.setScalar(
      scale
    );
  }

  if (world.portalCore) {
    world.portalCore.rotation.z -=
      deltaTime * 0.2;

    const scale =
      1 +
      Math.sin(
        elapsedTime * 1.7
      ) *
      0.025;

    world.portalCore.scale.setScalar(
      scale
    );
  }

  world.portalMaterials.forEach(
    (material, index) => {
      if (
        typeof material.opacity !==
        "number"
      ) {
        return;
      }

      material.opacity =
        Math.max(
          0.16,
          Math.min(
            0.9,
            material.opacity +
              Math.sin(
                elapsedTime *
                (1.4 + index * 0.2)
              ) *
              0.0008
          )
        );
    }
  );
}

function updateFloatingStones(
  world,
  deltaTime,
  elapsedTime
) {
  world.floatingStones.forEach(
    (stone) => {
      const {
        baseY,
        floatSpeed,
        floatOffset,
        rotateSpeed
      } = stone.userData;

      stone.position.y =
        baseY +
        Math.sin(
          elapsedTime *
          floatSpeed +
          floatOffset
        ) *
        0.65;

      stone.rotation.x +=
        deltaTime *
        rotateSpeed;

      stone.rotation.y +=
        deltaTime *
        rotateSpeed *
        0.75;
    }
  );
}

function updateMagicParticles(
  world,
  deltaTime,
  elapsedTime
) {
  if (
    !world.magicParticles ||
    !world.magicPositions
  ) {
    return;
  }

  const positions =
    world.magicPositions;

  for (
    let index = 0;
    index < world.magicSpeeds.length;
    index += 1
  ) {
    const xIndex =
      index * 3;

    const yIndex =
      index * 3 + 1;

    const zIndex =
      index * 3 + 2;

    positions[yIndex] +=
      world.magicSpeeds[index] *
      deltaTime;

    positions[xIndex] +=
      Math.sin(
        elapsedTime * 0.6 +
        index
      ) *
      deltaTime *
      0.055;

    if (positions[yIndex] > 23) {
      positions[yIndex] = 0.4;

      positions[xIndex] =
        randomRange(
          index * 12.4 +
          elapsedTime,
          -25,
          25
        );

      positions[zIndex] =
        randomRange(
          index * 14.7 +
          elapsedTime,
          -59,
          25
        );
    }
  }

  world.magicParticles
    .geometry
    .attributes
    .position
    .needsUpdate = true;
}

function updateShadowParticles(
  world,
  deltaTime,
  elapsedTime
) {
  if (
    !world.shadowParticles ||
    !world.shadowPositions
  ) {
    return;
  }

  const positions =
    world.shadowPositions;

  for (
    let index = 0;
    index < world.shadowSpeeds.length;
    index += 1
  ) {
    const xIndex =
      index * 3;

    const yIndex =
      index * 3 + 1;

    const zIndex =
      index * 3 + 2;

    positions[yIndex] +=
      world.shadowSpeeds[index] *
      deltaTime;

    positions[xIndex] +=
      Math.sin(
        elapsedTime * 0.8 +
        index * 0.6
      ) *
      deltaTime *
      0.12;

    positions[zIndex] +=
      Math.cos(
        elapsedTime * 0.5 +
        index
      ) *
      deltaTime *
      0.04;

    if (positions[yIndex] > 20) {
      positions[yIndex] = 0.5;

      positions[xIndex] =
        randomRange(
          index * 18 +
          elapsedTime,
          -10,
          10
        );

      positions[zIndex] =
        randomRange(
          index * 22 +
          elapsedTime,
          -56,
          -44
        );
    }
  }

  world.shadowParticles
    .geometry
    .attributes
    .position
    .needsUpdate = true;
}

function updateThroneAura(
  world,
  elapsedTime
) {
  if (!world.throneAura) {
    return;
  }

  world.throneAura.material.opacity =
    0.14 +
    Math.sin(
      elapsedTime * 1.3
    ) *
    0.045;

  const scale =
    1 +
    Math.sin(
      elapsedTime * 0.9
    ) *
    0.025;

  world.throneAura.scale.set(
    scale,
    scale,
    1
  );
}

function createStoneMaterial(
  color
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    metalness: 0.04,
    flatShading: true
  });
}

function pseudoRandom(seed) {
  const value =
    Math.sin(
      seed * 12.9898
    ) *
    43758.5453;

  return value -
    Math.floor(value);
}

function randomRange(
  seed,
  minimum,
  maximum
) {
  return (
    minimum +
    pseudoRandom(seed) *
    (maximum - minimum)
  );
}
