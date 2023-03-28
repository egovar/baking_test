import qs from "qs";

const ROOT = "https://api.mumbainet.tzkt.io";

function transformToQuery(params) {
  //gets object, returns string
  if (params && typeof params === "object") {
    return `?${qs.stringify(params)}`;
  }
  return "";
}

async function readResponse(res) {
  try {
    return await res.json();
  } catch (e) {
    console.error(`RESPONSE PARSING ERROR: ${e}`);
  }
}

function logError(error) {
  console.error(`FETCH ERROR: ${error}`);
}

export const server = {
  async get(path, params) {
    try {
      const res = await fetch(`${ROOT}${path}${transformToQuery(params)}`);
      if (res.ok) {
        return await readResponse(res);
      }
      logError(res.status);
    } catch (e) {
      logError(e);
    }
  },
};
