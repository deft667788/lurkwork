import {
  createElement,
  createEmpty,
  createTimeHandler,
  dateHandler,
} from "../utils.js";
import { useGo } from "../route.js";
import request from "../request.js";
import { Modal } from "../components/modal.js";
import { ProfileFeedCard } from "../components/profileFeedCard.js";

export class Profile {
  constructor() {
    const hash = window.location.hash;
    this.storageUserId = localStorage.getItem("userId");
    if (hash.includes("=")) {
      const hashArr = hash.split("=");
      this.userId = hashArr[hashArr.length - 1];
      if (this.storageUserId === this.userId) {
        // Determine if I'am entering my profile
        this.isSelf = true;
      } else {
        this.isSelf = false;
      }
    } else {
      this.userId = this.storageUserId;
      this.isSelf = true;
    }
    this.userData = null;

    this.rootElement = createElement("div", {
      class: "profiles_container",
    });
    this.loadProfilesData();
    //Whether I'm paying attention to this person
    this.isWatching = false;
    return this.rootElement;
  }

  loadProfilesData() {
    request(`/user?userId=${this.userId}`, {}, { method: "GET" })
      .then((userData) => {
        if (userData?.watcheeUserIds.includes(Number(this.storageUserId))) {
          this.isWatching = true;
        }
        this.userData = userData;
        const profilesHeader = this.createProfilesHeader(userData);
        this.rootElement.appendChild(profilesHeader);
        if (userData.jobs.length) {
          const jobList = this.createJobList(userData.jobs);
          this.rootElement.appendChild(jobList);
        } else {
          this.rootElement.appendChild(createEmpty());
        }
      })
      .catch((error) => {
        console.error("Error fetching profile data:", error);
      });
  }

  createProfilesHeader(userData) {
    const profilesHeader = createElement("div", { class: "profiles_header" });
    const headerLeft = createElement("div", { class: "header_left" });
    if (userData.image) {
      const avatar = createElement("img", {
        src: userData.image,
        alt: "avatar",
        class: "user_avatar",
      });
      headerLeft.appendChild(avatar);
    }
    const nameWrap = createElement("div", { class: "name_wrap" });
    const name = createElement("h2", { class: "profiles_name" }, userData.name);

    const email = createElement(
      "span",
      { class: "profiles_email" },
      userData.email
    );
    nameWrap.appendChild(name);
    nameWrap.appendChild(email);
    headerLeft.appendChild(nameWrap);
    const headerRight = createElement("div", { class: "watcher_right" });

    const watcher = createElement("div", { class: "watcher" });
    this.watcherCount = createElement(
      "span",
      { class: "watcher_count" },
      `Watchers:${userData.watcheeUserIds.length}`
    );

    watcher.appendChild(this.watcherCount);
    if (!this.isSelf) {
      const watcherBtn = this.createWatchedBtn();
      watcher.appendChild(watcherBtn);
    }

    headerRight.appendChild(watcher);
    if (this.isSelf) {
      const updateIcon = createElement("img", {
        src: "../../assets/update.svg",
        class: "updateProfile_icon",
      });
      updateIcon.addEventListener("click", () => {
        useGo("#updateProfile");
      });
      headerRight.appendChild(updateIcon);
    }
    this.watcherCount.addEventListener("click", () => {
      const watchersList = createElement("div", {
        class: "watcher_List",
      });
      userData.watcheeUserIds.map((item) => {
        request("/user", { userId: item }, { method: "get" })
          .then((res) => {
            const watcherName = createElement(
              "span",
              { class: "watcher_name" },
              `${res.name}`
            );
            const watcherEmail = createElement(
              "span",
              { class: "watcher_email" },
              ` ${res.email} `
            );
            watcherName.addEventListener("click", () => {
              useGo(`#profile=${res.id}`);
              this.watchersModal?.close();
            });
            watcherName.appendChild(watcherEmail);
            watchersList.appendChild(watcherName);
          })
          .catch((error) => {
            console.log(error);
          });
      });
      this.watchersModal = new Modal(watchersList);
      this.watchersModal.open();
    });
    profilesHeader.appendChild(headerLeft);
    profilesHeader.appendChild(headerRight);

    return profilesHeader;
  }

  createJobList(jobs) {
    const jobList = createElement("div", { class: "job_list" });
    if (!!jobs.length) {
      jobs.forEach((job) => {
        jobList.appendChild(
          new ProfileFeedCard({ ...job, isSelf: this.isSelf })
        );
      });
    } else {
      jobList.appendChild(createEmpty());
    }

    return jobList;
  }
  createWatchedBtn() {
    // console.log(this.isWatching);

    const watchButton = createElement("img", {
      src: this.isWatching
        ? "../../assets/watching.svg"
        : "../../assets/watch.svg",
      class: "watch_button_icon",
    });
    watchButton.addEventListener("click", () => {
      this.sendWatching();
    });

    return watchButton;
  }
  sendWatching() {
    request(
      "/user/watch",
      { email: this.userData.email, turnon: this.isWatching ? false : true },
      { method: "put" }
    )
      .then((res) => {
        if (this.isWatching) {
          document
            .querySelector(".watch_button_icon")
            ?.setAttribute("src", "../../assets/watch.svg");
          this.isWatching = !this.isWatching;
          let currentCount = Number(
            this.watcherCount.textContent.split(":")[1]
          );
          this.watcherCount.textContent = `Watchers:${--currentCount}`;
        } else {
          document
            .querySelector(".watch_button_icon")
            ?.setAttribute("src", "../../assets/watching.svg");
          this.isWatching = !this.isWatching;
          let currentCount = Number(
            this.watcherCount.textContent.split(":")[1]
          );
          this.watcherCount.textContent = `Watchers:${++currentCount}`;
        }
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
  getContainer() {
    return this.rootElement;
  }
}