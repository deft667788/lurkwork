import request from "../request.js";

export const getUserInfo = (userId) => {
  request("/user", { userId: userId }, { method: "get" })
    .then((res) => {
      res.jobs = null;
      localStorage.setItem("userInfo", JSON.stringify(res));
    })
    .catch((error) => {
      console.log(error);
    });
};