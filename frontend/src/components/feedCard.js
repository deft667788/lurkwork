import {
  useMessage,
  createElement,
  createTimeHandler,
  dateHandler,
} from "../utils.js";
import { useGo } from "../route.js";
import { Modal } from "./modal.js";
import request from "../request.js";
import { getFeedList } from "../apis/feed.js";

// Create the Home component constructor
export class FeedCard {
  constructor(options) {
    this.options = options;
    this.myUserId = window.localStorage.getItem("userId");
    const myUserInfoString = localStorage.getItem("userInfo");
    if (myUserInfoString) this.myUserInfo = JSON.parse(myUserInfoString);

    this.feedCard = createElement("div", { class: "feed_card" });
    this.isSelf = false;

    this.createFeedCardItem();
    return this.feedCard;
  }
  getUserInfo() {
    return new Promise((resolve, reject) => {
      request(
        `/user?userId=${this.options.creatorId}`,
        {},
        { hideLoading: true }
      ).then((res) => {
        this.isSelf = Number(res.id) === Number(this.myUserId);
        const nameAndEmail = createElement(
          "span",
          { class: "feed_card_creator" },
          res.name + "@" + res.email
        );
        const creatorInfo = createElement(
          "div",
          {
            class: "creator_info",
          },
          `Create By:`
        );
        nameAndEmail.addEventListener("click", () => {
          console.log(res);
          useGo(`#profile=${res.id}`);
        });
        creatorInfo.appendChild(nameAndEmail);
        resolve(creatorInfo);
      });
    });
  }
  createFeedCardItem() {
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
    const cardCLikeWrap = createElement("div", {
      class: "like_wrap",
    });
    const likeUserIdList = this.options.likes.map((item) => item.userId);
    const cardCLikeIcon = createElement("img", {
      src: likeUserIdList.includes(Number(this.myUserId))
        ? "../../assets/liked.svg"
        : "../../assets/like.svg",
      class: "likes_icon",
      alt: "like icon",
    });

    this.cardCLikeCount = createElement(
      "span",
      {
        class: "feed_likeCount",
      },
      `${this.options.likes.length} likes`
    );
    cardCLikeWrap.appendChild(cardCLikeIcon);

    cardCLikeWrap.appendChild(this.cardCLikeCount);
    const cardCommentsWrap = createElement("div", {
      class: "comments_wrap",
    });
    const cardCommentsIcon = createElement("img", {
      src: "../../assets/comments.svg",
      class: "comments_icon",
      alt: "comments icon",
    });
    this.cardCommentsCount = createElement(
      "span",
      {
        class: "feed_commentsCount",
      },
      `${this.options.comments.length} comments`
    );
    cardCLikeIcon.addEventListener("click", (e) => {
      if (!!e.target.src.match("liked")) {
        cardCLikeIcon.setAttribute("src", "../../assets/like.svg");
        // cancel like this feed
        this.handelLike(false, cardCLikeIcon);
      } else {
        // like this feed
        this.handelLike(true, cardCLikeIcon);
      }
    });
    cardCommentsWrap.appendChild(cardCommentsIcon);
    cardCommentsWrap.appendChild(this.cardCommentsCount);
    textWrap.appendChild(cardTitle);
    textWrap.appendChild(cardDesc);

    textWrap.appendChild(cardStartTime);
    this.cardBottom.appendChild(cardCLikeWrap);
    this.cardBottom.appendChild(cardCommentsWrap);
    this.cardBottom.appendChild(cardCreateTime);

    textWrap.appendChild(this.cardBottom);
    this.feedCard.appendChild(avatarImg);
    const cardTopWrap = createElement("div", { class: "feed_card_top_wrap" });
    cardTopWrap.appendChild(textWrap);
    this.getUserInfo().then((res) => {
      cardDesc.after(res);
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
    });
    this.feedCard.appendChild(cardTopWrap);

    this.cardCLikeCount.addEventListener("click", () => {
      const likesList = createElement("div", {
        class: "like_card_List",
      });

      this.options.likes.map((item) => {
        likesList.appendChild(this.createLikeCard(item));
      });
      this.likesModal = new Modal(likesList);
      this.likesModal.open();
    });
    cardCommentsIcon.addEventListener(
      "click",
      this.createCommentsList.bind(this)
    );
    this.cardCommentsCount.addEventListener(
      "click",
      this.createCommentsList.bind(this)
    );
  }
  createCommentsList() {
    this.commentsList = createElement("div", {
      class: "comment_card_List",
    });
    const sendCommentWrap = createElement("div", {
      class: "send_comment_wrap",
    });
    const commentInput = createElement("input", {
      class: "comment_input",
      placeholder: "send a comment",
    });
    const sendCommentBtn = createElement(
      "button",
      {
        class: "comment_button",
      },
      "Send"
    );
    sendCommentBtn.addEventListener("click", () => {
      this.sendComment(commentInput.value);
    });
    sendCommentWrap.appendChild(commentInput);
    sendCommentWrap.appendChild(sendCommentBtn);
    this.options.comments.map((item) => {
      this.commentsList.appendChild(this.createCommentCard(item));
    });
    const innerModal = createElement("div", {});
    innerModal.appendChild(this.commentsList);
    innerModal.appendChild(sendCommentWrap);
    this.commentsModal = new Modal(innerModal);
    this.commentsModal.open();
  }
  sendComment(comment) {
    request(
      "/job/comment",
      { id: this.options.id, comment: comment },
      { method: "post" }
    )
      .then((res) => {
        // update commentsList
        this.commentsList?.appendChild(
          this.createCommentCard({
            comment,
            userEmail: this.myUserInfo.email,
            userId: this.myUserInfo.id,
            userName: this.myUserInfo.name,
          })
        );
        // update comments count
        this.cardCommentsCount.textContent = `${this.commentsList.children.length} comments`;
        // clear input value
        let commentInput = document.querySelector(".comment_input");
        if (commentInput) {
          commentInput.value = "";
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  }
  deleteFeed() {
    if (confirm("confirm to delete the feed?")) {
      request("/job", { id: this.options.id }, { method: "delete" })
        .then((res) => {
          // console.log("feedCard", this.feedCard);
          this.feedCard.parentNode.removeChild(this.feedCard);
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  }
  handelLike(turnon, cardCLikeIcon) {
    request("/job/like", { id: this.options.id, turnon }, { method: "put" })
      .then((res) => {
        cardCLikeIcon.setAttribute(
          "src",
          turnon ? "../../assets/liked.svg" : "../../assets/like.svg"
        );
        if (turnon) {
          this.options.likes.push({
            userEmail: this.myUserInfo?.email,
            userId: this.myUserId,
            userName: this.myUserInfo?.name,
          });
        } else {
          this.options.likes = this.options.likes.filter((item) => {
            item.userId !== this.myUserId;
          });
        }
        this.cardCLikeCount.textContent = `${this.options.likes.length} likes`;
      })
      .catch((error) => {
        console.log("error", error);
      });
  }
  // handle to create a comment card
  createCommentCard(commentItem) {
    const commentCard = createElement("div", {
      class: "comment_card",
    });

    const commentUserInfoWrap = createElement("div", {
      class: "comment_user_info_wrap",
    });
    const commentUserName = createElement(
      "div",
      {
        class: "comment_userName",
      },
      commentItem.userName
    );
    const commentEmail = createElement(
      "div",
      {
        class: "comment_Email",
      },
      commentItem.userEmail
    );
    commentUserName.addEventListener("click", () => {
      this.commentsModal?.close();
      setTimeout(() => {
        useGo(`#profile=${commentItem.userId}`);
      }, 300);
    });
    commentUserInfoWrap.appendChild(commentUserName);
    commentUserInfoWrap.appendChild(commentEmail);
    const commentContent = createElement(
      "div",
      {
        class: "comment_Content",
      },
      commentItem.comment
    );
    commentCard.appendChild(commentUserInfoWrap);
    commentCard.appendChild(commentContent);
    return commentCard;
  }
  // handle to create a like card
  createLikeCard(likeItem) {
    const likeCard = createElement("div", {
      class: "like_card",
    });
    const likeUserInfoWrap = createElement("div", {
      class: "like_user_info_wrap",
    });
    const likeUserName = createElement(
      "div",
      {
        class: "like_userName",
      },
      likeItem.userName
    );
    const likeEmail = createElement(
      "div",
      {
        class: "like_Email",
      },
      likeItem.userEmail
    );
    likeUserName.addEventListener("click", () => {
      this.likesModal?.close();
      setTimeout(() => {
        useGo(`#profile=${likeItem.userId}`);
      }, 500);
    });
    likeUserInfoWrap.appendChild(likeUserName);
    likeUserInfoWrap.appendChild(likeEmail);
    likeCard.appendChild(likeUserInfoWrap);
    return likeCard;
  }
}
