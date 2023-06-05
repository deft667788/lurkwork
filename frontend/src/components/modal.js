import { createElement } from "../utils.js";
// Create and manage a generic modal window
export class Modal {
  constructor(innerContent) {
    this.innerContent = innerContent;
    const main = document.querySelector("main");
    this.modal =
      document.querySelector("#modal") || createElement("div", { id: "modal" });
    this.modalContent =
      this.modal.querySelector(".modal_content") ||
      createElement("div", { class: "modal_content" });
    this.closeButton =
      this.modal.querySelector(".close") ||
      createElement("span", { class: "close" }, "×");

    // have to clear modal content when every time open
    this.closeButton.parentNode?.removeChild(this.closeButton.nextSibling);
    this.modal.appendChild(this.modalContent);
    this.modalContent?.appendChild(this.closeButton);

    this.modalContent?.appendChild(this.innerContent);
    main?.appendChild(this.modal);
    this.closeButton.addEventListener("click", this.close.bind(this));
    window.addEventListener("click", this.outsideClick.bind(this));
  }
  // Open a modal window by setting its display property to "block"
  open() {
    this.modal.style.display = "block";
  }
  // Close a modal window by setting its display property to "none"
  close() {
    this.modal.style.display = "none";
  }
  // Handle the event that the outside region of the modal window is clicked
  outsideClick(event) {
    if (event.target === this.modal) {
      this.modal.style.display = "none";
    }
  }
}
