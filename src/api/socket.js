const signalR = require("@microsoft/signalr");

const SOCKET_PATH = "https://api.mumbainet.tzkt.io/v1/ws";

export const socket = {
  connection: new signalR.HubConnectionBuilder().withUrl(SOCKET_PATH).build(),
  init: async function () {
    await this.connection.start();
    this.connection.onclose(this.init);
  },
  send: function (message) {
    return this.connection.invoke(message);
  },
  on: function (event, callback) {
    this.connection.on(event, callback);
  },
};
