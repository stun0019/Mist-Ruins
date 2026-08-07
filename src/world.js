import * as THREE from "three";

const COLORS = {
  stone: 0x40464d,
  stoneDark: 0x252a30,
  stoneLight: 0x5a6065,
  ground: 0x171c22,
  road: 0x353b40,
  ember: 0xff6b2c,
  emberLight: 0xffb067,
  rune: 0xe56c31,
  deadWood: 0x342c28
};

export function createWorld(scene) {
  const world = {
    ashParticles: null,
    ashPositions: null,
    ashSpeeds: [],
    emberLights: [],
    floatingStones: [],
    runeMaterials: [],
    altarFlame: null
  };

  createLights(scene);
  createGround(scene);
  createEntrance(scene);
  createPath(scene);
  createCourtyard(scene);
  createAltar(scene, world);
  createGate(scene, world);
  createRuins(scene);
  createDeadTrees(scene);
  createMountains(scene);
  createAshParticles(scene, world);

  return world;
}

function createLights(scene) {
  const hemisphereLight = new THREE.HemisphereLight(
    0x7285a6,
    0x15100d,
    1.25
  );

  scene.add(hemisphereLight);

  const moonLight = new THREE.DirectionalLight(
    0xb8d1ff,
    2.15
  );

  moonLight.position.set(-22, 34, 16);
  moonLight.castShadow = true;

  moonLight.shadow.mapSize.set(2048, 2048);

  moonLight.shadow.camera.left = -50;
  moonLight.shadow.camera.right = 50;
  moonLight.shadow.camera.top = 50;
  moonLight.shadow.camera.bottom = -50;
  moonLight.shadow.camera.near = 1;
  moonLight.shadow.camera.far = 110;

  moonLight.shadow.bias = -0.0005;

  scene.add(moonLight);

  const distantGlow = new THREE.PointLight(
    0x31517c,
    35,
    90,
    2
  );

  distantGlow.position.set(0, 16, -42);

  scene.add(distantGlow);
}

function createGround(scene) {
  const groundMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.ground,
      roughness: 0.96,
      metalness: 0.02
    });

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 120),
    groundMaterial
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -10;
  ground.receiveShadow = true;

  scene.add(ground);

  const abyssMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x030509
    });

  const leftAbyss = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 90),
    abyssMaterial
  );

  leftAbyss.rotation.x = -Math.PI / 2;
  leftAbyss.position.set(-33, 0.04, 5);

  const rightAbyss = leftAbyss.clone();
  rightAbyss.position.x = 33;

  scene.add(leftAbyss, rightAbyss);
}

function createEntrance(scene) {
  const bridgeMaterial =
    createStoneMaterial(COLORS.stoneDark);

  for (let index = 0; index < 12; index += 1) {
    const width =
      4.8 + pseudoRandom(index * 7.3) * 0.8;

    const depth =
      2.1 + pseudoRandom(index * 4.7) * 0.5;

    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.45, depth),
      bridgeMaterial
    );

    slab.position.set(
      (pseudoRandom(index * 8.1) - 0.5) * 0.35,
      0.16 + pseudoRandom(index) * 0.08,
      31 - index * 2.15
    );

    slab.rotation.y =
      (pseudoRandom(index * 5.9) - 0.5) * 0.07;

    slab.castShadow = true;
    slab.receiveShadow = true;

    scene.add(slab);
  }

  createBrokenRailing(scene, -3.2);
  createBrokenRailing(scene, 3.2);
}

function createBrokenRailing(scene, xPosition) {
  const material =
    createStoneMaterial(COLORS.stoneDark);

  for (let index = 0; index < 5; index += 1) {
    if (
      (xPosition < 0 && index === 2) ||
      (xPosition > 0 && index === 3)
    ) {
      continue;
    }

    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 2.1, 0.55),
      material
    );

    pillar.position.set(
      xPosition,
      1.05,
      29 - index * 5.2
    );

    pillar.rotation.z =
      (pseudoRandom(index + xPosition) - 0.5) * 0.1;

    pillar.castShadow = true;
    pillar.receiveShadow = true;

    scene.add(pillar);
  }
}

function createPath(scene) {
  const roadMaterial =
    createStoneMaterial(COLORS.road);

  for (let index = 0; index < 22; index += 1) {
    const row = Math.floor(index / 2);
    const side = index % 2 === 0 ? -1 : 1;

    const stone = new THREE.Mesh(
      new THREE.BoxGeometry(
        2.6 + pseudoRandom(index * 2.4),
        0.22,
        2.3 + pseudoRandom(index * 7.2) * 0.8
      ),
      roadMaterial
    );

    stone.position.set(
      side * (1.25 + pseudoRandom(index) * 0.25),
      0.12,
      6 - row * 2.5
    );

    stone.rotation.y =
      (pseudoRandom(index * 9.4) - 0.5) * 0.18;

    stone.receiveShadow = true;
    stone.castShadow = true;

    scene.add(stone);
  }
}

function createCourtyard(scene) {
  const baseMaterial =
    createStoneMaterial(COLORS.stoneDark);

  const ringMaterial =
    createStoneMaterial(COLORS.stone);

  const courtyardBase = new THREE.Mesh(
    new THREE.CylinderGeometry(
      17,
      18,
      0.7,
      12
    ),
    baseMaterial
  );

  courtyardBase.position.set(0, 0.2, -8);
  courtyardBase.receiveShadow = true;
  courtyardBase.castShadow = true;

  scene.add(courtyardBase);

  const innerRing = new THREE.Mesh(
    new THREE.RingGeometry(7.5, 12.5, 12),
    ringMaterial
  );

  innerRing.rotation.x = -Math.PI / 2;
  innerRing.rotation.z = Math.PI / 12;
  innerRing.position.set(0, 0.57, -8);
  innerRing.receiveShadow = true;

  scene.add(innerRing);

  createFloorCracks(scene);
}

function createFloorCracks(scene) {
  const crackMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x090c10
    });

  const crackData = [
    [3, -3, 3.6, 0.14, 0.6],
    [-5, -6, 4.2, 0.1, -0.4],
    [6, -11, 3.2, 0.12, -0.9],
    [-4, -14, 4.8, 0.13, 0.3],
    [1, -17, 3.3, 0.11, 1.1]
  ];

  crackData.forEach(
    ([x, z, length, width, rotation]) => {
      const crack = new THREE.Mesh(
        new THREE.PlaneGeometry(length, width),
        crackMaterial
      );

      crack.rotation.x = -Math.PI / 2;
      crack.rotation.z = rotation;

      crack.position.set(x, 0.59, z);

      scene.add(crack);
    }
  );
}

function createAltar(scene, world) {
  const stoneMaterial =
    createStoneMaterial(COLORS.stoneDark);

  const upperMaterial =
    createStoneMaterial(COLORS.stoneLight);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(
      5.1,
      5.8,
      1.1,
      12
    ),
    stoneMaterial
  );

  base.position.set(0, 1.08, -8);
  base.castShadow = true;
  base.receiveShadow = true;

  scene.add(base);

  const upper = new THREE.Mesh(
    new THREE.CylinderGeometry(
      3.7,
      4.3,
      0.7,
      12
    ),
    upperMaterial
  );

  upper.position.set(0, 1.98, -8);
  upper.castShadow = true;
  upper.receiveShadow = true;

  scene.add(upper);

  const brazier = new THREE.Mesh(
    new THREE.CylinderGeometry(
      1.55,
      1.15,
      1.4,
      10,
      1,
      true
    ),
    new THREE.MeshStandardMaterial({
      color: 0x29221f,
      roughness: 0.82,
      metalness: 0.2,
      side: THREE.DoubleSide
    })
  );

  brazier.position.set(0, 3.03, -8);
  brazier.castShadow = true;

  scene.add(brazier);

  const coal = new THREE.Mesh(
    new THREE.CylinderGeometry(
      1.1,
      1.2,
      0.25,
      12
    ),
    new THREE.MeshStandardMaterial({
      color: 0x32120a,
      emissive: COLORS.ember,
      emissiveIntensity: 1.5,
      roughness: 0.9
    })
  );

  coal.position.set(0, 3.42, -8);

  scene.add(coal);

  const flameMaterial =
    new THREE.MeshBasicMaterial({
      color: COLORS.emberLight,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.52, 1.8, 8),
    flameMaterial
  );

  flame.position.set(0, 4.1, -8);

  scene.add(flame);

  world.altarFlame = flame;

  const emberLight = new THREE.PointLight(
    COLORS.ember,
    65,
    24,
    2
  );

  emberLight.position.set(0, 4.2, -8);
  emberLight.castShadow = true;

  scene.add(emberLight);

  world.emberLights.push(emberLight);

  createAltarPillars(scene);
}

function createAltarPillars(scene) {
  const material =
    createStoneMaterial(COLORS.stone);

  const positions = [
    [-7.5, -2],
    [7.5, -2],
    [-7.5, -14],
    [7.5, -14]
  ];

  positions.forEach(([x, z], index) => {
    const height =
      index === 1 ? 5.8 : 7.2;

    const pillar = createPillar(
      material,
      height
    );

    pillar.position.set(x, height / 2, z);

    pillar.rotation.z =
      index === 2 ? -0.08 : 0;

    scene.add(pillar);
  });
}

function createGate(scene, world) {
  const gateGroup = new THREE.Group();

  gateGroup.position.set(0, 0, -34);

  const stoneMaterial =
    createStoneMaterial(COLORS.stoneDark);

  const gateMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x16191d,
      roughness: 0.78,
      metalness: 0.12
    });

  const leftTower = new THREE.Mesh(
    new THREE.BoxGeometry(8, 16, 5),
    stoneMaterial
  );

  leftTower.position.set(-8, 8, 0);

  const rightTower = leftTower.clone();
  rightTower.position.x = 8;

  const topStone = new THREE.Mesh(
    new THREE.BoxGeometry(24, 5, 5),
    stoneMaterial
  );

  topStone.position.set(0, 15, 0);

  const gate = new THREE.Mesh(
    new THREE.BoxGeometry(10, 12, 1),
    gateMaterial
  );

  gate.position.set(0, 6, 1.3);

  const gateFrame = new THREE.Mesh(
    new THREE.TorusGeometry(
      5.1,
      0.55,
      8,
      24,
      Math.PI
    ),
    stoneMaterial
  );

  gateFrame.rotation.z = Math.PI;
  gateFrame.position.set(0, 10.8, 1);

  [
    leftTower,
    rightTower,
    topStone,
    gate,
    gateFrame
  ].forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    gateGroup.add(mesh);
  });

  createGateRunes(gateGroup, world);

  scene.add(gateGroup);

  const gateLight = new THREE.PointLight(
    COLORS.rune,
    28,
    18,
    2
  );

  gateLight.position.set(0, 7, -30.5);

  scene.add(gateLight);

  world.emberLights.push(gateLight);
}

function createGateRunes(gateGroup, world) {
  const runeMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.ember,
      emissive: COLORS.ember,
      emissiveIntensity: 2,
      roughness: 0.55
    });

  world.runeMaterials.push(runeMaterial);

  const verticalRune = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 6.5, 0.12),
    runeMaterial
  );

  verticalRune.position.set(0, 6, 1.88);

  gateGroup.add(verticalRune);

  const runeSegments = [
    [-1.7, 7.8, 1.2, 0.18, 0.65],
    [1.7, 7.8, 1.2, 0.18, -0.65],
    [-2.1, 5.4, 1.5, 0.18, -0.5],
    [2.1, 5.4, 1.5, 0.18, 0.5],
    [-1.4, 3.4, 1.1, 0.18, 0.75],
    [1.4, 3.4, 1.1, 0.18, -0.75]
  ];

  runeSegments.forEach(
    ([x, y, width, height, rotation]) => {
      const rune = new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          0.12
        ),
        runeMaterial
      );

      rune.position.set(x, y, 1.88);
      rune.rotation.z = rotation;

      gateGroup.add(rune);
    }
  );
}

function createRuins(scene) {
  const stoneMaterial =
    createStoneMaterial(COLORS.stoneDark);

  const wallData = [
    [-18, 2.6, -6, 1.8, 5.2, 12, 0.08],
    [18, 3.2, -8, 1.8, 6.4, 15, -0.06],
    [-15, 2, -22, 10, 4, 1.7, 0.05],
    [16, 2.8, -24, 12, 5.6, 1.8, -0.04],
    [-20, 2.2, 8, 1.7, 4.4, 9, 0.12],
    [20, 2.4, 6, 1.7, 4.8, 8, -0.1]
  ];

  wallData.forEach(
    ([x, y, z, width, height, depth, rotation]) => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          depth
        ),
        stoneMaterial
      );

      wall.position.set(x, y, z);
      wall.rotation.y = rotation;

      wall.castShadow = true;
      wall.receiveShadow = true;

      scene.add(wall);
    }
  );

  const rubblePositions = [
    [-12, -1],
    [13, -3],
    [-14, -15],
    [12, -18],
    [-9, 11],
    [10, 9],
    [-19, -26],
    [19, -27]
  ];

  rubblePositions.forEach(
    ([x, z], groupIndex) => {
      for (let index = 0; index < 6; index += 1) {
        const size =
          0.4 + pseudoRandom(index + groupIndex) * 1.1;

        const rubble = new THREE.Mesh(
          new THREE.DodecahedronGeometry(
            size,
            0
          ),
          stoneMaterial
        );

        rubble.position.set(
          x + (pseudoRandom(index * 3.2) - 0.5) * 4,
          size * 0.45,
          z + (pseudoRandom(index * 6.4) - 0.5) * 4
        );

        rubble.rotation.set(
          pseudoRandom(index) * Math.PI,
          pseudoRandom(index * 2.1) * Math.PI,
          pseudoRandom(index * 4.1) * Math.PI
        );

        rubble.castShadow = true;
        rubble.receiveShadow = true;

        scene.add(rubble);
      }
    }
  );
}

function createDeadTrees(scene) {
  const woodMaterial =
    new THREE.MeshStandardMaterial({
      color: COLORS.deadWood,
      roughness: 1
    });

  const positions = [
    [-22, 2],
    [23, -3],
    [-20, -20],
    [21, -19]
  ];

  positions.forEach(([x, z], index) => {
    const tree = new THREE.Group();

    const trunkHeight =
      5 + pseudoRandom(index * 4.2) * 3;

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.25,
        0.55,
        trunkHeight,
        7
      ),
      woodMaterial
    );

    trunk.position.y = trunkHeight / 2;
    trunk.rotation.z =
      (pseudoRandom(index) - 0.5) * 0.18;

    trunk.castShadow = true;

    tree.add(trunk);

    for (
      let branchIndex = 0;
      branchIndex < 4;
      branchIndex += 1
    ) {
      const branchLength =
        1.8 +
        pseudoRandom(
          index * 9 + branchIndex
        ) * 1.7;

      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.08,
          0.18,
          branchLength,
          6
        ),
        woodMaterial
      );

      branch.position.set(
        0,
        trunkHeight * 0.55 +
          branchIndex * 0.55,
        0
      );

      branch.rotation.z =
        branchIndex % 2 === 0
          ? -0.85
          : 0.85;

      branch.rotation.y =
        branchIndex * 1.35;

      branch.castShadow = true;

      tree.add(branch);
    }

    tree.position.set(x, 0, z);
    tree.rotation.y =
      pseudoRandom(index * 5.5) * Math.PI;

    scene.add(tree);
  });
}

function createMountains(scene) {
  const mountainMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x10151c,
      roughness: 1,
      flatShading: true
    });

  for (let index = 0; index < 18; index += 1) {
    const angle =
      (index / 18) * Math.PI * 2;

    const radius =
      55 + pseudoRandom(index * 2.2) * 15;

    const height =
      14 + pseudoRandom(index * 7.6) * 23;

    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(
        8 + pseudoRandom(index) * 8,
        height,
        6
      ),
      mountainMaterial
    );

    mountain.position.set(
      Math.cos(angle) * radius,
      height / 2 - 2,
      -12 + Math.sin(angle) * radius
    );

    mountain.rotation.y =
      pseudoRandom(index * 5.1) * Math.PI;

    scene.add(mountain);
  }
}

function createAshParticles(scene, world) {
  const particleCount = 650;

  const positions =
    new Float32Array(particleCount * 3);

  const speeds = [];

  for (let index = 0; index < particleCount; index += 1) {
    const radius =
      Math.sqrt(Math.random()) * 30;

    const angle =
      Math.random() * Math.PI * 2;

    positions[index * 3] =
      Math.cos(angle) * radius;

    positions[index * 3 + 1] =
      Math.random() * 13 + 0.6;

    positions[index * 3 + 2] =
      -8 + Math.sin(angle) * radius;

    speeds.push(
      0.15 + Math.random() * 0.42
    );
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material =
    new THREE.PointsMaterial({
      color: COLORS.emberLight,
      size: 0.075,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

  const particles = new THREE.Points(
    geometry,
    material
  );

  scene.add(particles);

  world.ashParticles = particles;
  world.ashPositions = positions;
  world.ashSpeeds = speeds;
}

export function updateWorld(
  world,
  deltaTime,
  elapsedTime
) {
  updateAshParticles(world, deltaTime);
  updateEmberLights(world, elapsedTime);
  updateRunes(world, elapsedTime);
  updateAltarFlame(world, elapsedTime);
}

function updateAshParticles(world, deltaTime) {
  if (
    !world.ashParticles ||
    !world.ashPositions
  ) {
    return;
  }

  const positions = world.ashPositions;

  for (
    let index = 0;
    index < world.ashSpeeds.length;
    index += 1
  ) {
    const yIndex = index * 3 + 1;
    const xIndex = index * 3;
    const zIndex = index * 3 + 2;

    positions[yIndex] +=
      world.ashSpeeds[index] * deltaTime;

    positions[xIndex] +=
      Math.sin(
        positions[yIndex] * 0.8 + index
      ) *
      deltaTime *
      0.08;

    if (positions[yIndex] > 15) {
      positions[yIndex] = 0.4;
      positions[xIndex] =
        (Math.random() - 0.5) * 50;
      positions[zIndex] =
        -8 + (Math.random() - 0.5) * 50;
    }
  }

  world.ashParticles.geometry.attributes
    .position.needsUpdate = true;
}

function updateEmberLights(world, elapsedTime) {
  world.emberLights.forEach(
    (light, index) => {
      const flicker =
        Math.sin(
          elapsedTime * (3.2 + index)
        ) *
        0.08 +
        Math.sin(
          elapsedTime * (7.1 + index)
        ) *
        0.04;

      light.intensity =
        index === 0
          ? 62 + flicker * 70
          : 27 + flicker * 30;
    }
  );
}

function updateRunes(world, elapsedTime) {
  world.runeMaterials.forEach((material) => {
    material.emissiveIntensity =
      1.7 +
      Math.sin(elapsedTime * 1.8) * 0.35;
  });
}

function updateAltarFlame(world, elapsedTime) {
  if (!world.altarFlame) {
    return;
  }

  world.altarFlame.scale.set(
    1 + Math.sin(elapsedTime * 7.4) * 0.08,
    1 + Math.sin(elapsedTime * 5.8) * 0.14,
    1 + Math.sin(elapsedTime * 6.9) * 0.08
  );

  world.altarFlame.position.x =
    Math.sin(elapsedTime * 3.7) * 0.06;
}

function createPillar(material, height) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.95,
      1.15,
      0.65,
      8
    ),
    material
  );

  base.position.y = 0.32;

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.62,
      0.78,
      height - 1.2,
      8
    ),
    material
  );

  shaft.position.y = height / 2;

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(
      1.05,
      0.82,
      0.55,
      8
    ),
    material
  );

  top.position.y = height - 0.28;

  [base, shaft, top].forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  return group;
}

function createStoneMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.92,
    metalness: 0.03,
    flatShading: true
  });
}

function pseudoRandom(seed) {
  const value =
    Math.sin(seed * 12.9898) * 43758.5453;

  return value - Math.floor(value);
}
