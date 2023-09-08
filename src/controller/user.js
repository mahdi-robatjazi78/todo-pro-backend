const UserModel = require("../db/schema/userSchema");
const ImageModel = require("../db/schema/imageSchema");
const jwt = require("jsonwebtoken");
const userAvatarModel = require("../db/schema/imageSchema");
const fs = require("fs");
const path = require("path");


const SignupNewUser = async (req, res, next) => {
  try {
    const data = {
      fname: req.body.firstName,
      lname: req.body.lastName,
      password: req.body.password,
      email: req.body.email,
      haveAvatar: false,
      haveBanner: false,
      accountType: "Free",
      gender: req.body?.gender || "unknown"
    };

    const newUser = new UserModel(data);
    await newUser.save();


    // this used user send any avatar or banner when signup making temp token is nessessary

    const temp_token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 2, // 2 minute expire
        data: {_id: newUser?._id},
      },
      process.env.JWT_SECRET_PASS
    );


    res.status(200).json({
      msg: "user successfully save on database",
      status: 200,
      temp_token
    });
  } catch (error) {
    next(error);
  }
};


const uploadUserAvatarIntoSignup = async (req, res, next) => {
  try {

    if (!req?.body?.temp_token) {
      res.status(400).json({msg: "you have not any id"})
    }


    const decoded_temp_token = jwt.verify(req?.body?.temp_token, process.env.JWT_SECRET_PASS)
    console.log("decoded_temp_token , ->>>", decoded_temp_token)

    const userId = decoded_temp_token?.data?._id

    const User = await UserModel.findById(userId)

    if (!User) {
      res.status(500).json({msg: `Something went wrong`});
      return;
    }


    const avatarUploaded =
      req.body.avatarUploaded === "true" || req.body.avatarUploaded === true
        ? true
        : false;

    const profileImageData = {
      userId: userId,
      originalname: req.file?.originalname,
      mimetype: req.file.mimetype,
      filename: req.file.filename,
      whoUseIt: "user",
      why: avatarUploaded ? "profile-avatar" : "profile-banner",
    };

    const newProfileImage = new ImageModel(profileImageData);
    newProfileImage.save();

    await UserModel.findOneAndUpdate(
      {_id: userId},
      {
        $set:
          avatarUploaded == true ? {haveAvatar: true} : {haveBanner: true},
      }
    );
    res.status(200).json({msg: "you'r image uploaded successfully"});
  } catch (error) {
    next(error);
  }
};


const loginUser = async (req, res, next) => {
  try {
    const {email, password} = req.body;

    let result = await UserModel.findUser_comparePassword(email, password);
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        data: {_id: result._id, email: result.email},
      },
      process.env.JWT_SECRET_PASS
    );

    const User = await UserModel.findOneAndUpdate(
      {email},
      {$set: {token}}
    );
    if (!User) {
      res.status(404).json({msg: `You'r email not found in our records`});
      return;
    }

    const data = {
      email: result.email,
      fname: result.fname,
      lname: result.lname,
      gender : result.gender,
      accountType: result.accountType,
      picture: {
        avatar: null,
        banner: null,
      },
    };

    if (User.haveAvatar) {
      const f1 = await userAvatarModel.findOne({
        userId: User._id.toString(),
        why: "profile-avatar",
      });

      if (f1?.filename) {
        data.picture.avatar = f1.filename;
      }
    }

    if (User.haveBanner) {
      const f2 = await userAvatarModel.findOne({
        userId: User._id.toString(),
        why: "profile-banner",
      });

      if (f2?.filename) {
        data.picture.banner = f2.filename;
      }
    }

    res.status(200).json({
      ...data,
      token,
      msg: "you have successfully logged in",
    });
  } catch (error) {
    res.status(404).json({msg: `You'r email not found in our records`});
    next(error);
  }
};

const GetProfileMeData = async (req, res, next) => {
  try {
    const User = await UserModel.findById(req.user.data._id);
    if (!User) {
      res.status(500).json({msg: `Something went wrong`});
      return;
    }

    const data = {
      email: User.email,
      fname: User.fname,
      lname: User.lname,
      gender : User.gender,
      accountType: User.accountType,
      picture: {
        avatar: null,
        banner: null,
      },
    };

    if (User.haveAvatar) {
      const f1 = await userAvatarModel.findOne({
        userId: User._id.toString(),
        why: "profile-avatar",
      });

      if (f1.filename) {
        data.picture.avatar = f1.filename;
      }
    }

    if (User.haveBanner) {
      const f2 = await userAvatarModel.findOne({
        userId: User._id.toString(),
        why: "profile-banner",
      });

      if (f2.filename) {
        data.picture.banner = f2.filename;
      }
    }

    res.status(200).json({
      ...data,
      msg: "Successfully founded you",
    });
  } catch (error) {
    console.log(error);
  }
};

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
    res.status(200).json({msg: "Exit Successfully"});
  } catch (error) {
    next(error);
  }
};

const uploadUserAvatar = async (req, res, next) => {
  try {
    const avatarUploaded =
      req.body.avatarUploaded === "true" || req.body.avatarUploaded === true
        ? true
        : false;

    const profileImageData = {
      userId: req.user?.data?._id,
      originalname: req.file?.originalname,
      mimetype: req.file.mimetype,
      filename: req.file.filename,
      whoUseIt: "user",
      why: avatarUploaded ? "profile-avatar" : "profile-banner",
    };

    const newProfileImage = new ImageModel(profileImageData);
    newProfileImage.save();

    await UserModel.findOneAndUpdate(
      {_id: req.user?.data?._id},
      {
        $set:
          avatarUploaded == true ? {haveAvatar: true} : {haveBanner: true},
      }
    );
    res.status(200).json({msg: "you'r image uploaded successfully"});
  } catch (error) {
    next(error);
  }
};


const updateOrRemoveUserProfileAvatar = async (req, res, next) => {
  try {
    const onlyRemove = req.body.onlyRemove === "true" ? true : false;
    console.log(req?.file)
    if (!onlyRemove && !req?.file?.filename) {
      res.status(400).json({msg: "Something went wrong please try again"});
      return
    }


    console.log(
      "update -->", onlyRemove, req?.file
    )


    const User = await UserModel.findById(req.user.data._id);
    const f1 = await userAvatarModel.findOne({
      userId: User._id.toString(),
      why: "profile-avatar",
    });

    const FileName = f1.filename;

    const currentDirectory = __dirname;
    const filePath = path.resolve(
      currentDirectory,
      "..",
      "..",
      "public",
      "uploads",
      FileName
    );

    if (fs.existsSync(filePath)) {
      // The file exists, so you can proceed with deleting it
      fs.unlink(filePath, (err) => {
        if (err) {
          res.status(500).json({msg: "Something went wrong"});
          return;
        }

        if (onlyRemove) {
          userAvatarModel
            .findOneAndDelete({
              userId: User._id.toString(),
              why: "profile-avatar",
            })
            .then(() => {
              UserModel.findByIdAndUpdate(User._id.toString(), {
                haveAvatar: false,
              }).then(() => {
                res
                  .status(200)
                  .json({msg: "Your avatar image removed successfully"});
              });
            });
        } else if (req?.file?.filename) {
          userAvatarModel
            .updateOne(
              {userId: User._id.toString(), why: "profile-avatar",},
              {
                $set: {
                  filename: req.file.filename,
                  originalname: req.file.originalname,
                },
              }
            )
            .then(() => {
              res
                .status(200)
                .json({msg: "Your avatar image updated successfully"});
            });
        }
      });
    } else {
      console.log("File not found");
      res.status(404).json({msg: "File not found"});

      return;
    }
  } catch (error) {
    next(error);
  }
};

const updateOrRemoveUserProfileBanner = async (req, res, next) => {
  try {
    const onlyRemove = req.body.onlyRemove === "true" ? true : false;
    console.log("banner remove ", onlyRemove, req.body.onlyRemove, req?.file);
    if (!onlyRemove && !req?.file?.filename) {
      res.status(400).json({msg: "Something went wrong please try again"});
    }

    const User = await UserModel.findById(req.user.data._id);

    const f1 = await userAvatarModel.findOne({
      userId: User._id.toString(),
      why: "profile-banner",
    });

    const FileName = f1.filename;

    const currentDirectory = __dirname;
    const filePath = path.resolve(
      currentDirectory,
      "..",
      "..",
      "public",
      "uploads",
      FileName
    );

    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({msg: "Something went wrong"});

          return;
        }

        console.log("File deleted successfully");

        if (onlyRemove) {
          userAvatarModel
            .findOneAndDelete({
              userId: User._id.toString(),
              why: "profile-banner",
            })
            .then(() => {
              UserModel.findByIdAndUpdate(User._id.toString(), {
                haveBanner: false,
              }).then(() => {
                res
                  .status(200)
                  .json({msg: "Your banner image removed successfully"});
              });
            });
        } else {
          userAvatarModel
            .updateOne(
              {userId: req.user.data._id, why: "profile-banner"},
              {
                $set: {
                  filename: req.file.filename,
                  originalname: req.file.originalname,
                },
              }
            )
            .then(() => {
              res
                .status(200)
                .json({msg: "Your banner image updated successfully"});
            });
        }
      });
    } else {
      console.log("File not found");
      res.status(404).json({msg: "File not found"});
      return;
    }
  } catch (error) {
    next(error);
  }
};

const updateUserProfileData = async (req, res, next) => {
  try {
    /*
     fname       !optional
     lname       !optional
     username    !required
     gender      !required
    */


    if (!req?.body?.username) {
      res.status(400).json({msg: 'Your request dont have any username please fill! '})
    }

    const userId = req?.user?.data?._id
    const {fname, lname, username, gender} = req.body;

    await UserModel.findByIdAndUpdate(userId, {$set: {fname, lname, email: username, gender}})

    res.status(200).json({msg: "Your profile successfully updated"})


  } catch (error) {
    next(error);
  }
};

const updateUserPassword = async (req, res, next) => {

  try {
    const userId = req.user.data._id
    const {password, passwordConfirmation} = req.body;

    if (password !== passwordConfirmation) {
      res.status(400).json({msg: 'Password and password confirmation are not equal '})
    }


    const result = await UserModel.userChangePasswordOperation(password)

    if (!result.password) {

      res.status(500).json({msg: 'Something went wrong please try again !'})


    } else {

      await UserModel.findByIdAndUpdate(userId.toString(), {$set: {password: result?.password}})
      res.status(200).json({msg: 'Your password successfully updated'})

    }


  } catch (error) {
    next(error);
  }
};

module.exports.SignupNewUser = SignupNewUser;
module.exports.uploadUserAvatarIntoSignup = uploadUserAvatarIntoSignup;
module.exports.LoginUser = loginUser;
module.exports.GetProfileMeData = GetProfileMeData;
module.exports.LogoutUser = logoutUser;
module.exports.uploadUserAvatar = uploadUserAvatar;
module.exports.updateOrRemoveUserProfileAvatar =
  updateOrRemoveUserProfileAvatar;
module.exports.updateOrRemoveUserProfileBanner =
  updateOrRemoveUserProfileBanner;
module.exports.updateUserProfileData = updateUserProfileData;
module.exports.updateUserPassword = updateUserPassword;
