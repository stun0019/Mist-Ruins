export class InputController {
  constructor() {
    this.keys = new Set();

    this.handleKeyDown =
      this.handleKeyDown.bind(this);

    this.handleKeyUp =
      this.handleKeyUp.bind(this);

    this.handleBlur =
      this.handleBlur.bind(this);

    window.addEventListener(
      "keydown",
      this.handleKeyDown
    );

    window.addEventListener(
      "keyup",
      this.handleKeyUp
    );

    window.addEventListener(
      "blur",
      this.handleBlur
    );
  }

  handleKeyDown(event) {
    this.keys.add(event.code);
  }

  handleKeyUp(event) {
    this.keys.delete(event.code);
  }

  handleBlur() {
    this.keys.clear();
  }

  isPressed(code) {
    return this.keys.has(code);
  }

  destroy() {
    window.removeEventListener(
      "keydown",
      this.handleKeyDown
    );

    window.removeEventListener(
      "keyup",
      this.handleKeyUp
    );

    window.removeEventListener(
      "blur",
      this.handleBlur
    );

    this.keys.clear();
  }
}
