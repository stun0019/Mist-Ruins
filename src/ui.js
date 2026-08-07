export class MatchUI {
  constructor() {
    this.redScoreElement =
      document.querySelector("#red-score");

    this.blueScoreElement =
      document.querySelector("#blue-score");

    this.clockElement =
      document.querySelector("#match-clock");

    this.statusElement =
      document.querySelector("#match-status");

    this.redScore = 0;
    this.blueScore = 0;
    this.elapsedSeconds = 0;
  }

  reset() {
    this.redScore = 0;
    this.blueScore = 0;
    this.elapsedSeconds = 0;

    this.renderScore();
    this.renderClock();
    this.setStatus("比賽進行中");
  }

  addGoal(team) {
    if (team === "red") {
      this.redScore += 1;
    } else {
      this.blueScore += 1;
    }

    this.renderScore();
  }

  updateClock(deltaTime) {
    this.elapsedSeconds +=
      deltaTime;

    this.renderClock();
  }

  setStatus(text) {
    if (this.statusElement) {
      this.statusElement.textContent =
        text;
    }
  }

  renderScore() {
    if (this.redScoreElement) {
      this.redScoreElement.textContent =
        String(this.redScore);
    }

    if (this.blueScoreElement) {
      this.blueScoreElement.textContent =
        String(this.blueScore);
    }
  }

  renderClock() {
    if (!this.clockElement) {
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
