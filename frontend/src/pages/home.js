import {
  createElement,
  createEmpty,
  pollingInstance,
  throttle,
  useLoading,
  useMessage,
} from "../utils.js";
import request from "../request.js";
import { FeedCard } from "../components/feedCard.js";
import { getFeedList } from "../apis/feed.js";

export class Home {
  constructor(options) {
    this.options = options;
    this.pageNum = 0;
    this.pageSize = 5;
    this.isLastPage = false;
    this.currentScrollTop = 0;
    this.touchBottom = false;
    this.listWrap = createElement("div", { class: "list_wrap" });
    this.rootElement = createElement("div", { id: "home" });
    this.feedListStorage = localStorage.getItem("feedList");
    this.feedsList = [];
    if (!navigator.onLine && this.feedListStorage) {
      this.feedsList = JSON.parse(this.feedListStorage);
    }
    // const getFeedListTimer = setInterval(() => {
    getFeedList(this.pageNum, (res) => {
      this.feedsList = res;
      if (res.length < 5) {
        this.isLastPage = true;
      }
      this.setFeedList();
      pollingInstance.stopPolling();
      pollingInstance.startPolling();

      this.createListWrap(this.feedsList);
    });
    // }, 1000);

    window.addEventListener(
      "scroll",
      throttle(this.handleScroll.bind(this), 100),
      true
    );
    return this.rootElement;
  }
  setFeedList() {
    try {
      localStorage.setItem("feedList", JSON.stringify(this.feedsList));
    } catch (error) {
      console.log(error);
    }
  }
  handleScroll() {
    const st = document.querySelector("html")?.scrollTop;
    const sh = document.querySelector("html")?.scrollHeight;
    const ch = document.querySelector("html")?.clientHeight;
    if (st && sh && ch) {
      if (st > this.currentScrollTop) {
        //Determine whether to scroll down
        this.currentScrollTop = st;
        if (st >= sh - ch && !this.isLastPage) {
          getFeedList(
            (this.pageNum + 1) * this.pageSize,
            (res) => {
              if (!!res.length) {
                this.feedsList = [...this.feedsList, ...res];
                this.createListWrap(res);
                this.isLastPage = true;
              }
              if (res.length < 5) {
                // whether is last page
                this.isLastPage = true;
              } else {
                this.pageNum++;
              }
            },
            false
          );
        }
      }
    }
  }
  createListWrap(list) {
    if (!!list.length) {
      this.createFeedCardItem(list);
    } else {
      this.rootElement.appendChild(createEmpty());
    }
  }

  createFeedCardItem(list) {
    list.forEach((ele) => {
      const feedCard = new FeedCard(
        Object.assign(ele, { pageNum: this.pageNum, pageSize: this.pageSize })
      );
      this.listWrap?.appendChild(feedCard);
    });
    this.rootElement.appendChild(this.listWrap);
  }
}
