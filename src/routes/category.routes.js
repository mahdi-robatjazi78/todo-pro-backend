
const express = require("express")
const CategoryRoutes = express.Router()
const {NewCategory, GetCategoryList ,GetInformationOfCategory,DeleteOnlyCategory, DeleteCategoryWithTodos ,EditCategoryTitle} = require('../controller/category')
const verifyToken = require("../db/Authentication")


CategoryRoutes.get("/index",verifyToken,GetCategoryList)
CategoryRoutes.get("/getInfo",verifyToken,GetInformationOfCategory)
CategoryRoutes.post("/store",verifyToken,NewCategory)
CategoryRoutes.put("/editname",verifyToken,EditCategoryTitle)
CategoryRoutes.delete("/deleteOnlyCategory",verifyToken,DeleteOnlyCategory)
CategoryRoutes.delete("/deleteCategoryWithTodos",verifyToken,DeleteCategoryWithTodos)



module.exports = CategoryRoutes