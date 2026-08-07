import * as THREE from "three";

import {
  FIELD,
  giveBallToPlayer,
  releaseBall,
  tryClaimBall
} from "./world.js";

const TEAM_DATA = {
  red: {
    color:
      0xc74a43,

    dark:
      0x7f2d2a,

    attackDirection:
      1,

    ownGoalX:
      -FIELD.goalX,

    targetGoalX:
      FIELD.goalX
  },

  blue: {
    color:
      0x4f73c9,

    dark:
      0x304c91,

    attackDirection:
      -1,

    ownGoalX:
      FIELD.goalX,

    targetGoalX:
      -FIELD.goalX
  }
};

const FORMATION = [
  {
    role: "GK",
    x: -28,
    z: 0
  },

  {
    role: "DF",
    x: -20,
    z: -12
  },

  {
    role: "DF",
    x: -22,
    z: -4
  },

  {
    role: "DF",
    x: -22,
    z: 4
  },

  {
    role: "DF",
    x: -20,
    z: 12
  },

  {
    role: "MF",
    x: -8,
    z: -10
  },

  {
    role: "MF",
    x: -10,
    z: 0
  },

  {
    role: "MF",
    x: -8,
    z: 10
  },

  {
    role: "FW",
    x: 5,
    z: -10
  },

  {
    role: "FW",
    x: 9,
    z: 0
  },

  {
    role: "FW",
    x: 5,
    z: 10
  }
];

export function createTeams(
  scene
) {
  const teams = {
    red: [],
    blue: [],
    all: []
  };

  for (
    const teamName of [
      "red",
      "blue"
    ]
  ) {
    const assets =
      createTeamAssets(
        teamName
      );

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
            index,
            assets
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

        teams[
          teamName
        ].push(
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

function createTeamAssets(
  team
) {
  const data =
    TEAM_DATA[
      team
    ];

  return {
    bodyGeometry:
      new THREE.CapsuleGeometry(
        0.42,
        0.8,
        4,
        8
      ),

    headGeometry:
      new THREE.SphereGeometry(
        0.34,
        10,
        8
      ),

    legGeometry:
      new THREE.CapsuleGeometry(
        0.14,
        0.45,
        3,
        6
      ),

    bodyMaterial:
      new THREE.MeshStandardMaterial({
        color:
          data.color,

        roughness:
          0.72
      }),

    darkMaterial:
      new THREE.MeshStandardMaterial({
        color:
          data.dark,

        roughness:
          0.78
      }),

    skinMaterial:
      new THREE.MeshStandardMaterial({
        color:
          0xe5b28c,

        roughness:
          0.88
      })
  };
}

function createPlayer(
  team,
  role,
  index,
  assets
) {
  const group =
    new THREE.Group();

  const body =
    new THREE.Mesh(
      assets.bodyGeometry,
      assets.bodyMaterial
    );

  body.position.y =
    1.05;

  const head =
    new THREE.Mesh(
      assets.headGeometry,
      assets.skinMaterial
    );

  head.position.y =
    1.95;

  const leftLeg =
    new THREE.Mesh(
      assets.legGeometry,
      assets.darkMaterial
    );

  leftLeg.position.set(
    -0.2,
    0.35,
    0
  );

  const rightLeg =
    new THREE.Mesh(
      assets.legGeometry,
      assets.darkMaterial
    );

  rightLeg.position.set(
    0.2,
    0.35,
    0
  );

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
            : TEAM_DATA[
                team
              ].color,

        transparent:
          true,

        opacity:
          0.55,

        side:
          THREE.DoubleSide
      })
    );

  marker.rotation.x =
    -Math.PI / 2;

  marker.position.y =
    0.04;

  group.add(
    body,
    head,
    leftLeg,
    rightLeg,
    marker
  );

  group.traverse(
    (object) => {
      if (
        object.isMesh
      ) {
        object.castShadow =
          true;

        object.receiveShadow =
          true;
      }
    }
  );

  const baseSpeed =
    role === "GK"
      ? 5.1
      : role === "DF"
        ? 5.65
        : role === "MF"
          ? 5.95
          : 6.15;

  return {
    team,
    role,
    index,

    group,

    position:
      group.position,

    velocity:
      new THREE.Vector3(),

    forward:
      new THREE.Vector3(
        TEAM_DATA[
          team
        ].attackDirection,
        0,
        0
      ),

    homePosition:
      new THREE.Vector3(),

    target:
      new THREE.Vector3(),

    speed:
      baseSpeed +
      (
        index %
        3
      ) *
        0.08,

    actionCooldown:
      Math.random() *
      0.35,

    tackleCooldown:
      Math.random() *
      0.3,

    decisionCooldown:
      Math.random() *
      0.2
  };
}

export function resetTeams(
  teams
) {
  for (
    const player of
      teams.all
  ) {
    player.position.copy(
      player.homePosition
    );

    player.velocity.set(
      0,
      0,
      0
    );

    player.forward.set(
      TEAM_DATA[
        player.team
      ].attackDirection,
      0,
      0
    );

    player.actionCooldown =
      0.25 +
      Math.random() *
        0.25;

    player.tackleCooldown =
      Math.random() *
      0.25;

    player.decisionCooldown =
      Math.random() *
      0.2;
  }
}

export function setKickoffPossession(
  teams,
  world,
  teamName
) {
  const team =
    teams[
      teamName
    ];

  const kickoffPlayer =
    team.find(
      (player) =>
        player.role === "FW" &&
        player.index === 9
    ) ??
    team.find(
      (player) =>
        player.role === "FW"
    ) ??
    team[0];

  kickoffPlayer.position.set(
    teamName === "red"
      ? -1.1
      : 1.1,
    0,
    0
  );

  kickoffPlayer.forward.set(
    TEAM_DATA[
      teamName
    ].attackDirection,
    0,
    0
  );

  giveBallToPlayer(
    world,
    kickoffPlayer
  );
}

export function updateTeams(
  teams,
  world,
  deltaTime,
  elapsedTime
) {
  updateCooldowns(
    teams,
    deltaTime
  );

  const carrier =
    world.ballState.owner;

  const possessionTeam =
    carrier?.team ??
    null;

  const ballReference =
    carrier?.position ??
    world.ball.position;

  const nearestRed =
    findNearestPlayer(
      teams.red,
      ballReference,
      true
    );

  const nearestBlue =
    findNearestPlayer(
      teams.blue,
      ballReference,
      true
    );

  const redPresser =
    possessionTeam === "blue"
      ? nearestRed.player
      : null;

  const bluePresser =
    possessionTeam === "red"
      ? nearestBlue.player
      : null;

  for (
    const teamName of [
      "red",
      "blue"
    ]
  ) {
    const team =
      teams[
        teamName
      ];

    const opponent =
      teams[
        teamName === "red"
          ? "blue"
          : "red"
      ];

    const presser =
      teamName === "red"
        ? redPresser
        : bluePresser;

    for (
      const player of
        team
    ) {
      chooseTarget(
        player,
        team,
        opponent,
        world,
        possessionTeam,
        presser,
        elapsedTime
      );

      movePlayer(
        player,
        deltaTime
      );
    }
  }

  resolveAllSpacing(
    teams.all
  );

  handleLooseBall(
    teams,
    world
  );

  handleTackles(
    teams,
    world
  );

  handleGoalkeeperSave(
    teams,
    world
  );

  handleCarrierAction(
    teams,
    world,
    elapsedTime
  );
}

function updateCooldowns(
  teams,
  deltaTime
) {
  for (
    const player of
      teams.all
  ) {
    player.actionCooldown =
      Math.max(
        0,
        player.actionCooldown -
          deltaTime
      );

    player.tackleCooldown =
      Math.max(
        0,
        player.tackleCooldown -
          deltaTime
      );

    player.decisionCooldown =
      Math.max(
        0,
        player.decisionCooldown -
          deltaTime
      );
  }
}

function chooseTarget(
  player,
  team,
  opponent,
  world,
  possessionTeam,
  presser,
  elapsedTime
) {
  const data =
    TEAM_DATA[
      player.team
    ];

  const carrier =
    world.ballState.owner;

  const ballPosition =
    carrier?.position ??
    world.ball.position;

  if (
    player.role === "GK"
  ) {
    chooseGoalkeeperTarget(
      player,
      world,
      possessionTeam
    );

    return;
  }

  if (
    carrier === player
  ) {
    chooseCarrierTarget(
      player,
      opponent,
      world
    );

    return;
  }

  if (
    !carrier &&
    isNearestEligiblePlayer(
      player,
      team,
      world.ball.position
    )
  ) {
    player.target.copy(
      world.ball.position
    );

    return;
  }

  if (
    possessionTeam ===
    player.team
  ) {
    chooseAttackingSupportTarget(
      player,
      ballPosition,
      elapsedTime
    );

    return;
  }

  if (
    possessionTeam &&
    possessionTeam !==
      player.team
  ) {
    if (
      player ===
      presser
    ) {
      player.target.copy(
        carrier?.position ??
        world.ball.position
      );

      return;
    }

    chooseDefensiveTarget(
      player,
      ballPosition,
      data
    );

    return;
  }

  chooseNeutralShapeTarget(
    player,
    ballPosition
  );
}

function chooseGoalkeeperTarget(
  player,
  world,
  possessionTeam
) {
  const data =
    TEAM_DATA[
      player.team
    ];

  const ball =
    world.ballState.owner
      ?.position ??
    world.ball.position;

  const baseX =
    data.ownGoalX +
    data.attackDirection *
      2.5;

  player.target.set(
    baseX,
    0,
    THREE.MathUtils.clamp(
      ball.z *
        0.42,
      -4.8,
      4.8
    )
  );

  const danger =
    Math.abs(
      ball.x -
      data.ownGoalX
    ) <
      9.5;

  if (
    danger &&
    possessionTeam !==
      player.team
  ) {
    player.target.x =
      THREE.MathUtils.lerp(
        baseX,
        ball.x,
        0.28
      );

    player.target.z =
      THREE.MathUtils.clamp(
        ball.z,
        -5.5,
        5.5
      );
  }
}

function chooseCarrierTarget(
  player,
  opponents,
  world
) {
  const data =
    TEAM_DATA[
      player.team
    ];

  const nearestOpponent =
    findNearestPlayer(
      opponents,
      player.position,
      false
    );

  let dodgeZ =
    0;

  if (
    nearestOpponent.player &&
    nearestOpponent.distance <
      4.5
  ) {
    const away =
      player.position.z -
      nearestOpponent
        .player
        .position
        .z;

    dodgeZ =
      Math.sign(
        away ||
        1
      ) *
      (
        2.5 -
        Math.min(
          nearestOpponent.distance,
          2.5
        )
      );
  }

  player.target.set(
    THREE.MathUtils.clamp(
      player.position.x +
        data.attackDirection *
          7,
      -29,
      29
    ),
    0,
    THREE.MathUtils.clamp(
      player.position.z +
        dodgeZ,
      -16.5,
      16.5
    )
  );
}

function chooseAttackingSupportTarget(
  player,
  ball,
  elapsedTime
) {
  const data =
    TEAM_DATA[
      player.team
    ];

  const roleDepth =
    player.role === "FW"
      ? 4.5
      : player.role === "MF"
        ? -3.5
        : -10.5;

  const targetX =
    ball.x +
    data.attackDirection *
      roleDepth;

  const laneBlend =
    player.homePosition.z *
    (
      player.role === "FW"
        ? 0.72
        : 0.82
    );

  const wave =
    Math.sin(
      elapsedTime *
        0.55 +
      player.index *
        0.8
    ) *
    0.45;

  player.target.set(
    THREE.MathUtils.clamp(
      targetX,
      -28,
      28
    ),
    0,
    THREE.MathUtils.clamp(
      laneBlend +
        ball.z *
          0.22 +
        wave,
      -17,
      17
    )
  );
}

function chooseDefensiveTarget(
  player,
  ball,
  data
) {
  const ballShift =
    THREE.MathUtils.clamp(
      ball.x *
        0.26,
      -7,
      7
    );

  const ownGoalBias =
    data.ownGoalX *
    0.08;

  player.target.set(
    THREE.MathUtils.clamp(
      player.homePosition.x +
        ballShift +
        ownGoalBias,
      -28,
      28
    ),
    0,
    THREE.MathUtils.clamp(
      player.homePosition.z *
        0.82 +
        ball.z *
          0.28,
      -17,
      17
    )
  );
}

function chooseNeutralShapeTarget(
  player,
  ball
) {
  player.target.set(
    THREE.MathUtils.clamp(
      player.homePosition.x +
        ball.x *
          0.12,
      -28,
      28
    ),
    0,
    THREE.MathUtils.clamp(
      player.homePosition.z +
        ball.z *
          0.12,
      -17,
      17
    )
  );
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

  toTarget.y =
    0;

  const distance =
    toTarget.length();

  if (
    distance >
    0.08
  ) {
    toTarget.normalize();

    const desiredVelocity =
      toTarget.multiplyScalar(
        player.speed
      );

    const smoothing =
      1 -
      Math.exp(
        -7.5 *
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

    if (
      player.velocity.lengthSq() >
      0.05
    ) {
      player.forward.copy(
        player.velocity
      );

      player.forward.y =
        0;

      player.forward.normalize();

      player.group.rotation.y =
        Math.atan2(
          player.forward.x,
          player.forward.z
        );
    }
  } else {
    player.velocity.multiplyScalar(
      Math.exp(
        -9 *
        deltaTime
      )
    );
  }

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -29.5,
      29.5
    );

  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -17.8,
      17.8
    );
}

function resolveAllSpacing(
  players
) {
  for (
    let firstIndex = 0;
    firstIndex <
      players.length;
    firstIndex += 1
  ) {
    const first =
      players[
        firstIndex
      ];

    for (
      let secondIndex =
        firstIndex + 1;
      secondIndex <
        players.length;
      secondIndex += 1
    ) {
      const second =
        players[
          secondIndex
        ];

      const dx =
        first.position.x -
        second.position.x;

      const dz =
        first.position.z -
        second.position.z;

      const distanceSq =
        dx *
          dx +
        dz *
          dz;

      const minimumDistance =
        0.92;

      if (
        distanceSq <= 0 ||
        distanceSq >=
          minimumDistance *
            minimumDistance
      ) {
        continue;
      }

      const distance =
        Math.sqrt(
          distanceSq
        );

      const overlap =
        (
          minimumDistance -
          distance
        ) *
        0.5;

      const normalX =
        dx /
        distance;

      const normalZ =
        dz /
        distance;

      first.position.x +=
        normalX *
        overlap;

      first.position.z +=
        normalZ *
        overlap;

      second.position.x -=
        normalX *
        overlap;

      second.position.z -=
        normalZ *
        overlap;
    }
  }
}

function handleLooseBall(
  teams,
  world
) {
  if (
    world.ballState.owner ||
    world.ballState.lockTimer >
      0
  ) {
    return;
  }

  const nearest =
    findNearestPlayer(
      teams.all,
      world.ball.position,
      false
    );

  if (
    nearest.player &&
    nearest.distance <=
      (
        nearest.player.role === "GK"
          ? 1.45
          : 1.16
      )
  ) {
    tryClaimBall(
      world,
      nearest.player,
      nearest.player.role === "GK"
        ? 1.45
        : 1.16
    );
  }
}

function handleTackles(
  teams,
  world
) {
  const carrier =
    world.ballState.owner;

  if (
    !carrier
  ) {
    return;
  }

  const opponentTeam =
    teams[
      carrier.team === "red"
        ? "blue"
        : "red"
    ];

  const nearestDefender =
    findNearestPlayer(
      opponentTeam,
      carrier.position,
      false
    );

  const defender =
    nearestDefender.player;

  if (
    !defender ||
    defender.tackleCooldown >
      0 ||
    nearestDefender.distance >
      1.08
  ) {
    return;
  }

  defender.tackleCooldown =
    0.8;

  carrier.actionCooldown =
    Math.max(
      carrier.actionCooldown,
      0.24
    );

  const roleBonus =
    defender.role === "DF"
      ? 0.09
      : defender.role === "MF"
        ? 0.05
        : 0;

  const speedPenalty =
    Math.min(
      carrier.velocity.length() /
        20,
      0.12
    );

  const successChance =
    THREE.MathUtils.clamp(
      0.34 +
        roleBonus -
        speedPenalty,
      0.2,
      0.52
    );

  if (
    Math.random() <
    successChance
  ) {
    giveBallToPlayer(
      world,
      defender
    );

    defender.actionCooldown =
      0.34;

    carrier.velocity.multiplyScalar(
      0.55
    );
  } else {
    defender.velocity.multiplyScalar(
      0.55
    );
  }
}

function handleGoalkeeperSave(
  teams,
  world
) {
  if (
    world.ballState.owner
  ) {
    return;
  }

  for (
    const teamName of [
      "red",
      "blue"
    ]
  ) {
    const goalkeeper =
      teams[
        teamName
      ].find(
        (player) =>
          player.role === "GK"
      );

    if (
      !goalkeeper
    ) {
      continue;
    }

    const data =
      TEAM_DATA[
        teamName
      ];

    const ball =
      world.ball.position;

    const inKeeperZone =
      Math.abs(
        ball.x -
        data.ownGoalX
      ) <
        7.5 &&
      Math.abs(
        ball.z
      ) <
        7.2;

    if (
      !inKeeperZone
    ) {
      continue;
    }

    const distance =
      goalkeeper.position
        .distanceTo(
          ball
        );

    if (
      distance <
      1.75
    ) {
      giveBallToPlayer(
        world,
        goalkeeper
      );

      goalkeeper.actionCooldown =
        0.75;

      goalkeeper.velocity.multiplyScalar(
        0.4
      );

      return;
    }
  }
}

function handleCarrierAction(
  teams,
  world,
  elapsedTime
) {
  const carrier =
    world.ballState.owner;

  if (
    !carrier ||
    carrier.actionCooldown >
      0
  ) {
    return;
  }

  const team =
    teams[
      carrier.team
    ];

  const opponents =
    teams[
      carrier.team === "red"
        ? "blue"
        : "red"
    ];

  const data =
    TEAM_DATA[
      carrier.team
    ];

  if (
    carrier.role === "GK"
  ) {
    const receiver =
      choosePassReceiver(
        carrier,
        team,
        opponents,
        true
      );

    if (
      receiver
    ) {
      passBall(
        carrier,
        receiver,
        world,
        11.5
      );

      carrier.actionCooldown =
        0.85;
    }

    return;
  }

  const nearestOpponent =
    findNearestPlayer(
      opponents,
      carrier.position,
      false
    );

  const pressure =
    nearestOpponent.distance;

  const distanceToGoal =
    Math.abs(
      data.targetGoalX -
      carrier.position.x
    );

  const shootRange =
    carrier.role === "FW"
      ? 20
      : carrier.role === "MF"
        ? 16
        : 12;

  const goalAngleGood =
    Math.abs(
      carrier.position.z
    ) <
      12.5;

  if (
    distanceToGoal <
      shootRange &&
    goalAngleGood
  ) {
    shootBall(
      carrier,
      world,
      teams
    );

    carrier.actionCooldown =
      0.9;

    return;
  }

  const shouldPass =
    pressure <
      2.6 ||
    world.ballState.possessionAge >
      2.8 ||
    (
      carrier.role === "DF" &&
      distanceToGoal >
        35
    );

  if (
    shouldPass
  ) {
    const receiver =
      choosePassReceiver(
        carrier,
        team,
        opponents,
        false
      );

    if (
      receiver
    ) {
      const passSpeed =
        10.2 +
        Math.min(
          carrier.position.distanceTo(
            receiver.position
          ) *
            0.16,
          2.4
        );

      passBall(
        carrier,
        receiver,
        world,
        passSpeed
      );

      carrier.actionCooldown =
        0.72;

      return;
    }
  }

  carrier.actionCooldown =
    0.18 +
    Math.abs(
      Math.sin(
        elapsedTime +
        carrier.index
      )
    ) *
      0.12;
}

function choosePassReceiver(
  carrier,
  teammates,
  opponents,
  goalkeeperDistribution
) {
  const data =
    TEAM_DATA[
      carrier.team
    ];

  let bestPlayer =
    null;

  let bestScore =
    -Infinity;

  for (
    const candidate of
      teammates
  ) {
    if (
      candidate ===
      carrier
    ) {
      continue;
    }

    if (
      !goalkeeperDistribution &&
      candidate.role === "GK"
    ) {
      continue;
    }

    const distance =
      carrier.position.distanceTo(
        candidate.position
      );

    if (
      distance <
        3 ||
      distance >
        (
          goalkeeperDistribution
            ? 24
            : 20
        )
    ) {
      continue;
    }

    const forwardProgress =
      (
        candidate.position.x -
        carrier.position.x
      ) *
      data.attackDirection;

    const openness =
      findNearestPlayer(
        opponents,
        candidate.position,
        false
      ).distance;

    const centralPenalty =
      Math.abs(
        candidate.position.z
      ) *
      0.04;

    const roleBonus =
      candidate.role === "FW"
        ? 1.1
        : candidate.role === "MF"
          ? 0.7
          : 0.15;

    const score =
      forwardProgress *
        (
          goalkeeperDistribution
            ? 0.75
            : 1.15
        ) +
      openness *
        0.95 +
      roleBonus -
      distance *
        0.2 -
      centralPenalty;

    if (
      score >
      bestScore
    ) {
      bestScore =
        score;

      bestPlayer =
        candidate;
    }
  }

  return bestPlayer;
}

function passBall(
  carrier,
  receiver,
  world,
  speed
) {
  const predictedTarget =
    receiver.position
      .clone()
      .addScaledVector(
        receiver.velocity,
        0.23
      );

  releaseBall(
    world,
    carrier,
    predictedTarget,
    speed,
    0.55
  );
}

function shootBall(
  carrier,
  world,
  teams
) {
  const data =
    TEAM_DATA[
      carrier.team
    ];

  const opponentTeam =
    teams[
      carrier.team === "red"
        ? "blue"
        : "red"
    ];

  const goalkeeper =
    opponentTeam.find(
      (player) =>
        player.role === "GK"
    );

  const keeperZ =
    goalkeeper
      ?.position
      .z ??
    0;

  const targetZ =
    keeperZ >= 0
      ? -2.9 -
        Math.random() *
          0.7
      : 2.9 +
        Math.random() *
          0.7;

  const target =
    new THREE.Vector3(
      data.targetGoalX +
        data.attackDirection *
          2.2,
      0,
      THREE.MathUtils.clamp(
        targetZ,
        -3.65,
        3.65
      )
    );

  releaseBall(
    world,
    carrier,
    target,
    carrier.role === "FW"
      ? 17
      : 15.8,
    1.25
  );
}

function isNearestEligiblePlayer(
  player,
  team,
  position
) {
  const nearest =
    findNearestPlayer(
      team,
      position,
      true
    );

  return (
    nearest.player ===
    player
  );
}

function findNearestPlayer(
  players,
  position,
  excludeGoalkeeper
) {
  let nearest =
    null;

  let distance =
    Infinity;

  for (
    const player of
      players
  ) {
    if (
      excludeGoalkeeper &&
      player.role === "GK"
    ) {
      continue;
    }

    const dx =
      player.position.x -
      position.x;

    const dz =
      player.position.z -
      position.z;

    const currentDistance =
      Math.sqrt(
        dx *
          dx +
        dz *
          dz
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
    player:
      nearest,

    distance
  };
}
