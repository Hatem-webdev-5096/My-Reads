const User = require("../models/user");
const GoogleUser = require("../models/googleUsers");

exports.addBook = async (req, res, next) => {
  const userId = req.userId;
  const targetShelf = req.body.shelfName;
  const bookId = req.body.bookId;

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

    const bookShelfIndex = user.bookShelves.findIndex(
      (shelf) => shelf.name.toString() === targetShelf.toString()
    );

    const bookIndex = user.bookShelves[bookShelfIndex].books.findIndex(
      (b) => b === bookId
    );

    if (bookIndex > -1) {
      res
        .status(400)
        .json({ message: "Book already exists in the target shelf." });
    }

    user.bookShelves[bookShelfIndex].books.push(bookId);
    const updatedUser = await user.save();
    res.status(200).json({
      message: `Book added to ${targetShelf} succesfully`,
      updatedShelves: updatedUser.bookShelves,
    });
  } catch (error) {
    next(error);
  }
};

exports.editShelves = async (req, res, next) => {
  const userId = req.userId;
  const action = req.body.action;
  const shelfName = req.body.shelfName;
  const userInput = req.body.userInput;
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
    const shelfIndex = user.bookShelves.findIndex(
      (shelf) => shelf.name === shelfName
    );

    if (action === "delete") {
      user.bookShelves.splice(shelfIndex, 1);
      const updatedUser = await user.save();
      res.status(200).json({
        message: `Shelf (${shelfName}) Deleted Succesfully`,
        updatedShelves: updatedUser.bookShelves,
      });
    }
    if (action === "editName") {
      user.bookShelves[shelfIndex].name = userInput;
      const updatedUser = await user.save();
      res.status(200).json({
        message: "Shelf name updated",
        updatedShelves: updatedUser.bookShelves,
      });
    }

    if (action === "clear") {
      user.bookShelves[shelfIndex].books = [];
      const updatedUser = await user.save();
      res.status(200).json({
        message: `Shelf (${shelfName}) cleared`,
        updatedShelves: updatedUser.bookShelves,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.addNewShelf = async (req, res, next) => {
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
    const shelfIndex = user.bookShelves.findIndex(
      (shelf) => shelf.name === req.body.shelfName
    );

    if (shelfIndex > -1) {
      const error = new Error("shelf already exists");
      error.message = "Shelf already exists";
      error.status = 403;
      throw error;
    }

    user.bookShelves.push({ name: req.body.shelfName, books: [] });
    const updatedUser = await user.save();
    res.status(200).json({
      message: `Added new shelf: (${req.body.shelfName})`,
      updatedShelves: updatedUser.bookShelves,
    });
  } catch (error) {
    next(error);
  }
};

exports.changeBookShelf = async (req, res, next) => {
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
    const targetShelfIndex = user.bookShelves.findIndex(
      (shelf) => shelf.name === req.body.targetShelf
    );

    const bookIndexTargetShelf = user.bookShelves[
      targetShelfIndex
    ].books.findIndex((book) => {
      return book === req.body.bookId;
    });

    if (bookIndexTargetShelf !== -1) {
      const error = new Error("Book already in target shelf");
      error.status = 404;
      error.message = "Book is already in target shelf.";
      throw error;
    }

    const oldShelfIndex = user.bookShelves.findIndex(
      (shelf) => shelf.name === req.body.oldShelf
    );

    const bookIndex = user.bookShelves[oldShelfIndex].books.findIndex(
      (book) => {
        return book === req.body.bookId;
      }
    );

    user.bookShelves[oldShelfIndex].books.splice(bookIndex, 1);

    user.bookShelves[targetShelfIndex].books.push(req.body.bookId);
    updatedUser = await user.save();

    res.status(200).json({
      message: `Book moved to shelf: (${req.body.targetShelf})`,
      updatedShelves: updatedUser.bookShelves,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeBookFromShelf = async (req, res, next) => {
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
    const targetShelfIndex = user.bookShelves.findIndex(
      (shelf) => shelf.name === req.body.bookShelf
    );

    const bookIndex = user.bookShelves[targetShelfIndex].books.findIndex(
      (book) => {
        return book === req.body.bookId;
      }
    );

    if (bookIndex === -1) {
      const error = new Error("Book not found in target shelf");
      error.status = 404;
      error.message = "Book not found in target shelf.";
      throw error;
    }
    console.log(user.bookShelves[targetShelfIndex]);
    user.bookShelves[targetShelfIndex].books.splice(bookIndex, 1);
    console.log(user.bookShelves[targetShelfIndex]);
    const updatedUser = await user.save();
    res.status(200).json({message: "Book removed from shelf", updatedShelves: updatedUser.bookShelves})
  } catch (error) {
    next(error);
  }
};
