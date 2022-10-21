const { mongoose, connection } =require("./config")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
const jwt = require("jsonwebtoken")
dotenv.config();


const userSchema = new mongoose.Schema({
  fname: {type:String,required:false, trim:true },
  lname: {type:String,required:false, trim:true },
  userName:{type:String,required:true , trime:true},
  email: {type:String, required: true, trim:true },
  password: {type:String,required:true, trim:true },
  token:{type:String,required:false},
  gender:{type:String,required:true}
});



userSchema.pre("save", function (next){
  
  // hash password
  let user = this;
  const saltRounds = 10;

  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) throw new Error(err);
      bcrypt.hash(user.password, salt, function (err, HASH) {
        if (err) throw new Error(err);
        user.password = HASH;
        
        console.log(">>>user.>>>" , user)
       
        next()
      });
    });
  } 



});


// compare user password and database password
userSchema.statics.findUser_comparePassword = function (email,password) {

  let users = this
  return users.findOne({email:{$eq:email}}).then((User)=>{
    if(!User){
      return Promise.reject()
    }else{
      return new Promise((resolve, reject) => {
        bcrypt.compare(password, User.password, function (err, isMatch) {
          if (isMatch===false) reject(err);
          else {
            resolve(User);
          }
        });
      });
    }
  })

};

userSchema.statics.generateToken_forUser = function (User){
 // web token initializing with 1 hour expiration time
 const token = jwt.sign(
  {
    exp : Math.floor(Date.now() / 1000) + (60 * 60),
    data:User
  }
   , process.env.JWT_SECRET_PASS
)

    return token
}


module.exports =  connection.model("Users", userSchema);
