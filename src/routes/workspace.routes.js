const express = require("express");
const WsRouter = express.Router();
const {
  makeWorkspace,
  getAllWorkspaces,
  handleWorkspaceChangeActivation,
  renameWorkspace,
  deleteWorkspace,
  getActiveWorkspaces,
} = require("../controller/workspace");

const verifyToken = require("../db/Authentication");

WsRouter.get("/index", verifyToken, getAllWorkspaces);
WsRouter.get("/get-active", verifyToken, getActiveWorkspaces);
WsRouter.post("/new", verifyToken, makeWorkspace);
WsRouter.delete("/delete", verifyToken, deleteWorkspace);
WsRouter.put("/set-active", verifyToken, handleWorkspaceChangeActivation);
WsRouter.put("/rename", verifyToken, renameWorkspace);

module.exports = WsRouter;
