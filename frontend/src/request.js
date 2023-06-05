import { BACKEND_PORT } from "./config.js";
import { useGo } from "./route.js";
import { useMessage, useLoading } from "./utils.js";

let baseURL = "http://127.0.0.1:" + BACKEND_PORT;

// Encapsulate the logic of sending HTTP requests
export default function request(url, params, config) {
  if (!config?.hideLoading) useLoading();
  const initConfigs = {
    method: "GET",
    params: null,
    body: null,
    headers: {},
    cache: "no-cache",
    responseType: "JSON",
  };
  url = baseURL + url;
  config = Object.assign(initConfigs, config);
  let { method, responseType } = config;
  config.method = method.toUpperCase();
  // with token
  let token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = token;
  config.headers["Content-Type"] = "application/json";
  config.headers["Accept"] = "application/json";

  let paramsRes = "";
  if (/^(POST|PUT|PATCH|DELETE)$/i.test(config.method)) {
    if (params != null) params = JSON.stringify(params);
    config.body = params;
  } else {
    for (const key in params) {
      const item = params[key];
      paramsRes += `&${key}=${item}`;
    }
  }
  // concat get url
  if (paramsRes) url = url + `?${paramsRes}`;
  // send fetch request
  return fetch(url, config)
    .then((response) => {
      let { status, statusText } = response;
      // judge response status
      if (status >= 200 && status < 400) {
        let result;
        switch (responseType.toUpperCase()) {
          case "JSON":
            result = response.json();
            break;
          case "TEXT":
            result = response.text();
            break;
          case "BLOB":
            result = response.blob();
            break;
          case "ARRAYBUFFER":
            result = response.arrayBuffer();
            break;
        }
        return result;
      }
      return Promise.reject({
        code: "STATUS ERROR",
        status,
        response: response.json(),
      });
    })
    .catch((reason) => {
      if (reason && reason.code === "STATUS ERROR") {
        reason.response.then((res) => {
          switch (reason.status) {
            case 400:
              useMessage("error", res.error);
              break;
            case 401:
              useMessage("error", res.error);
              break;
            case 403:
              useMessage("error", res.error);
              useGo("#login");
              break;
            case 404:
              useMessage("error", res.error);
              break;
          }
        });
      }
      return Promise.reject(reason);
    })
    .finally(() => {
      setTimeout(() => {
        useLoading().hideLoading();
      }, 500);
    });
}
