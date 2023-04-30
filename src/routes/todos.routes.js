const express = require("express")
const TodosRouter = express.Router()
const {getAllTodos,newTodo,setIsDoneTask,deleteTask,updateTask,assignTaskToCategory , exitTodoFromCategory, assignTaskToAnotherCategory}
 = require('../controller/todo')
const verifyToken = require("../db/Authentication")



TodosRouter.get("/index",verifyToken,getAllTodos)
TodosRouter.post("/store",verifyToken,newTodo)
TodosRouter.put("/done",verifyToken,setIsDoneTask)
TodosRouter.delete("/delete/:id",verifyToken,deleteTask)
TodosRouter.put("/update-body",verifyToken,updateTask)
TodosRouter.put("/add-to-category" , verifyToken , assignTaskToCategory)
TodosRouter.put("/assign-to-another-category" , verifyToken , assignTaskToAnotherCategory)
TodosRouter.put("/exit-from-category" , verifyToken , exitTodoFromCategory)


module.exports = TodosRouter