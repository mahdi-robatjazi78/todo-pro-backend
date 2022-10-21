
const TodoModel = require("../db/todoSchema")
const CategoryModel = require("../db/categorySchema");
const { default: mongoose } = require("mongoose");



const getAllTodos = async(req,res,next)=>{
    try{
      const userID = req.user.data._id
      const category = req.query.category || "other"
      // console.log(userID)
      // console.log("category , " , category)


   

      let Todos =[]
      if(category === "other"){  
       Todos = await TodoModel.find({owner : userID})  
      }
      else{
        Todos = await TodoModel.find({owner : userID , categoId : category})  
      }

      
      res.status(200).json({
        todos:Todos
      })
    }catch(error){
        res.status(400).json({msg:"something went wrong"})
    }

};

const newTodo  = async (req,res)=>{
    
  try{

    const id = req.user.data._id
     
     const body = new TodoModel(
    {
      body:req.body.todo,
      categoId : req.body.categoId || "other",
      // expireTime : req.body.expireTime,
      date:new Date().getTime(),
      flag:"created",
      owner:id
    })
    await body.save()

    
     
    if(req.body.categoId !== "other"){
      await CategoryModel.findOneAndUpdate({uuid:req.body. categoId} , {$inc:{task_count:1}})
    }


    res.status(200).json({msg:"you'r todo created successfully"})

  }catch(error){
    console.log(error)
    res.status(400).json({msg:"something went wrong"})
  }
}

const setIsDoneTask =async(req,res,next)=>{
    try {

      const id = req.body.id ;

      await TodoModel.findOneAndUpdate({_id : id} , {$set:{flag:"isDone"}})


      res.status(200).json({
        msg:"Your todo successfuly doned"
      })


    } catch (error) {
        next(error)
    }
}

const deleteTask =async(req,res,next)=>{
  try {
    const id = req.params.id ;

    const todo = await TodoModel.findById(id)
    const categoId = todo?.categoId 

    


    if(categoId){ 
      await CategoryModel.findOneAndUpdate({uuid:categoId} , {$inc:{task_count:-1}})
    }

    await TodoModel.deleteOne({_id : id})


    res.status(200).json({
      msg:"Your todo successfuly removed"
    })


  } catch (error) {
      next(error)
  }
}


const bulkDeleteTask = async(req,res,next)=>{

}

const updateTask =async(req,res,next)=>{
  try { 
    const id = req.body.id ;
    await TodoModel.findOneAndUpdate({_id : id} , {$set:{body:req.body.body}})

    res.status(200).json({
      msg:"Your todo successfuly updated"
    })

  } catch (error) {
      next(error)
  }
}

const assignTaskToCategory = async(req,res,next)=>{
  try{

    const {todoId , categoId} = req.body

    if(!todoId || !categoId){
      res.status(400).json({msg:"something went wrong"})
    }

    else{

      await TodoModel.findOneAndUpdate({_id:todoId} , {$set:{categoId}})
      await CategoryModel.findOneAndUpdate({ uuid :categoId} , {$inc:{task_count:1}})
      
      res.status(200).json({msg:"Todo successfully added to category"})
      
      
    }


  }catch(error){
    console.log(error)
    next(error)
  }
}

const assignTaskToAnotherCategory = async(req,res,next)=>{


  try{

    
    const {todoId ,prevCategoId , newCategoId} = req.body
    
    console.log("incomes >>>",todoId ,prevCategoId , newCategoId)
    if(!todoId || !prevCategoId || !newCategoId){
      res.status(400).json({msg:"something went wrong"})
    }
    else{
      
      
      if(prevCategoId === "other"){
        await CategoryModel.findOneAndUpdate({ uuid :newCategoId} , {$inc:{task_count:1}})
      }
      
      else if (newCategoId === "other"){
        await CategoryModel.findOneAndUpdate({ uuid :prevCategoId} , {$inc:{task_count:-1}})
      } 
      
      else{
        
        await CategoryModel.findOneAndUpdate({ uuid :prevCategoId} , {$inc:{task_count:-1}})
        await CategoryModel.findOneAndUpdate({ uuid :newCategoId} , {$inc:{task_count:1}})
        
      }
      
      
      
      
      await TodoModel.findOneAndUpdate({_id:todoId} , {$set:{categoId : newCategoId}})
      res.status(200).json({msg:"Todo successfully added to category"})

    }
  }
    catch(error){
      console.log(error)
      res.status(400).json({msg:"something went wrong"})
  
    }
  
}

const bulkAssignTaskToCategory =async(req,res)=>{
  
}

const exitTodoFromCategory = async(req,res)=>{
  try{

    const {todos, category} = req.body
    await TodoModel.updateMany({
      _id : {$in : todos}
    }   , {
      categoId:"other"
    })

   const result =  await CategoryModel.findOneAndUpdate({uuid:category} , {$inc:{task_count:-todos.length}})

    res.status(200).json({msg:`${todos.length} todos exited from category ${result.title}`})


  }catch(error){
    console.log(error)

  }
}

exports.getAllTodos = getAllTodos
exports.newTodo = newTodo
exports.setIsDoneTask = setIsDoneTask
exports.deleteTask = deleteTask
exports.updateTask = updateTask
exports.assignTaskToCategory=assignTaskToCategory
exports.assignTaskToAnotherCategory = assignTaskToAnotherCategory
exports.exitTodoFromCategory=exitTodoFromCategory