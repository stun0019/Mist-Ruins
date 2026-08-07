export class MatchUI {
  constructor() {
    this.redScoreElement =
      document.querySelector(
        "#red-score"
      );

    this.blueScoreElement =
      document.querySelector(
        "#blue-score"
      );

    this.clockElement =
      document.querySelector(
        "#match-clock"
      );

    this.statusElement =
      document.querySelector(
        "#match-status"
      );

    this.possessionElement =
      document.querySelector(
        "#possession-status"
      );

    this.redScore =
      0;

    this.blueScore =
      0;

    this.elapsedSeconds =
      0;

    this.lastPossession =
      null;
  }

  reset() {
    this.redScore =
      0;

    this.blueScore =
      0;

    this.elapsedSeconds =
      0;

    this.lastPossession =
      null;

    this.renderScore();
    this.renderClock();

    this.setStatus(
      "比賽進行中"
    );

    this.setPossession(
      null
    );
  }

  addGoal(
    team
  ) {
    if (
      team === "red"
    ) {
      this.redScore +=
        1;
    } else {
      this.blueScore +=
        1;
    }

    this.renderScore();
  }

  updateClock(
    deltaTime
  ) {
    this.elapsedSeconds +=
      deltaTime;

    this.renderClock();
  }

  setStatus(
    text
  ) {
    if (
      !this.statusElement
    ) {
      return;
    }

    this.statusElement.textContent =
      text;
  }

  setPossession(
    team
  ) {
    if (
      team ===
      this.lastPossession
    ) {
      return;
    }

    this.lastPossession =
      team;

    if (
      !this.possessionElement
    ) {
      return;
    }

    this.possessionElement
      .classList
      .remove(
        "red",
        "blue"
      );

    if (
      team === "red"
    ) {
      this.possessionElement.textContent =
        "控球：赤櫻";

      this.possessionElement
        .classList
        .add(
          "red"
        );

      return;
    }

    if (
      team === "blue"
    ) {
      this.possessionElement.textContent =
        "控球：蒼月";

      this.possessionElement
        .classList
        .add(
          "blue"
        );

      return;
    }

    this.possessionElement.textContent =
      "自由球權";
  }

  renderScore() {
    if (
      this.redScoreElement
    ) {
      this.redScoreElement.textContent =
        String(
          this.redScore
        );
    }

    if (
      this.blueScoreElement
    ) {
      this.blueScoreElement.textContent =
        String(
          this.blueScore
        );
    }
  }

  renderClock() {
    if (
      !this.clockElement
    ) {
      return;
    }

    const minutes =
      Math.floor(
        this.elapsedSeconds /
        60
      );

    const seconds =
      Math.floor(
        this.elapsedSeconds %
        60
      );

    this.clockElement.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
}
