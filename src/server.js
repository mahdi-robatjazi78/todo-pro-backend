const express = require("express")
const app = express()
const MainRoutes = require("./routes")


app.use(express.json(   ))
app.use(MainRoutes)

app.get("/" , (req,res)=>{
    res.status(200).json({msg:"express is here"})
})


app.listen(8888 ,()=>{
    console.log("server is running on port 8888")
})