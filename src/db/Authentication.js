const jwt = require('jsonwebtoken')

const verifyToken = (req,res,next)=>{

    const token = req.headers["x-auth-token"]

    if(!token){
        res.status(403).json({msg: "Token required for authentication please first login"})
    }

    
    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET_PASS,)
        req.user = decoded

    }catch(error)
    {
        return res.status(401).json({msg:"Invalid token please first login"})
    }

    return next()
}

module.exports = verifyToken;