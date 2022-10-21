const express = require('express')
const Router = express.Router()
const TodosRouter = require('./todos.routes')
const UsersRouter = require('./users.routes')
const CategoryRoutes = require("./category.routes")



Router.use("/todos" , TodosRouter)
Router.use("/users" , UsersRouter)
Router.use("/category" , CategoryRoutes)




module.exports = Router