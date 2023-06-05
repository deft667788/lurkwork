import { createElement, useMessage } from "../utils.js";
import request from "../request.js";

import { Login } from "./login.js";
import { useGo } from "../route.js";

export class Register {
  constructor(options) {
    this.options = Object.assign({}, this.defaults, options);
    this.rootElement = createElement("form", { id: "register-form" });
    this.createForm();
    // Bind event listeners
    this.bindEvents();
    return this.rootElement;
  }

  // Setting default parameters
  defaults = {
    formSelector: "#register-form",
    submitButtonSelector: "#register-submit",
    emailSelector: "#register-email",
    passwordSelector: "#register-password",
    confirmPasswordSelector: "#register-confirmPassword",
    nameSelector: "#register-name", // selector of register-name
  };
  createForm() {
    const title = createElement("h2", { style: "color:#0b66c2" }, "Register");
    // create email input
    const emailLabel = createElement("label", {}, "Email:");

    const emailInput = createElement("input", {
      type: "email",
      id: "register-email",
      required: true,
    });

    const nameLabel = createElement("label", {}, "UserName:");

    const nameInput = createElement("input", {
      type: "text",
      id: "register-name",
      required: true,
    });

    const passwordLabel = createElement("label", {}, "Password:");
    const passwordInput = createElement("input", {
      type: "password",
      id: "register-password",
      required: true,
    });

    const confirmPasswordLabel = createElement("label", {}, "ConfirmPassword:");
    const confirmPasswordInput = createElement("input", {
      type: "password",
      id: "register-confirmPassword",
      required: true,
    });

    const formFooter = createElement("div", {
      class: "form-footer",
      style: "display:flex;justify-content:space-between;align-item:center",
    });
    const submitButton = createElement(
      "button",
      {
        type: "submit",
        id: "register-submit",
      },
      "Register"
    );
    const gotoRegisterLink = createElement(
      "a",
      {
        href: "#login",
        style: "color:#0b66c2;text-decoration:none",
      },
      "Back"
    );
    gotoRegisterLink.addEventListener("click", (e) => {
      useGo(e.target?.hash);
    });
    formFooter.appendChild(submitButton);
    formFooter.appendChild(gotoRegisterLink);
    this.rootElement.appendChild(title);
    this.rootElement.appendChild(emailLabel);
    this.rootElement.appendChild(emailInput);
    this.rootElement.appendChild(nameLabel);
    this.rootElement.appendChild(nameInput);
    this.rootElement.appendChild(passwordLabel);
    this.rootElement.appendChild(passwordInput);
    this.rootElement.appendChild(confirmPasswordLabel);
    this.rootElement.appendChild(confirmPasswordInput);
    this.rootElement.appendChild(formFooter);
  }
  bindEvents() {
    // Bind the submit form event
    this.rootElement.addEventListener("submit", this.onSubmit.bind(this));
  }

  // Submit the form event handler
  onSubmit(event) {
    event.preventDefault(); // Prevents the form's default submission behavior

    // Gets the input and button elements
    const emailInput = document.querySelector(this.options.emailSelector);
    const passwordInput = document.querySelector(this.options.passwordSelector);
    const confirmPasswordInput = document.querySelector(
      this.options.confirmPasswordSelector
    );
    const nameInput = document.querySelector(this.options.nameSelector);
    const submitButton = document.querySelector(
      this.options.submitButtonSelector
    );

    // Gets the value in the input field
    const email = emailInput.value;
    const password = passwordInput.value;
    const name = nameInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Disable the submit button to avoid multiple submissions
    submitButton.disabled = true;
    if (confirmPassword !== password) {
      useMessage("error", "The two password entries are inconsistent");
      submitButton.disabled = false;
      return;
    }
    // Send login request
    this.doRegister(email, password, name)
      .then((res) => {
        console.log("res", res);
        useMessage("success", "Register successfully!");
        setTimeout(() => {
          
          useGo("#login");
        }, 500);
      })
      .catch((error) => {
        useMessage("error", error);
      })
      .finally(() => {
        submitButton.disabled = false; // Enable the Submit button
      });
  }

  doRegister(email, password, name) {
    return new Promise((resolve, reject) => {
      request(
        "/auth/register",
        { email, password, name },
        {
          method: "post",
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
