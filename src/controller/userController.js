const UserModel = require("../db/userSchema");
const jwt = require("jsonwebtoken");

const createNewUser = async (req, res, next) => {
  try {
    console.log("new user body >>>", req.body);

    const userName =
      req.body.firstName.split(" ").join("_") +
      "_" +
      req.body.lastName.split(" ").join("_");

    const data = {
      fname: req.body.firstName,
      lname: req.body.lastName,
      userName,
      password: req.body.password,
      email: req.body.email,
      gender: req.body.gender || "male",
    };

    const newUser = new UserModel(data);
    const saved = await newUser.save();

    const person = saved;

    delete person._id;
    delete person.password;

    console.log("person >>>", person);

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

    console.log("login >>>", email, password);

    let result = await UserModel.findUser_comparePassword(email, password);
    console.log("result compare password >>>", result);
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        data: {_id:result._id ,email:result.email },
      },
      process.env.JWT_SECRET_PASS
    );
    console.log("token >>>", token);

    const User = await UserModel.findOneAndUpdate(
      { email },
      { $set: { token } }
    );
    if (!User) {
      console.log("not found");
      res.status(404).json({ msg: `You'r email not found in our database` });
    }

    console.log("User", User);

    const data = {
      email: result.email,
      userName: result.userName,
      fname: result.fname,
      lname: result.lname,
      gender: result.gender,
    };

    res
      .status(200)
      .json({
        msg: "you have successfully logged in",
        data: { ...data, token },
      });
  } catch (error) {
    res.status(404).json({ msg: `You'r email not found in our database` });
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    console.log("logout", req.body.email);
    await UserModel.findOneAndUpdate(
      {
        email: req.body.email,
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

module.exports.CreateNewUser = createNewUser;
module.exports.LoginUser = loginUser;
module.exports.LogoutUser = logoutUser;
