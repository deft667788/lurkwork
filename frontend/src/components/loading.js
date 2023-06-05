import { createElement } from "../utils.js";

export class Loading {
  constructor(options) {
    this.options = options;
    this.deg = 0;
    this.rotateDeg = 5;
    this.duration = 500;
  }
  rotateLoading() {
    this.loading.style.transform = `rotate(${this.deg}this.deg)`;
    this.updateAnimation = () => {
      this.loading.style.transform = `rotate(${(this.deg +=
        this.rotateDeg)}deg)`;
      window.requestAnimationFrame(this.updateAnimation);
    };
    window.requestAnimationFrame(this.updateAnimation);
  }
  stopRotate() {
    window.cancelAnimationFrame(this.updateAnimation);
  }
  showLoading() {
    this.loading =
      document.querySelector("#loading") ||
      createElement("div", { id: "loading" });
    this.loadingMask = document.querySelector("#loading_mask");
    this.loading.style.display = "block";
    this.loadingMask?.appendChild(this.loading);
    this.loadingMask =
      document.querySelector("#loading_mask") ||
      createElement("div", { id: "loading_mask" });
    this.loadingMask.style.display = "block";
    this.rotateLoading();
    if (this.options.duration) {
      setTimeout(
        () => {
          this.hideLoading();
        },
        this.options.duration < 500 ? this.duration : this.options.duration
      );
    }
  }
  hideLoading() {
    this.stopRotate();
    this.loadingMask.removeChild(this.loading);
    this.loadingMask.style.display = "none";
  }
}
