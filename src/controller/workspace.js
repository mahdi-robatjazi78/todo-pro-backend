const WorkspaceModel = require("../db/schema/workspaceSchema");
const cryptoRandomString = require("crypto-random-string");
const CategoryModel = require("../db/schema/categorySchema");
const TodoModel = require("../db/schema/todoSchema");

const makeWorkspace = async (req, res, next) => {
  try {
    const userID = req.user.data._id;
  
    const wsList = await WorkspaceModel.find({
      owner: userID,
    });
    
    if(wsList.length >= 6){
      res.status(423).json({ msg:`You are allowed to create 6 workspaces Please upgrade your account` });
      return
    }
    
    else {
   
    const workspaceBody = new WorkspaceModel({
      title: req.body.title,
      date: new Date().getTime(),
      owner: userID,
      id: cryptoRandomString({ length: 7 }),
      active: false,
      categorySum: 0,
      todoSum: 0,
    });

    await workspaceBody.save();

    res.status(200).json({ msg: "you'r todo workspace created successfully" });
  }

  } catch (error) {
    console.error(error);
  }
};

const getAllWorkspaces = async (req, res, next) => {
  try {
    const userID = req.user.data._id;
    const searchText = req.query.searchText;
    let wsList = [];
    if (!searchText) {
      // get all workspaces
      wsList = await WorkspaceModel.find({ owner: userID });
    } else {
      // get Searched list workspaces

      wsList = await WorkspaceModel.find({
        owner: userID,
        title: { $regex: searchText },
      });
    }

    if (wsList.length) {
      res.status(200).json({
        workspaces: wsList,
      });
    } else {
      res.status(200).json({
        msg: "Not founde any workspaces",
      });
    }
  } catch (error) {
    res.status(400).json({
      msg: "Something went wrong",
    });
  }
};

const getActiveWorkspaces = async (req, res, next) => {
  try {
    const userID = req.user.data._id;

    const activeWorkspace = await WorkspaceModel.find({
      owner: userID,
      active: true,
    });
    if (activeWorkspace.length) {
      res.status(200).json({
        activeWorkspace: activeWorkspace[0] ? activeWorkspace[0] : null,
      });
    } else {
      res.status(404).json({
        activeWorkspace: null,
        msg: "You not have any active workspace",
      });
    }
  } catch (error) {
    res.status(400).json({
      msg: "Something went wrong",
    });
  }
};

const handleWorkspaceChangeActivation = async (req, res, next) => {
  try {
    const userID = req.user.data._id;
    const wsId = req.body.id;
    const active = req.body.active;

    if (active) {
      await WorkspaceModel.updateMany(
        {
          owner: userID,
        },
        {
          active: false,
        }
      );

      await WorkspaceModel.updateOne(
        {
          id: wsId,
        },
        {
          active: true,
        }
      );
    } else {
      await WorkspaceModel.updateMany(
        {
          owner: userID,
        },
        {
          active: false,
        }
      );
    }
    if (active) {
      const ActiveWorkspace = await WorkspaceModel.find({
        owner: userID,
        active: true,
      });
      res.status(200).json({
        msg: "Activated successfully",
        activeWorkspace: ActiveWorkspace[0],
      });
    } else {
      res
        .status(200)
        .json({ msg: "Deactivated successfully", activeWorkspace: null });
    }
  } catch (error) {
    res.status(400).json({
      msg: "Something went wrong",
    });
  }
};

const renameWorkspace = async (req, res, next) => {
  try {
    const wsId = req.body.id;
    const newName = req.body.title;

    await WorkspaceModel.updateOne(
      {
        id: wsId,
      },
      {
        title: newName,
      }
    );

    const data = await WorkspaceModel.findOne({
      id: wsId,
    });

    console.log("data >> ", data);

    res.status(200).json({
      msg: "Rename successfully",
      data: { id: data.id, title: data.title },
    });
  } catch (error) {
    res.status(400).json({
      msg: "Something went wrong",
    });
  }
};

const deleteWorkspace = async (req, res, next) => {
  try {
    const wsId = req.query.id;
    console.log(wsId);
    if (!wsId) {
      res.status(400).json({
        msg: "Please send workspace id",
      });
      return;
    }

    await WorkspaceModel.findOneAndDelete({
      id: wsId,
    });

    await CategoryModel.deleteMany({
      ws: wsId,
    });

    await TodoModel.deleteMany({
      ws: wsId,
    });

    res.status(200).json({ msg: "Your workspace deleted successfully" });
  } catch (error) {
    res.status(400).json({
      msg: "Something went wrong",
    });
  }
};

const updateWorkspaceTodoSum = async (ws) => {
  try {
    const t = await TodoModel.find({ ws });
    return t.length;
  } catch (error) {
    console.log(error);
  }
};

exports.makeWorkspace = makeWorkspace;
exports.getActiveWorkspaces = getActiveWorkspaces;
exports.getAllWorkspaces = getAllWorkspaces;
exports.handleWorkspaceChangeActivation = handleWorkspaceChangeActivation;
exports.renameWorkspace = renameWorkspace;
exports.deleteWorkspace = deleteWorkspace;
exports.updateWorkspaceTodoSum = updateWorkspaceTodoSum;
