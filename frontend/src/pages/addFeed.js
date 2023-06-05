import { createElement, useLoading, useMessage } from "../utils.js";
import { useGo } from "../route.js";
import request from "../request.js";

// Create forms to add or update dynamics
export class AddFeed {
  constructor(options) {
    this.isUpdate = options?.isUpdate;
    this.rootElement = createElement("form", { id: "addFeed-form" });
    this.defaults = {
      formSelector: "#addFeed-form",
      submitButtonSelector: "#addFeed-submit",
      titleSelector: "#addFeed-title",
      startTimeSelector: "#addFeed-startTime",
      descriptionSelector: "#addFeed-description",
      onAddFeed: () => {
        useMessage(
          "success",
          `${this.isUpdate ? "Update" : "Add"} feed successfully!`
        );
        setTimeout(() => {
          history.go(-1);
        }, 500);
      },
      onError: () => {
        useMessage("error", "Failed to upload feed! ");
      },
    };
    this.options = Object.assign({}, this.defaults, options);
    this.createForm();

    this.bindEvents();
    this.imgFilesBase64 = "";
    this.previewImgFiles = "";
    return this.rootElement;
  }
  // Create the DOM structure for the form
  createForm() {
    const title = createElement(
      "h2",
      { style: "color:#0b66c2" },
      this.isUpdate ? "Update Feed" : "Add Feed"
    );

    const titleLabel = createElement("label", {}, "Title");

    const titleInput = createElement("input", {
      type: "text",
      id: "addFeed-title",
      required: "true",
      placeholder: "feed title",
    });
    if (this.options.title && this.isUpdate)
      titleInput.value = this.options.title;
    const startTimeLabel = createElement("label", {}, "StartTime:");

    const startTimeInput = createElement("input", {
      type: "datetime-local",
      id: "addFeed-startTime",
      required: "true",
    });
    if (this.options.start && this.isUpdate)
      startTimeInput.value = this.options.start;
    const descriptionLabel = createElement("label", {}, "Description:");

    const descriptionInput = createElement("input", {
      type: "text",
      id: "addFeed-description",
      required: "true",
      placeholder: "describe the feed",
    });
    if (this.options.description && this.isUpdate)
      descriptionInput.value = this.options.description;
    const imgLabel = createElement("label", {}, "Image:");
    const imgInputWrap = createElement("div", { class: "img_input_wrap" });

    const imgInput = createElement("input", {
      type: "file",
      accept: "image/png, image/jpeg, image/jpg",
      name: "file",
      id: "addFeed-imgFile",
      placeholder: "image",
    });
    if (!this.isUpdate) {
      imgInput.setAttribute("required", true);
    }
    if (this.options.image && this.isUpdate) {
      // const binaryImg = this.options.image.split(",")[1];
      // const blobImg = new Blob([binaryImg], { type: "image/png" });
      // const fileImg = new File([blobImg], "feed img", { type: "image/png" });
      // imgInput.value = "";
      this.imgFilesBase64 = this.options.image;
    }
    const imgPreview = createElement("img", {
      src: this.previewImgFiles || this.options.image,
      style: "width:60px;height:60px;",
      class: "preview_img",
    });
    if (this.previewImgFiles || this.options.image) {
      imgInputWrap.appendChild(imgPreview);
      imgInput.setAttribute("class", "has_preview_input");
    }

    imgInputWrap.appendChild(imgInput);
    imgInput.addEventListener("change", this.handleImageUpload.bind(this));
    const formFooter = createElement("div", {
      class: "form-footer",
      style: "display:flex;justifyContent:space-between;alignItems:center",
    });

    const submitButton = createElement(
      "button",
      {
        type: "submit",
        id: "addFeed-submit",
      },
      this.isUpdate ? "Update Feed" : "Add Feed"
    );

    formFooter.appendChild(submitButton);
    this.rootElement.appendChild(title);
    this.rootElement.appendChild(titleLabel);
    this.rootElement.appendChild(titleInput);
    this.rootElement.appendChild(startTimeLabel);
    this.rootElement.appendChild(startTimeInput);
    this.rootElement.appendChild(descriptionLabel);
    this.rootElement.appendChild(descriptionInput);
    this.rootElement.appendChild(imgLabel);
    this.rootElement.appendChild(imgInputWrap);
    this.rootElement.appendChild(formFooter);
  }
  // Read the image file as Base64-encoded data
  handleImageUpload(e) {
    const imgFile = e.target.files[0];
    if (imgFile) {
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        const fileRes = fileReader.result;
        this.imgFilesBase64 = fileRes;
        this.previewImgFiles = fileRes;
        document
          .querySelector(".preview_img")
          ?.setAttribute("src", this.previewImgFiles);
      });
      fileReader.readAsDataURL(imgFile);
    }
  }
  bindEvents() {
    // Bind the submit form event
    this.rootElement.addEventListener("submit", this.onSubmit.bind(this));
  }

  // Submit the form event handler
  onSubmit(event) {
    event.preventDefault(); // Prevents the form's default submission behavior

    const submitButton = document.querySelector(
      this.options.submitButtonSelector
    );

    const titleInput = document.querySelector(this.options.titleSelector);

    const startTimeInput = document.querySelector(
      this.options.startTimeSelector
    );
    const descriptionInput = document.querySelector(
      this.options.descriptionSelector
    );
    // Gets the value in the input field
    const title = titleInput.value;
    const startTime = startTimeInput.value;
    const description = descriptionInput.value;

    // Disable the submit button to avoid multiple submissions
    submitButton.disabled = true;

    let params = {
      title,
      description,
      image: this.imgFilesBase64,
      start: startTime,
    };
    if (this.isUpdate) {
      params = Object.assign(params, { id: this.options.id });
    }
    this.doAddFeed(params)
      .then((res) => {
        this.options.onAddFeed(res);
      })
      .catch((error) => {
        this.options.onError(error);
      })
      .finally(() => {
        submitButton.disabled = false; // Enable the Submit button
      });
  }

  // Send login request
  doAddFeed(params) {
    return new Promise((resolve, reject) => {
      request("/job", params, {
        method: this.isUpdate ? "put" : "post",
      })
        .then((res) => {
          console.log(res);
          resolve(res);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }
}
