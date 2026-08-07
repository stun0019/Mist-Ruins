import { Game } from "./game.js";

const container = document.querySelector("#game-container");

if (!container) {
  throw new Error("找不到 #game-container。");
}

const game = new Game(container);

game.start();
