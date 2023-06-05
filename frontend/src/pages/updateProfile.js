import { getUserInfo } from "../apis/user.js";
import { Header } from "../components/header.js";
import request from "../request.js";
import { useGo } from "../route.js";
import { createElement, useMessage } from "../utils.js";

export class UpdateProfile {
  constructor(options) {
    this.options = Object.assign({}, this.defaults, options);
    this.rootElement = createElement("form", { id: "updateProfile-form" });

    this.bindEvents();
    this.imgFilesBase64 = "";
    let storageUserInfoString = localStorage.getItem("userInfo");
    this.storageUserInfo = {};
    if (storageUserInfoString) {
      this.storageUserInfo = JSON.parse(storageUserInfoString);
    }

    this.createForm();
    return this.rootElement;
  }

  // Setting default parameters
  defaults = {
    formSelector: "#updateProfile-form",
    submitButtonSelector: "#updateProfile-submit",
    emailSelector: "#updateProfile-email",
    passwordSelector: "#updateProfile-password",
    confirmPasswordSelector: "#updateProfile-confirmPassword",
    nameSelector: "#updateProfile-name", // selector of updateProfile-name
    onError: function () {}, // callback after updateProfile failed
  };
  createForm() {
    const title = createElement(
      "h2",
      { style: "color:#0b66c2" },
      "Update Profile"
    );
    // create email input
    const emailLabel = createElement("label", {}, "Email:");

    const emailInput = createElement("input", {
      type: "email",
      id: "updateProfile-email",
    });

    if (this.storageUserInfo.email) {
      emailInput.value = this.storageUserInfo.email;
    }

    const nameLabel = createElement("label", {}, "UserName:");

    const nameInput = createElement("input", {
      type: "text",
      id: "updateProfile-name",
    });

    if (this.storageUserInfo.name) {
      nameInput.value = this.storageUserInfo.name;
    }

    const passwordLabel = createElement("label", {}, "Password:");
    const passwordInput = createElement("input", {
      type: "password",
      id: "updateProfile-password",
    });

    const confirmPasswordLabel = createElement("label", {}, "ConfirmPassword:");
    const confirmPasswordInput = createElement("input", {
      type: "password",
      id: "updateProfile-confirmPassword",
    });

    const imgLabel = createElement("label", {}, "Image:");
    const imgInputWrap = createElement("div", { class: "img_input_wrap" });

    const imgInput = createElement("input", {
      type: "file",
      accept: "image/png, image/jpeg, image/jpg",
      name: "file",
      id: "updateProfile-imgFile",
      placeholder: "image",
    });

    imgInput.addEventListener("change", this.handleImageUpload.bind(this));

    imgInputWrap.appendChild(imgInput);

    const formFooter = createElement("div", {
      class: "form-footer",
      style: "display:flex;justify-content:space-between;align-item:center",
    });
    const submitButton = createElement(
      "button",
      {
        type: "submit",
        id: "updateProfile-submit",
      },
      "confirm Update"
    );
    formFooter.appendChild(submitButton);
    this.rootElement.appendChild(title);
    this.rootElement.appendChild(emailLabel);
    this.rootElement.appendChild(emailInput);
    this.rootElement.appendChild(nameLabel);
    this.rootElement.appendChild(nameInput);
    this.rootElement.appendChild(passwordLabel);
    this.rootElement.appendChild(passwordInput);
    this.rootElement.appendChild(confirmPasswordLabel);
    this.rootElement.appendChild(confirmPasswordInput);
    this.rootElement.appendChild(imgLabel);
    this.rootElement.appendChild(imgInput);
    this.rootElement.appendChild(formFooter);
  }

  handleImageUpload(e) {
    const imgFile = e.target.files[0];
    if (imgFile) {
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        const fileRes = fileReader.result;
        this.imgFilesBase64 = fileRes;
      });
      fileReader.readAsDataURL(imgFile);
    }
  }
  bindEvents() {

    this.rootElement.addEventListener("submit", this.onSubmit.bind(this));
  }


  onSubmit(event) {
    event.preventDefault(); 


    const emailInput = document.querySelector(this.options.emailSelector);
    const passwordInput = document.querySelector(this.options.passwordSelector);
    const confirmPasswordInput = document.querySelector(
      this.options.confirmPasswordSelector
    );
    const nameInput = document.querySelector(this.options.nameSelector);
    const submitButton = document.querySelector(
      this.options.submitButtonSelector
    );


    let email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const name = nameInput.value;

    if (password !== confirmPassword) {
      useMessage("error", "Two password different!");
      return;
    }
    if (email === this.storageUserInfo.email) {
      email = null;
    }

    submitButton.disabled = true;

    this.doRegister(email, password, name, this.imgFilesBase64)
      .then((res) => {
        useMessage("success", "update successfully!");
        const myUserId = localStorage.getItem("userId");
        getUserInfo(myUserId);
        new Header();
        setTimeout(() => {
          useGo("#profile");
        }, 500);
      })
      .catch((error) => {
        this.options.onError(error);
      })
      .finally(() => {
        submitButton.disabled = false; 
      });
  }

  doRegister(email, password, name, image) {
    return new Promise((resolve, reject) => {
      request(
        "/user",
        { email, password, name, image },
        {
          method: "put",
        }
      )
        .then((res) => {
          console.log(res);
          resolve(res);
        })
        .catch((error) => {
          useMessage("error", error);
        });
    });
  }
}