import { BACKEND_PORT } from "./config.js";
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from "./helpers.js";
import { renderPage, useGo } from "./route.js";
import { Header } from "./components/header.js";
import { getFeedList } from "./apis/feed.js";
import { pollingInstance, useMessage } from "./utils.js";

const initApp = () => {
  new Header();
  if (!localStorage.getItem("token")) {
    useGo("#login");
  } else {
    renderPage();
  }
};
initApp();
