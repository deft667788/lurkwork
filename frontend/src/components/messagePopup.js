import { createElement } from "../utils.js";

export class MessagePopup {
  constructor(options) {
    this.options = options;
    this.popup = createElement("div", { class: "popup" });
    switch (this.options.type) {
      case "error":
        this.popup.style.border = "#FAB6B5";
        this.popup.style.backgroundColor = "#FEF1F0";
        this.popup.style.color = "#F56C6C";
        break;
      case "success":
        this.popup.style.border = "#B3E19D";
        this.popup.style.backgroundColor = "#F0F9EB";
        this.popup.style.color = "#68C23A";
        break;
      case "info":
        this.popup.style.border = "#A0CFFF";
        this.popup.style.backgroundColor = "#ECF5FF";
        this.popup.style.color = "#409EFF";
        break;
      case "warn":
        this.popup.style.border = "#F3D19E";
        this.popup.style.backgroundColor = "#FDF6EC";
        this.popup.style.color = "#E6A23C";
        break;
      default:
        break;
    }
    this.closeTime = 2000;
  }
  // create a popup
  popupCreate(msg) {
    const popupText = document.createTextNode(msg);
    this.popup.appendChild(popupText);
    this.popup.appendChild(this.createCloseButton());
    // add the DOM into page
    document.body.appendChild(this.popup);
    this.setTimeClosePopup();
  }
  setTimeClosePopup() {
    const timer = setTimeout(() => {
      this.PopupClose();
    }, this.closeTime);
    return timer;
  }
  // create a close button
  createCloseButton() {
    const closeButton = createElement(
      "button",
      {
        class: "popup-close-button",
      },
      "+"
    );
    closeButton.addEventListener(
      "click",
      (e) => {
        this.PopupClose();
      },
      { once: true }
    );
    return closeButton;
  }
  // close the popup
  PopupClose() {
    this.popup.style.display = "none";
    document.body.removeChild(this.popup);
  }
}
