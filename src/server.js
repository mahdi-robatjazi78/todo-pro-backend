const express = require("express")
const app = express()
const MainRoutes = require("./routes")
const cors = require("cors")
const path = require("path")

const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your client's URL
    methods: ['GET', 'POST' , 'PUT' , "DELETE"],
    allowedHeaders: ['Content-Type', 'X-Auth-Token'],
};

app.use(express.static("public"))
app.use(cors(corsOptions))
app.use(express.json())
app.use(MainRoutes)

app.get("/" , (req,res)=>{
    res.status(200).json({msg:"express is here"})
})

app.listen(8888 ,()=>{
    console.log("server is running on port 8888")
})