const CategoryModel = require("../db/schema/categorySchema");
const TodoModel = require("../db/schema/todoSchema");
const WorkspaceModel = require("../db/schema/workspaceSchema")
const uuid =require('uuid');   
const { updateWorkspaceTodoSum } = require("./workspace");


const newCategory = async (req, res, next) => {
  try {
    const {title ,ws} = req.body
    const userId =  req.user.data._id
    const accountType = req.user.data.accountType;

    let countOfUserAccountCategories  = await CategoryModel.count({ownerId : userId , ws }) + 1

    if(accountType === "Free" && countOfUserAccountCategories > 6 ){
      res.status(423).json({ msg:`In a free account, you are allowed to create up to 6 categories in every workspaces. Please consider upgrading your account.`});
      return
    }

    if(accountType === "Premium" && countOfUserAccountCategories > 15 ){
      res.status(423).json({ msg:`In a Premium account, you are allowed to create up to 15 categories in every workspaces.`});
      return
    }

    const newCategory = await new CategoryModel(
      {
        title,
        ws,
        ownerId:userId,
        uuid :uuid.v4(),
        task_count:0
      }
    )
    await newCategory.save()
    res.status(200).json({
      msg:"Successfully category saved on  database"
    })


  } catch (error) {

    res.status(500).json({
      msg:"Something went wrong category dont saved"
    })

  }
};

const getCategoryList = async(req,res,next)=>{
  try{

    const id = req.user.data._id
    const ws = req.query.ws
    const listCategories = await CategoryModel.find({ownerId:id , ws })
    
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
    const ws = req.query.ws


    await CategoryModel.findOneAndDelete({uuid:id , ws})

    await TodoModel.updateMany(
      {categoId:id},
      {
        $set:{
          categoId:"other"
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
    const ws = req.query.ws
    await CategoryModel.findOneAndDelete({uuid:id})
    await TodoModel.deleteMany(
      {categoId:id},
    )

    const lengthTodos = await updateWorkspaceTodoSum(ws)

    await WorkspaceModel.findOneAndUpdate({
      id : ws
    } , {
      todoSum:lengthTodos
    });


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

    await CategoryModel.updateOne({uuid} , {$set:{title:newTitle}})
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