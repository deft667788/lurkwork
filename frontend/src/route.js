import { Register } from "./pages/register.js";
import { AddFeed } from "./pages/addFeed.js";
import { Profile } from "./pages/profile.js";
import { UpdateProfile } from "./pages/updateProfile.js";
import { Login } from "./pages/login.js";
import { Home } from "./pages/home.js";
import { createElement } from "./utils.js";

const routes = {
  404: {
    title: "404",
    description: "Page not found",
    component: createElement("h1", { class: "not_found" }, "404"),
  },
  "#home": {
    title: "Home",
    description: "Home",
    component: Home,
  },
  "#login": {
    title: "Login",
    description: "Login",
    component: Login,
  },
  "#register": {
    title: "Register",
    description: "Register",
    component: Register,
  },
  "#addFeed": {
    title: "AddFeed",
    description: "AddFeed",
    component: AddFeed,
  },
  "#profile": {
    title: "Profile",
    description: "Profile",
    component: Profile,
  },
  "#updateProfile": {
    title: "Update Profile",
    description: " UpdateProfile",
    component: UpdateProfile,
  },
};

export const useGo = (path, params) => {
  const hashArr = path.split("=");
  const route = routes[hashArr[0]] || routes[404];
  // change url hash
  window.history.pushState(null, "", path);
  // set page  title
  document.title = route?.title;
  // set page  description
  document
    .querySelector("meta[name='description']")
    ?.setAttribute("content", route.description);

  renderPage(params);
};

// render page component
export const renderPage = (params) => {
  const hash = window.location.hash;
  const hashArr = hash.split("=");
  const route = routes[hashArr[0]] || routes[404];
  const container = document.querySelector(".container");
  // clear all elements in container or del container
  container?.parentNode?.removeChild(container);
  // create a container append into main
  const newContainer = createElement("div", { class: "container" });
  newContainer.appendChild(new route.component(params));
  // append new container into main
  document.querySelector("main")?.appendChild(newContainer);
};

window.onpopstate = renderPage;
