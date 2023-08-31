const UserModel = require("../db/schema/userSchema");
const ImageModel = require("../db/schema/imageSchema");
const jwt = require("jsonwebtoken");
const userAvatarModel = require("../db/schema/imageSchema"); 
// const { async } = require("crypto-random-string");

const fs = require("fs")
const path = require("path")

const createNewUser = async (req, res, next) => {
  try {
 

    const data = {
      fname: req.body.firstName,
      lname: req.body.lastName,
      password: req.body.password,
      email: req.body.email,
      gender: req.body.gender || "male",
      haveAvatar : false,
      haveBanner : false,
    };

    const newUser = new UserModel(data);
    const saved = await newUser.save();

    const person = saved;

    delete person._id;
    delete person.password;

    res.status(200).json({
      msg: "user successfully save on database",
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let result = await UserModel.findUser_comparePassword(email, password);
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        data: { _id: result._id, email: result.email },
      },
      process.env.JWT_SECRET_PASS
    );

    const User = await UserModel.findOneAndUpdate(
      { email },
      { $set: { token } }
    );
    if (!User) {
      res.status(404).json({ msg: `You'r email not found in our records` });
      return;
    }

    const data = {
      email: result.email, 
      fname: result.fname,
      lname: result.lname,
      gender: result.gender,
      picture : {
        avatar : null,
        banner : null,
      }
    };



    if(User.haveAvatar){
      const f1 = await userAvatarModel.findOne({userId : User._id.toString() , why:"profile-avatar"})
      
      if(f1?.filename){ 
        data.picture.avatar = f1.filename;
      }
    }

    if(User.haveBanner){
      const f2 = await userAvatarModel.findOne({userId : User._id.toString(),why:"profile-banner"})
      
      if(f2?.filename){ 
        data.picture.banner = f2.filename;
      }
    }

    

    res.status(200).json({
      ...data,
      token,
      msg: "you have successfully logged in",
    });
  } catch (error) {
    res.status(404).json({ msg: `You'r email not found in our records` });
    next(error);
  }
};


const GetProfileMeData = async (req, res, next) => {
  try {


    const User = await UserModel.findById(req.user.data._id);
    if (!User) {
      res.status(500).json({ msg: `Something went wrong` });
      return;
    }

    const data = {
      email: User.email, 
      fname: User.fname,
      lname: User.lname,
      gender: User.gender,
      picture : {
        avatar : null,
        banner : null,
      }
    };



    if(User.haveAvatar){
      const f1 = await userAvatarModel.findOne({userId : User._id.toString() , why:"profile-avatar"})
      
      if(f1.filename){ 
        data.picture.avatar = f1.filename;
      }
    }

    if(User.haveBanner){
      const f2 = await userAvatarModel.findOne({userId : User._id.toString(), why:"profile-banner"})
      
      if(f2.filename){ 
        data.picture.banner = f2.filename;
      }
    }

    

    res.status(200).json({
      ...data,
      msg: "Successfully founded you",
    }); 

    
  }catch(error){
    console.log(error)
  }

}




const logoutUser = async (req, res, next) => {
  try {
    let _id = req.user.data._id;

    await UserModel.findOneAndUpdate(
      {
        _id,
      },
      {
        $set: {
          token: "",
        },
      }
    );
    res.status(200).json({ msg: "Exit Successfully" });
  } catch (error) {
    next(error);
  }
};


const uploadUserAvatar = async(req, res, next) => { 
  try{
  
  const avatarUploaded = (req.body.avatarUploaded === "true" ||req.body.avatarUploaded === true)  ? true : false

  console.log("0-->>",req.body.avatarUploaded)

  const profileImageData = {
    userId : req.user?.data?._id,
    originalname:req.file?.originalname,
    mimetype:req.file.mimetype,
    filename :req.file.filename ,  
    whoUseIt : "user",
    why :avatarUploaded ?  "profile-avatar" :"profile-banner"
  }

  const newProfileImage = new ImageModel(profileImageData)
  newProfileImage.save()

  await UserModel.findOneAndUpdate(
    { _id: req.user?.data?._id },
    { $set: avatarUploaded == true ? { haveAvatar : true } : { haveBanner : true} }
  );

    res.status(200).json({msg : "you'r image uploaded successfully"})
  }
  catch(error){
    next(error);
  }
}



module.exports.CreateNewUser = createNewUser;
module.exports.LoginUser = loginUser;
module.exports.GetProfileMeData = GetProfileMeData;
module.exports.LogoutUser = logoutUser;
module.exports.uploadUserAvatar = uploadUserAvatar;