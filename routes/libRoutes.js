const express = require('express');

const router = express.Router();

const isAuth = require("../helpers/isAuth");
const libControllers = require("../controllers/libControllers");

router.post("/addBook", isAuth, libControllers.addBook);
router.post("/editShelves", isAuth, libControllers.editShelves);
router.post("/addNewShelf", isAuth, libControllers.addNewShelf);
router.post("/changeBookShelf", isAuth, libControllers.changeBookShelf);
router.post("/removeBookFromShelf", isAuth, libControllers.removeBookFromShelf);

module.exports = router;