const User = require("../models/user");
const GoogleUser = require("../models/googleUsers");
const jwt = require("jsonwebtoken");
const bCrypt = require("bcrypt");
const crypto = require("crypto");

const sendEmail = require("../helpers/sendEmail");

exports.signup = async (req, res, next) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      const error = new Error("Email already exists");
      error.message = "Email already exists";
      error.status = 400;
      throw error;
    } else {
      const hashedPassword = await bCrypt.hash(password.trim(), 10);
      let activationToken =
        crypto.randomBytes(32).toString("hex") + Date.now().toString();

      const newUser = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        accountActivationToken: activationToken,
      });
      const savedUser = await newUser.save();

      const activationLink = `https://my-reads-react.onrender.com/auth/confirm-email/${activationToken}`;

      await sendEmail.sendActivationEmail(savedUser, activationLink);

      res
        .status(200)
        .json({ message: "Check you email inbox to activate your account." });
    }
  } catch (error) {
    next(error);
  }
};

exports.activateAccount = async (req, res, next) => {
  let activationToken = req.body.activationToken;
  try {
    const user = await User.findOne({
      accountActivationToken: activationToken,
    });
    if (!user) {
      const error = new Error("Activation failed please signup again");
      error.message = "Activation failed please signup again";
      error.status = 400;
      throw error;
    } else {
      user.accountActivated = true;
    }
    await user.save();
    res.status(200).json({ message: "Account activated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.googleSignin = async (req, res, next) => {
  const token = jwt.decode(req.body.token);

  try {
    const user = await GoogleUser.findOne({ email: token.email });
    if (!user) {
      const newUser = new GoogleUser({
        firstName: token.given_name,
        lastName: token.family_name,
        email: token.email,
      });
      const savedUser = await newUser.save();
      const clientToken = jwt.sign(
        {
          userId: savedUser._id,
        },
        process.env.JWT_SECRET,
        {
          header: {
            alg: "HS512",
            typ: "JWT",
          },
        }
      );

      res
        .status(200)
        .cookie("jwt", clientToken, { httpOnly: true, sameSite:"none" })
        .json({
          message: "user created successfully",
          userData: {
            _id: savedUser._id,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            email: savedUser.email,
            shelves: savedUser.bookShelves,
          },
        });
    } else {
      const clientToken = jwt.sign(
        {
          userId: user._id,
        },
        process.env.JWT_SECRET,
        {
          header: {
            alg: "HS512",
            typ: "JWT",
          },
        }
      );
      res
        .status(200)
        .cookie("jwt", clientToken, { httpOnly: true })
        .json({
          message: "Signed in succesfully",
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            shelves: user.bookShelves,
          },
        });
    }
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password.trim();
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    } else {
      const validPassword = await bCrypt.compare(password, user.password);
      if (!validPassword) {
        const error = new Error("Invalid password");
        error.message = "Invalid password";
        error.status = 403;
        throw error;
      } else {
        if (!user.accountActivated) {
          const activationLink = `https://my-reads-react.onrender.com/auth/confirm-email/${user.accountActivationToken}`;
          await sendEmail.resendActivationEmail(user, activationLink);
          const error = new Error(
            "Account is not activated, please check your email"
          );
          error.message = "Account is not activated, please check your email";
          error.status = 403;
          throw error;
        } else if (user.accountActivated) {
          const token = jwt.sign(
            {
              userId: user._id,
            },
            process.env.JWT_SECRET,
            {
              header: {
                alg: "HS512",
                typ: "JWT",
              },
            }
          );
          res
            .status(200)
            .cookie("jwt", token, { httpOnly: true, sameSite:"none" })
            .json({
              userData: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                shelves: user.bookShelves,
              },
            });
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error(
        "Email provided is not associated with any account, please sign up"
      );
      error.status = 404;
      error.message =
        "Email provided is not associated with any account, please sign up";
      throw error;
    }
    const newPassword = Math.random().toString(36).substring(2, 12);
    const newHashedPassword = await bCrypt.hash(newPassword, 16);
    user.password = newHashedPassword;
    await user.save();
    await sendEmail.sendResetPasswordEmail(user, newPassword);
    res.status(200).json({ message: "retrieval email sent to you." });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res
      .cookie("jwt", "", { httpOnly: true, expires: new Date(0) })
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};


exports.changePassword = async(req,res,next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("user not found.");
      error.message("Can't change password, you are signed in using Google.");
      error.status=404;
      throw error;
    } 
     const validPassword = await bCrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      const error = new Error("The password you entered is incorrect.");
      error.message = ("The password you entered is incorrect.");
      error.status=403;
      throw error;
    }
    const hashedNewPassword = await bCrypt.hash(req.body.newPassword, 16);
    user.password = hashedNewPassword;
    await user.save();
    res.status(200).json({message:"Password updated succesfully"});
    
  } catch (error) {
    next(error);
  }
}

exports.checkLogin = async(req,res,next) => {
  const userId = req.userId;
  try {
    let user = await User.findById(userId);
    if (!user) {
      user = await GoogleUser.findById(userId);
    }
    if (!user) {
      const error = new Error("User not found please sign up");
      error.message = "User not found, please sign up.";
      error.status = 404;
      throw error;
    }
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        header: {
          alg: "HS512",
          typ: "JWT",
        },
      }
    );
    res
      .status(200)
      .cookie("jwt", token, { httpOnly: true })
      .json({
        userData: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          shelves: user.bookShelves,
        },
      });
    
  } catch (error) {
    next(error);``
  }
}