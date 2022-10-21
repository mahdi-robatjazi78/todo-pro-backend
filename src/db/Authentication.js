const jwt = require('jsonwebtoken')

const verifyToken = (req,res,next)=>{

    const token = req.headers["x-auth-token"]
    if(!token){
        res.status(403).json({error: "token required for authentication"})
    }

    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET_PASS,)


        req.user = decoded
    }catch(error)
    {
        return res.status(401).json({error:"Invalid token"})
    }

    return next()
}

module.exports = verifyToken;