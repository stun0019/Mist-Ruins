import * as THREE from "three";

const FIELD = {
  halfWidth: 31,
  halfDepth: 19
};

const TEAM_DATA = {
  red: {
    color: 0xc74a43,
    dark: 0x7f2d2a,
    attackDirection: 1,
    ownGoalX: -32,
    targetGoalX: 32
  },

  blue: {
    color: 0x4f73c9,
    dark: 0x304c91,
    attackDirection: -1,
    ownGoalX: 32,
    targetGoalX: -32
  }
};

const FORMATION = [
  { role: "GK", x: -28, z: 0 },

  { role: "DF", x: -20, z: -12 },
  { role: "DF", x: -22, z: -4 },
  { role: "DF", x: -22, z: 4 },
  { role: "DF", x: -20, z: 12 },

  { role: "MF", x: -8, z: -10 },
  { role: "MF", x: -10, z: 0 },
  { role: "MF", x: -8, z: 10 },

  { role: "FW", x: 5, z: -10 },
  { role: "FW", x: 9, z: 0 },
  { role: "FW", x: 5, z: 10 }
];

export function createTeams(
  scene,
  world
) {
  const teams = {
    red: [],
    blue: [],
    all: [],
    possession: null,
    passCooldown: 0
  };

  for (
    const teamName of [
      "red",
      "blue"
    ]
  ) {
    FORMATION.forEach(
      (
        slot,
        index
      ) => {
        const x =
          teamName === "red"
            ? slot.x
            : -slot.x;

        const player =
          createPlayer(
            teamName,
            slot.role,
            index
          );

        player.homePosition.set(
          x,
          0,
          slot.z
        );

        player.position.copy(
          player.homePosition
        );

        scene.add(
          player.group
        );

        teams[teamName].push(
          player
        );

        teams.all.push(
          player
        );
      }
    );
  }

  resetTeams(
    teams
  );

  return teams;
}

function createPlayer(
  team,
  role,
  index
) {
  const data =
    TEAM_DATA[team];

  const group =
    new THREE.Group();

  const bodyMaterial =
    new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: 0.72
    });

  const darkMaterial =
    new THREE.MeshStandardMaterial({
      color: data.dark,
      roughness: 0.78
    });

  const skinMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xe5b28c,
      roughness: 0.88
    });

  const body =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.42,
        0.8,
        4,
        8
      ),
      bodyMaterial
    );

  body.position.y = 1.05;

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.34,
        10,
        8
      ),
      skinMaterial
    );

  head.position.y = 1.95;

  const leftLeg =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.14,
        0.45,
        3,
        6
      ),
      darkMaterial
    );

  leftLeg.position.set(
    -0.2,
    0.35,
    0
  );

  const rightLeg =
    leftLeg.clone();

  rightLeg.position.x =
    0.2;

  const marker =
    new THREE.Mesh(
      new THREE.RingGeometry(
        0.48,
        0.62,
        20
      ),
      new THREE.MeshBasicMaterial({
        color:
          role === "GK"
            ? 0xf4d45a
            : data.color,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      })
    );

  marker.rotation.x =
    -Math.PI / 2;

  marker.position.y = 0.04;

  group.add(
    body,
    head,
    leftLeg,
    rightLeg,
    marker
  );

  group.traverse(
    (object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    }
  );

  return {
    team,
    role,
    index,

    group,
    position: group.position,

    velocity:
      new THREE.Vector3(),

    homePosition:
      new THREE.Vector3(),

    target:
      new THREE.Vector3(),

    speed:
      role === "GK"
        ? 5.2
        : 5.8 +
          (index % 3) *
            0.25,

    kickCooldown: 0,
    decisionTimer:
      Math.random() *
      0.5
  };
}

export function resetTeams(
  teams
) {
  teams.possession = null;
  teams.passCooldown = 0;

  for (
    const player of teams.all
  ) {
    player.position.copy(
      player.homePosition
    );

    player.velocity.set(
      0,
      0,
      0
    );

    player.kickCooldown =
      Math.random() *
      0.5;
  }
}

export function updateTeams(
  teams,
  world,
  deltaTime,
  elapsedTime
) {
  const ball =
    world.ball;

  teams.passCooldown =
    Math.max(
      0,
      teams.passCooldown -
        deltaTime
    );

  const nearestRed =
    findNearestPlayer(
      teams.red,
      ball.position
    );

  const nearestBlue =
    findNearestPlayer(
      teams.blue,
      ball.position
    );

  for (
    const teamName of [
      "red",
      "blue"
    ]
  ) {
    const team =
      teams[teamName];

    const opponent =
      teams[
        teamName === "red"
          ? "blue"
          : "red"
      ];

    const nearest =
      teamName === "red"
        ? nearestRed
        : nearestBlue;

    const opponentNearest =
      teamName === "red"
        ? nearestBlue
        : nearestRed;

    const hasAdvantage =
      nearest.distance <
      opponentNearest.distance +
        0.45;

    for (
      const player of team
    ) {
      player.kickCooldown =
        Math.max(
          0,
          player.kickCooldown -
            deltaTime
        );

      chooseTarget(
        player,
        team,
        opponent,
        ball,
        nearest.player,
        hasAdvantage,
        elapsedTime
      );

      movePlayer(
        player,
        deltaTime
      );

      resolvePlayerSpacing(
        player,
        teams.all
      );

      tryKickBall(
        player,
        team,
        teams,
        world
      );
    }
  }
}

function chooseTarget(
  player,
  team,
  opponent,
  ball,
  nearestPlayer,
  hasAdvantage,
  elapsedTime
) {
  const data =
    TEAM_DATA[player.team];

  if (player.role === "GK") {
    const goalieX =
      data.ownGoalX -
      data.attackDirection *
        2.3;

    player.target.set(
      goalieX,
      0,
      THREE.MathUtils.clamp(
        ball.position.z *
          0.48,
        -5,
        5
      )
    );

    if (
      Math.abs(
        ball.position.x -
          data.ownGoalX
      ) <
        9
    ) {
      player.target.lerp(
        ball.position,
        0.42
      );
    }

    return;
  }

  if (
    player === nearestPlayer
  ) {
    player.target.copy(
      ball.position
    );

    return;
  }

  const ballProgress =
    ball.position.x *
    data.attackDirection;

  const homeProgress =
    player.homePosition.x *
    data.attackDirection;

  const isAttacking =
    hasAdvantage ||
    ballProgress >
      homeProgress -
        4;

  if (isAttacking) {
    const supportX =
      ball.position.x -
      data.attackDirection *
        (
          player.role === "FW"
            ? 2
            : player.role === "MF"
              ? 7
              : 13
        );

    const laneOffset =
      player.homePosition.z *
        0.68;

    player.target.set(
      THREE.MathUtils.clamp(
        supportX,
        -28,
        28
      ),
      0,
      THREE.MathUtils.clamp(
        ball.position.z *
          0.35 +
          laneOffset,
        -17,
        17
      )
    );
  } else {
    const defensiveShift =
      THREE.MathUtils.clamp(
        ball.position.x *
          0.28,
        -6,
        6
      );

    player.target.set(
      player.homePosition.x +
        defensiveShift,
      0,
      player.homePosition.z +
        ball.position.z *
          0.18
    );
  }

  const wave =
    Math.sin(
      elapsedTime *
        0.65 +
        player.index
    ) *
    0.7;

  player.target.z +=
    wave;
}

function movePlayer(
  player,
  deltaTime
) {
  const toTarget =
    player.target
      .clone()
      .sub(
        player.position
      );

  toTarget.y = 0;

  const distance =
    toTarget.length();

  if (distance > 0.08) {
    toTarget.normalize();

    const desiredVelocity =
      toTarget.multiplyScalar(
        player.speed
      );

    const smoothing =
      1 -
      Math.exp(
        -8 *
        deltaTime
      );

    player.velocity.lerp(
      desiredVelocity,
      smoothing
    );

    player.position.addScaledVector(
      player.velocity,
      deltaTime
    );

    player.group.rotation.y =
      Math.atan2(
        player.velocity.x,
        player.velocity.z
      );
  } else {
    player.velocity.multiplyScalar(
      Math.exp(
        -10 *
        deltaTime
      )
    );
  }

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -30,
      30
    );

  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -18,
      18
    );
}

function resolvePlayerSpacing(
  player,
  allPlayers
) {
  for (
    const other of allPlayers
  ) {
    if (
      other === player
    ) {
      continue;
    }

    const dx =
      player.position.x -
      other.position.x;

    const dz =
      player.position.z -
      other.position.z;

    const distanceSq =
      dx *
        dx +
      dz *
        dz;

    if (
      distanceSq >
        0 &&
      distanceSq <
        0.72
    ) {
      const distance =
        Math.sqrt(
          distanceSq
        );

      const push =
        (
          0.85 -
          distance
        ) *
        0.035;

      player.position.x +=
        dx /
        distance *
        push;

      player.position.z +=
        dz /
        distance *
        push;
    }
  }
}

function tryKickBall(
  player,
  team,
  teams,
  world
) {
  if (
    player.kickCooldown >
      0 ||
    world.ballState.lockTimer >
      0
  ) {
    return;
  }

  const ball =
    world.ball;

  const distance =
    player.position.distanceTo(
      ball.position
    );

  if (
    distance >
    1.35
  ) {
    return;
  }

  const data =
    TEAM_DATA[player.team];

  const distanceToGoal =
    Math.abs(
      data.targetGoalX -
      player.position.x
    );

  const shotChance =
    distanceToGoal <
      15 ||
    (
      player.role === "FW" &&
      distanceToGoal <
        22
    );

  if (shotChance) {
    const targetZ =
      THREE.MathUtils.clamp(
        (
          Math.random() -
          0.5
        ) *
          6.5,
        -3.3,
        3.3
      );

    kickTowards(
      world,
      player,
      new THREE.Vector3(
        data.targetGoalX +
          data.attackDirection *
            2,
        0,
        targetZ
      ),
      15.5
    );
  } else {
    const receiver =
      chooseReceiver(
        player,
        team,
        data.attackDirection
      );

    if (receiver) {
      kickTowards(
        world,
        player,
        receiver.position,
        10.5
      );
    } else {
      kickTowards(
        world,
        player,
        new THREE.Vector3(
          player.position.x +
            data.attackDirection *
              9,
          0,
          player.position.z
        ),
        9.5
      );
    }
  }

  player.kickCooldown =
    0.75;

  teams.passCooldown =
    0.4;
}

function chooseReceiver(
  player,
  team,
  attackDirection
) {
  let best = null;
  let bestScore =
    -Infinity;

  for (
    const candidate of team
  ) {
    if (
      candidate === player ||
      candidate.role === "GK"
    ) {
      continue;
    }

    const dx =
      (
        candidate.position.x -
        player.position.x
      ) *
      attackDirection;

    const distance =
      candidate.position.distanceTo(
        player.position
      );

    if (
      distance >
        18 ||
      distance <
        3
    ) {
      continue;
    }

    const score =
      dx *
        1.5 -
      distance *
        0.35 -
      Math.abs(
        candidate.position.z -
        player.position.z
      ) *
        0.1;

    if (
      score >
      bestScore
    ) {
      bestScore =
        score;

      best =
        candidate;
    }
  }

  return best;
}

function kickTowards(
  world,
  player,
  target,
  speed
) {
  const direction =
    target
      .clone()
      .sub(
        world.ball.position
      );

  direction.y = 0;

  if (
    direction.lengthSq() <
    0.001
  ) {
    return;
  }

  direction.normalize();

  world.ballVelocity.copy(
    direction.multiplyScalar(
      speed
    )
  );

  world.ballVelocity.y =
    speed >
      13
      ? 2.1
      : 0.7;

  world.ballState.lastTouch =
    player.team;

  world.ballState.lockTimer =
    0.12;
}

function findNearestPlayer(
  team,
  position
) {
  let nearest = null;
  let distance =
    Infinity;

  for (
    const player of team
  ) {
    const currentDistance =
      player.position.distanceTo(
        position
      );

    if (
      currentDistance <
      distance
    ) {
      distance =
        currentDistance;

      nearest =
        player;
    }
  }

  return {
    player: nearest,
    distance
  };
}
