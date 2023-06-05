import { MessagePopup } from "./components/messagePopup.js";
import { Loading } from "./components/loading.js";
import { useGo } from "./route.js";
import { getFeedList } from "./apis/feed.js";

export const useMessage = (type = "info", msg) => {
  const popup = new MessagePopup({ type: type });
  popup.popupCreate(msg);
};

export const useLoading = (duration) => {
  const loading = new Loading({ duration });
  loading.showLoading();
  return loading;
};

/*
  description: create a element
  how to use: createElement('div',{class:'xx'},'This is Allen')
*/
export const createElement = (tag, attributes = {}, text = "") => {
  const element = document.createElement(tag);
  for (let attr in attributes) {
    if (attributes.hasOwnProperty(attr)) {
      element.setAttribute(attr, attributes[attr]);
    }
  }
  if (text !== "") {
    element.textContent = text;
  }
  return element;
};

export const createTimeHandler = (time) => {
  const currentTime = new Date();
  let res = "";
  const timer = new Date(time);
  const timeDiff = currentTime.getTime() - timer.getTime();
  const msInDay = 1000 * 60 * 60 * 24;
  if (timeDiff <= msInDay) {
    res = `${timer.getHours()}:${
      timer.getMinutes() > 9 ? timer.getMinutes() : "0" + timer.getMinutes()
    }`;
  } else {
    res = `${timer.getFullYear()}/${timer.getMonth() + 1}/${timer.getDate()}`;
  }
  return res;
};

export const dateHandler = (time) => {
  const timer = new Date(time);
  return `${timer.getFullYear()}/${
    timer.getMonth() + 1
  }/${timer.getDate()} ${timer.getHours()}:${
    timer.getMinutes() > 9 ? timer.getMinutes() : "0" + timer.getMinutes()
  }`;
};

export const createEmpty = () => {
  const emptyWrap = createElement("div", { class: "empty_wrap" });
  const emptyIcon = createElement("img", {
    src: "../../assets/empty.svg",
    class: "empty_icon",
    alt: "empty",
  });
  const emptyButton = createElement(
    "button",
    {
      class: "empty_button",
    },
    "No feed? Go post one!"
  );
  emptyButton.addEventListener("click", () => {
    useGo("#addFeed");
  });

  emptyWrap.appendChild(emptyIcon);
  emptyWrap.appendChild(emptyButton);
  return emptyWrap;
};

const timeStampCompare = (oldTime, newTime) => {
  return new Date(newTime).valueOf() - new Date(oldTime).valueOf();
};

class pollingGetFeedList {
  constructor() {}
  getFeedListStorage() {
    const feedListStorageString = localStorage.getItem("feedList");
    this.feedListStorage = [];
    if (feedListStorageString) {
      this.feedListStorage = JSON.parse(feedListStorageString);
    }
    this.newFeedTimeList = this.feedListStorage.map((item) => item.createdAt); //
  }
  startPolling() {
    this.getFeedListStorage();
    this.pollingTimer = setInterval(() => {
      getFeedList(0, (res) => {
        if (
          this.newFeedTimeList &&
          timeStampCompare(this.newFeedTimeList[0], res[0]?.createdAt) > 0
        ) {
          useMessage("info", "Someone you watched has posted a new feed!");
          this.newFeedTimeList.unshift(res[0].createdAt);
        }
      });
    }, 1000);
  }
  stopPolling() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.newFeedTimeList = [];
  }
}
export const pollingInstance = new pollingGetFeedList();

// This is a throttling function called throttle.
export const throttle = (fn, delay) => {
  let timer = null;
  return () => {
    if (!timer) {
      timer = setTimeout(() => {
        fn();
        timer = null;
      }, delay);
    }
  };
};