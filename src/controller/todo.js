const TodoModel = require("../db/schema/todoSchema");
const CategoryModel = require("../db/schema/categorySchema");
const WorkspaceModel = require("../db/schema/workspaceSchema");

const _ = require("lodash");


const getAllTodos = async (req, res, next) => {
  try {
    const userID = req.user.data._id;
    const ws = req.query.ws;

    const page = req.query?.page;
    const perPage = req.query?.perPage;
    const searchText = req.query?.searchText;
    const category = req.query?.category;
    const priorityLevel = req.query?.level;


    const filter_by = req.query.filter_by;

    /* filter_by
         category
         search
         priority
         done
         pagination

        coming soon
           expiration
           created_at

    */


    if (!filter_by) {
      // no filter give all todos into workspace

      const todos = await TodoModel.find({owner: userID, ws});
      res.status(200).json({todos});
      return
    }

    if (filter_by === "done") {
      const todos = await TodoModel.find({owner: userID, ws: ws, flag: "isDone"});
      res.status(200).json({todos});
      return
    }


    if (filter_by === "search") {
      const todos = await TodoModel.find(
        {
          owner: userID,
          ws: ws,
          body: {$regex: new RegExp(searchText.toLowerCase(), "i")},
        }
      );
      res.status(200).json({todos});
      return

    }

    if (filter_by === "priority") {
      const todos = await TodoModel.find(
        {
          owner: userID,
          ws: ws,
          priority: priorityLevel
        }
      );
      res.status(200).json({todos});
      return

    }


    if (filter_by === "category") {
      const todos = await TodoModel.find(
        {
          owner: userID,
          ws,
          categoId: category
        }
      );
      res.status(200).json({todos});
      return

    }

    if (filter_by === "pagination") {
      // use mongoose-paginate extention for add paginate query
      const todos = await TodoModel.paginate({owner: userID, ws}, {page, limit: perPage});
      res.status(200).json({
        todos: todos.docs,
        meta: {
          page: todos.page,
          limit: todos.limit,
          total_items: todos.total,
          total_pages: todos.pages,
        },
      });
      return
    }

    res.status(400).json({msg: "There is a problem with your request"})


  } catch (error) {
    res.status(400).json({msg: "something went wrong"});
  }
};

const newTodo = async (req, res) => {
  try {
    const id = req.user.data._id;
    const accountType = req.user.data.accountType;

    let countOfUserAccountTodos = await TodoModel.count({owner: id, ws: req.body.ws}) + 1


    if (accountType === "Free" && countOfUserAccountTodos > 100) {
      res.status(423).json({msg: `In a free account, you are allowed to create up to 100 todos in every workspaces. Please consider upgrading your account.`});
      return
    }

    if (accountType === "Premium" && countOfUserAccountTodos > 250) {
      res.status(423).json({msg: `In a Premium account, you are allowed to create up to 250 todos in every workspaces.`});
      return

    }


    const body = new TodoModel({
      body: req.body.todo,
      ws: req.body.ws,
      categoId: req.body.categoId || "other",
      date: new Date().getTime(),
      flag: "created",
      owner: id,
      priority: req.body?.priority || 0,
    });

    if (req.body.categoId !== "other") {
      await CategoryModel.findOneAndUpdate({uuid: req.body.categoId}, {$inc: {task_count: 1}});
    }

    await WorkspaceModel.findOneAndUpdate({
      id: req.body.ws,
    }, {
      $inc: {todoSum: 1},
    });
    await body.save();

    res.status(200).json({msg: "you'r todo created successfully"});
  } catch (error) {
    console.log(error);
    res.status(400).json({msg: "something went wrong"});
  }
};

const setIsDoneTask = async (req, res, next) => {
  try {
    const id = req.body.id;

    if (!id) return res.status(400).json({msg: "You'r todo not have id !"});

    await TodoModel.findOneAndUpdate({_id: id}, {$set: {flag: "isDone"}});

    res.status(200).json({
      msg: "Your todo successfuly doned",
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const ws = req.query.ws;
    const todo = await TodoModel.findById(id);
    const categoId = todo?.categoId;

    if (categoId) {
      await CategoryModel.findOneAndUpdate({uuid: categoId}, {$inc: {task_count: -1}});
    }

    await TodoModel.deleteOne({_id: id});

    await WorkspaceModel.findOneAndUpdate({
      id: ws,
    }, {
      $inc: {todoSum: -1},
    });

    res.status(200).json({
      msg: "Your todo successfuly removed",
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const id = req.body.id;
    await TodoModel.findOneAndUpdate({_id: id}, {$set: {body: req.body.body}});

    res.status(200).json({
      msg: "Your todo successfuly updated",
    });
  } catch (error) {
    next(error);
  }
};

const assignTaskToCategory = async (req, res, next) => {
  try {
    const {todoId, categoId} = req.body;

    if (!todoId || !categoId) {
      res.status(400).json({msg: "something went wrong"});
    } else {
      await TodoModel.findOneAndUpdate({_id: todoId}, {$set: {categoId}});
      await CategoryModel.findOneAndUpdate({uuid: categoId}, {$inc: {task_count: 1}});

      res.status(200).json({msg: "Todo successfully added to category"});
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const assignTaskToAnotherCategory = async (req, res, next) => {
  try {
    const {todoId, prevCategoId, newCategoId} = req.body;

    if (!todoId || !prevCategoId || !newCategoId) {
      res.status(400).json({msg: "something went wrong"});
    } else {
      if (prevCategoId === "other") {
        // ---> other -> category
        await CategoryModel.findOneAndUpdate({uuid: newCategoId}, {$inc: {task_count: 1}});
      } else if (newCategoId === "other") {
        // ---> category -> other
        await CategoryModel.findOneAndUpdate({uuid: prevCategoId}, {$inc: {task_count: -1}});
      } else {
        // ---> category -> category
        await CategoryModel.findOneAndUpdate({uuid: prevCategoId}, {$inc: {task_count: -1}});
        await CategoryModel.findOneAndUpdate({uuid: newCategoId}, {$inc: {task_count: 1}});
      }
      await TodoModel.findOneAndUpdate({_id: todoId}, {$set: {categoId: newCategoId}});
      res.status(200).json({msg: "Todo successfully added to category"});
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({msg: "something went wrong"});
  }
};

const exitTodoFromCategory = async (req, res) => {
  try {
    const {todos, category} = req.body;
    await TodoModel.updateMany({
      _id: {$in: todos},
    }, {
      categoId: "other",
    });

    const result = await CategoryModel.findOneAndUpdate({uuid: category}, {$inc: {task_count: -todos.length}});

    res.status(200).json({
      msg: `${todos.length} todos exited from category ${result.title}`,
    });
  } catch (error) {
    console.log(error);
  }
};

const bulkRemoveTodos = async (req, res) => {
  try {
    const ws = req.query.ws;
    const {todoListIds} = req.body;
    const count = todoListIds.length;
    const userID = req.user.data._id;

    const list = await TodoModel.find({_id: {$in: todoListIds}});
    const listOfCategoIds = list.filter(item => item.categoId !== null && item.categoId !== "other").categoId
    await CategoryModel.updateMany({uuid: {$in: listOfCategoIds}}, {$inc: {task_count: -1}})
    await WorkspaceModel.updateOne({id: ws}, {$inc: {todoSum: -Math.abs(count)}})
    await TodoModel.deleteMany({owner: userID, ws, _id: {$in: todoListIds}});

    res.status(200).json({
      msg: `${count} Todo Items Deleted Successfully`,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: `Something went wrong in server`,
    });
  }
};

const bulkSetTodosDone = async (req, res) => {
  try {
    const ws = req.query.ws;
    const {todoListIds} = req.body;
    const count = todoListIds.length;
    const userID = req.user.data._id;

    await TodoModel.updateMany({owner: userID, _id: {$in: todoListIds}}, {flag: "isDone"});
    res.status(200).json({
      msg: `${count} Todo Items Done`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: `Something went wrong in server`,
    });
  }
};

const bulkAssignTodosToCategory = async (req, res, next) => {
  try {
    const {todoList, categoId} = req.body;
    const ws = req.query.ws;
    const count = todoList.length

    if (!todoList?.length || !categoId || !ws) {
      res.status(400).json({msg: "something went wrong"});
    } else {

      const todoListAndCategories = await TodoModel.find({ws: ws, _id: {$in: todoList}}).select({
        _id: 1,
        categoId: 1,
        body: 1
      })

      if (categoId === "other") {
        // all selected todos assign to other  OR  target is  other

        const grouped = _.groupBy(todoListAndCategories, "categoId")
        const result = Object.entries(grouped)

        for (const item of result) {
          if (item[0] !== "other") {
            await CategoryModel.updateMany({ws, uuid: item[0]}, {$inc: {task_count: -Math.abs(item[1].length)}})
          }
        }
        await TodoModel.updateMany({ws, _id: {$in: todoList}}, {$set: {categoId: "other"}})
        res.status(200).json({msg: "All Todos successfully added to category"});
        return
      }

      if (todoListAndCategories.every(item => item.categoId === "other")) {
        // if all todos category id is other and target is any category

        await TodoModel.updateMany({
          ws,
          _id:
            {
              $in: todoList
            }
        }, {$set: {categoId: categoId}})
        await CategoryModel.findOneAndUpdate({ws: ws, uuid: categoId}, {$inc: {task_count: count}})
        res.status(200).json({msg: "All Todos successfully added to category"});
        return
      } else {
        // any category to any category
        const grouped = _.groupBy(todoListAndCategories, "categoId")
        const result = Object.entries(grouped)
        for (const item of result) {
          if (item[0] !== "other") {
            await CategoryModel.updateMany({ws, uuid: item[0]}, {$inc: {task_count: -Math.abs(item[1].length)}})
          }
        }
        const filteredTodosSameCategoryWithTargetCatgory = todoListAndCategories.filter(item => item.categoId !== categoId)
        await CategoryModel.updateMany({
          ws,
          uuid: categoId
        }, {$inc: {task_count: filteredTodosSameCategoryWithTargetCatgory.length}})
        await TodoModel.updateMany({ws, _id: {$in: todoList}}, {$set: {categoId}})
        res.status(200).json({msg: "All Todos successfully added to category"});
        return
      }
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updatePriority = async (req, res) => {
  try {
    const id = req.body.id;
    await TodoModel.findOneAndUpdate({_id: id}, {$set: {priority: +req.body.priority}});

    res.status(200).json({
      msg: "Your todo priority successfuly updated",
    });
  } catch (error) {
    next(error);
  }
};

const updatePriorityBulk = async (req, res) => {
  try {
    const ws = req.query.ws;
    const {todoListIds, priority} = req.body;
    const count = todoListIds.length;
    const userID = req.user.data._id;

    await TodoModel.updateMany({owner: userID, _id: {$in: todoListIds}}, {priority});
    res.status(200).json({
      msg: `${count} Todo items set ${priority === 0 ? "Low Priority" : priority === 1 ? "Medium Priority" : "High Priority"}`,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllTodos = getAllTodos;
exports.newTodo = newTodo;
exports.setIsDoneTask = setIsDoneTask;
exports.deleteTask = deleteTask;
exports.updateTask = updateTask;
exports.assignTaskToCategory = assignTaskToCategory;
exports.assignTaskToAnotherCategory = assignTaskToAnotherCategory;
exports.exitTodoFromCategory = exitTodoFromCategory;
exports.bulkRemoveTodos = bulkRemoveTodos;
exports.bulkSetTodosDone = bulkSetTodosDone;
exports.bulkAssignTodosToCategory = bulkAssignTodosToCategory;
exports.updatePriority = updatePriority;
exports.updatePriorityBulk = updatePriorityBulk;
