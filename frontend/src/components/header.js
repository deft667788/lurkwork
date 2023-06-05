import {
  createElement,
  pollingInstance,
  useLoading,
  useMessage,
} from "../utils.js";
import { useGo } from "../route.js";

export class Header {
  constructor(options) {
    this.options = options;
    const header = document.querySelector("#header");
    let alreadyExistNav = document.querySelector("nav");
    if (alreadyExistNav) {
      alreadyExistNav.parentElement?.removeChild(alreadyExistNav);
    }
    this.menuList = [
      {
        title: "Add feed",
        href: "#addFeed",
        event: () => {
          useGo("#addFeed");
        },
      },
      {
        title: "Log out",
        href: "#login",
        event: () => {
          if (confirm("confirm to log out?")) {
            window.localStorage.removeItem("token");
            window.localStorage.removeItem("userId");
            window.localStorage.removeItem("userInfo");
            this.userInfo = null;
            this.removeProfileEntrance();
            pollingInstance.stopPolling();
            useGo("#login");
          }
        },
      },
    ];
    this.createProfileEntrance();
    this.nav = createElement("nav");
    this.navPlaceholder =
      document.querySelector(".nav_placeholder") ||
      createElement("div", { class: "nav_placeholder" });
    const logo = createElement("div", { class: "logo" });

    const logoLink = createElement("a", { href: "#home" }, "Lurkforwork");
    logo.appendChild(logoLink);
    this.nav.appendChild(logo);

    this.ul = createElement("ul", { class: "menu" });
    this.createMenu();

    this.nav.appendChild(this.ul);
    header?.appendChild(this.nav);
    header?.before(this.navPlaceholder);
    this.createBurger();
  }
  createProfileEntrance() {
    this.userInfo = window.localStorage.getItem("userInfo");
    if (this.userInfo) {
      this.menuList.push({
        title: `${JSON.parse(this.userInfo)?.name}`,
        href: "#profiles",
        event: () => {
          if (location.hash !== "#profile") {
            useGo("#profile");
          }
        },
      });
    }
  }
  removeProfileEntrance() {
    const menuChildrenLen = this.ul.children.length;
    this.ul.removeChild(this.ul.children[menuChildrenLen - 1]);
  }
  createMenu() {
    this.menuList.forEach((menuItem) => {
      const li = createElement("li");
      const liA = createElement("a", { href: menuItem.href }, menuItem.title);
      liA.addEventListener("click", (e) => {
        e.preventDefault();
        menuItem.event();
      });
      li.appendChild(liA);
      this.ul.appendChild(li);
    });
  }
  toggleMenu() {
    this.burger.classList.toggle("active");
    this.ul.classList.toggle("active");
  }

  createBurger() {
    const burger = createElement("div", { class: "burger" });
    for (let i = 0; i < 5; i++) {
      // Update this line to create 3 lines instead of 4
      const line = createElement("div", { class: "line" });
      burger.appendChild(line);
    }
    burger.addEventListener("click", this.toggleMenu.bind(this));
    this.nav.appendChild(burger);
    this.burger = burger; // Add this line to store the burger element
  }
}