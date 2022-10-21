const CategoryModel = require("../db/categorySchema");
const TodoModel = require("../db/todoSchema");


const uuid =require('uuid')   
const newCategory = async (req, res, next) => {
  try {
    const {title} = req.body
    const id =  req.user.data._id

    const newCategory = await new CategoryModel({title,ownerId:id  , uuid :uuid.v4() , task_count:0})
    newCategory.save()

    res.status(200).json({
      msg:"Successfully categroy saved on  database"
    })


  } catch (error) {
   
    res.status(500).json({
      msg:"Something went wrong categroy not saved"
    }) 

  }
};

const getCategoryList = async(req,res,next)=>{
  try{

    const id = req.user.data._id

    const listCategories = await CategoryModel.find({ownerId:id})
    

    res.status(200).json({msg:"successfully" , list : listCategories})


  }catch(error){
    next(error)
  }
}


const getInformationOfCategory = async (req,res)=>{
  try{

    const {uuid} = req.query

    const category = await CategoryModel.findOne({uuid})
    const todos = await TodoModel.find({categoId : uuid})
    const isDone_tasks = await TodoModel.find({categoId : uuid , flag :"isDone"})



    const task_count = todos.length

    const isDone_tasks_count = isDone_tasks.length
 

    const obj = {
      category:category,
      task_count,
      isDone_tasks_count,
    }




    res.status(200).json(obj)


  }catch(error){
    res.status(400).json({msg:"something went wrong"})
  }
}



const deleteOnlyCategory = async (req,res,next)=>{
  try{
    const id = req.query.id
    const result = await CategoryModel.findOneAndDelete({uuid:id})
    const updatedTodos = await TodoModel.updateMany(
      {categoId:id},
      {
        $set:{
          categoId:null
        }
      }
      )
    res.status(200).json({msg:"Successfully Deleted Category"})
  }catch(error){
    console.log(error)
  }
}





const deleteCategoryWithTodos = async (req,res)=>{
  try{
    const id = req.query.id
    const result = await CategoryModel.findOneAndDelete({uuid:id})
    const updatedTodos = await TodoModel.deleteMany(
      {categoId:id},
      )
    res.status(200).json({msg:"Successfully Deleted Category"})
  }catch(error){
    console.log(error)
    res.status(400).json({msg:"something went wrong"})

  }

}

const editCategoryTitle = async(req,res)=>{
  try{
    const uuid = req.body.uuid
    const newTitle = req.body.newTitle

    const result = await CategoryModel.updateOne({uuid} , {$set:{title:newTitle}})
    res.status(200).json({msg:"Edit Category Name Successfully Done"})

  }catch(error){
    res.status(400).json({msg:"something went wrong"})
  }
}



module.exports.NewCategory = newCategory;
module.exports.GetCategoryList = getCategoryList;
module.exports.GetInformationOfCategory = getInformationOfCategory;
module.exports.DeleteOnlyCategory = deleteOnlyCategory
module.exports.DeleteCategoryWithTodos = deleteCategoryWithTodos
module.exports.EditCategoryTitle = editCategoryTitle