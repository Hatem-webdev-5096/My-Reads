const jwt = require("jsonwebtoken");
require("dotenv").config();

const isAuth = async(req,res,next)=> {
    const token = req.cookies.jwt;

    const decodedToken = jwt.decode(token,process.env.JWT_SECRET);
    if (decodedToken) {
        req.userId = decodedToken.userId;
        next();
    } else {
        const error = new Error("UnAuthorized attempt, please sign in");
        error.message= "UnAuthorized attempt, please sign in";
        error.status= 403;
        next(error);
    }
}


module.exports = isAuth;