import qs from "qs";

export { socket } from "./socket";

const ROOT = "https://api.mumbainet.tzkt.io";

export const server = {
  _transformToQuery: (params) => {
    //gets object, returns string
    if (params && typeof params === "object") {
      return `?${qs.stringify(params, { allowDots: true })}`;
    }
    return "";
  },

  _readResponse: async (res) => {
    try {
      return await res.json();
    } catch (e) {
      console.error(`RESPONSE PARSING ERROR: ${e}`);
    }
  },

  _logError: (error) => {
    console.error(`FETCH ERROR: ${error}`);
  },

  async get(path, params) {
    try {
      const res = await fetch(
        `${ROOT}${path}${this._transformToQuery(params)}`
      );
      if (res.ok) {
        return await this._readResponse(res);
      }
      this._logError(res.status);
    } catch (e) {
      this._logError(e);
    }
  },
};
