const express = require('express');

const router = express.Router();

const isAuth = require("../helpers/isAuth");


const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post("/activateAccount", authController.activateAccount);
router.post("/googleSignin", authController.googleSignin);
router.post('/forgot-password', authController.forgotPassword);
router.get("/logout",isAuth, authController.logout);
router.post("/changePassword", isAuth, authController.changePassword);
router.get("/checkLogin", isAuth, authController.checkLogin);

// router.patch('/reset-password/:token', authController.resetPassword);

module.exports = router;