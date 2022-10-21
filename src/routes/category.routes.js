
const express = require("express")
const CategoryRoutes = express.Router()
const {NewCategory, GetCategoryList ,GetInformationOfCategory,DeleteOnlyCategory, DeleteCategoryWithTodos ,EditCategoryTitle} = require('../controller/categoryController')
const verifyToken = require("../db/Authentication")


CategoryRoutes.get("/getAll",verifyToken,GetCategoryList)
CategoryRoutes.get("/getInfo",verifyToken,GetInformationOfCategory)
CategoryRoutes.post("/new",verifyToken,NewCategory)
CategoryRoutes.put("/editname",verifyToken,EditCategoryTitle)
CategoryRoutes.delete("/deleteOnlyCategory",verifyToken,DeleteOnlyCategory)
CategoryRoutes.delete("/deleteCategoryWithTodos",verifyToken,DeleteCategoryWithTodos)



module.exports = CategoryRoutes