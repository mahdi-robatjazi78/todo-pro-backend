const express = require('express')
const Router = express.Router()
const TodosRouter = require('./todos.routes')
const UsersRouter = require('./users.routes')
const CategoryRoutes = require("./category.routes")
const WsRoutes = require("./workspace.routes")

Router.use("/users" , UsersRouter)
Router.use("/ws" , WsRoutes)
Router.use("/todos" , TodosRouter)
Router.use("/category" , CategoryRoutes)

module.exports = Router