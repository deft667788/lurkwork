import { createElement, useLoading, useMessage } from "../utils.js";
import { useGo } from "../route.js";
import { Register } from "./register.js";
import request from "../request.js";
import { getUserInfo } from "../apis/user.js";
import { Header } from "../components/header.js";

// Create the Login component constructor
export class Login {
  constructor(options) {
    // Merge the passed arguments into the default arguments
    this.options = Object.assign({}, this.defaults, options);
    // Create the login form element
    this.rootElement = createElement("form", { id: "login-form" });
    this.createForm();

    // Bind event listeners
    this.bindEvents(); // Setting default parameters
    return this.rootElement;
  }
  defaults = {
    formSelector: "#login-form", // Selectors for the login form
    submitButtonSelector: "#login-submit", // Selector for the submit button
    emailSelector: "#login-email", // Selector for the username input field
    passwordSelector: "#login-password", // A selector for the password field
  };
  createForm() {
    const title = createElement("h2", { style: "color:#0b66c2" }, "Login");

    const emailLabel = createElement("label", {}, "Email:");

    const emailInput = createElement("input", {
      type: "email",
      id: "login-email",
      required: "required",
    });

    const passwordLabel = createElement("label", {}, "Password:");

    const passwordInput = createElement("input", {
      type: "password",
      id: "login-password",
      required: "required",
    });

    const formFooter = createElement("div", {
      class: "form-footer",
      style: "display:flex;justify-content:space-between;align-items:center",
    });

    const submitButton = createElement(
      "button",
      {
        type: "submit",
        id: "login-submit",
      },
      "Login"
    );
    const gotoRegisterLink = createElement(
      "a",
      {
        href: "#register",
        style: "color:#0b66c2;text-decoration:none",
      },
      "Create a account"
    );

    gotoRegisterLink.addEventListener("click", (e) => {
      // e.target?.hash ===> #register
      useGo(e.target?.hash);
    });
    formFooter.appendChild(submitButton);
    formFooter.appendChild(gotoRegisterLink);
    this.rootElement.appendChild(title);
    this.rootElement.appendChild(emailLabel);
    this.rootElement.appendChild(emailInput);
    this.rootElement.appendChild(passwordLabel);
    this.rootElement.appendChild(passwordInput);
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
    const submitButton = document.querySelector(
      this.options.submitButtonSelector
    );

    // Gets the value in the input field
    const email = emailInput.value;
    const password = passwordInput.value;

    // Disable the submit button to avoid multiple submissions
    submitButton.disabled = true;

    // Send login request
    this.doLogin(email, password)
      .then((res) => {
        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.userId);
        useMessage("success", "Login successfully~");
        getUserInfo(res.userId);
        setTimeout(() => {
          useGo("#home");
          new Header();
        }, 1000);
      })
      .catch((error) => {
        useMessage("error", `Login failed !${error}`);
      })
      .finally(() => {
        submitButton.disabled = false; // Enable the Submit button
      });
  }

  doLogin(email, password) {
    return new Promise((resolve, reject) => {
      request(
        "/auth/login",
        { email, password },
        {
          method: "post",
        }
      )
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
