import { createElement, createTimeHandler, dateHandler } from "../utils.js";
import { useGo } from "../route.js";
import request from "../request.js";

// Create a user's personal dynamic card
export class ProfileFeedCard {
  constructor(options) {
    this.options = options;

    this.feedCard = createElement("div", { class: "feed_card" });
    this.isSelf = this.options.isSelf;

    this.createFeedCardItem();
    return this.feedCard;
  }
  // Create a card element that contains dynamic information
  createFeedCardItem() {
    this.feedCard = createElement("div", { class: "feed_card" });
    const avatarImg = createElement("img", {
      class: "card_avatar",
      src: this.options.image,
    });

    const textWrap = createElement("div", {
      class: "feed_text_wrap",
    });

    const cardTitle = createElement(
      "span",
      {
        class: "feed_title",
      },
      this.options.title
    );
    const cardDesc = createElement(
      "span",
      {
        class: "feed_desc",
      },
      this.options.description
    );
    const cardStartTime = createElement(
      "span",
      {
        class: "feed_startTime",
      },
      `start at：${dateHandler(this.options.start)}`
    );

    this.cardBottom = createElement("div", {
      class: "feed_bottom",
    });

    const cardCreateTime = createElement(
      "span",
      {
        class: "feed_createTime",
      },
      `create at: ${createTimeHandler(this.options.createdAt)}`
    );

    const cardTopWrap = createElement("div", { class: "feed_card_top_wrap" });
    cardTopWrap.appendChild(textWrap);
    if (this.isSelf) {
      const editIcon = createElement("img", {
        src: "../../assets/edit.svg",
        class: "edit_icon",
        alt: "edit icon",
      });
      const delIcon = createElement("img", {
        src: "../../assets/delete.svg",
        class: "delete_icon",
        alt: "delete icon",
      });
      editIcon.addEventListener("click", () => {
        useGo("#addFeed", Object.assign(this.options, { isUpdate: true }));
      });
      delIcon.addEventListener("click", () => {
        this.deleteFeed();
      });
      cardTopWrap.appendChild(editIcon);
      cardTopWrap.appendChild(delIcon);
    }
    textWrap.appendChild(cardTitle);
    textWrap.appendChild(cardDesc);

    textWrap.appendChild(cardStartTime);
    this.cardBottom.appendChild(cardCreateTime);

    textWrap.appendChild(this.cardBottom);
    this.feedCard.appendChild(avatarImg);
    this.feedCard.appendChild(cardTopWrap);
    return this.feedCard;
  }
  // to delete dynamics
  deleteFeed() {
    if (confirm("confirm to delete the feed?")) {
      request("/job", { id: this.options.id }, { method: "delete" })
        .then((res) => {
          this.feedCard.parentNode.removeChild(this.feedCard);
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  }
}