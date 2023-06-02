const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    default: 0,
  },
  bookShelves: {
    type: [
      {
        name: String,
        books: [String],
      },
    ],
    required: true,
    default: [
      { name: "Favorites", books: [] },
      { name: "currently reading", books: [] },
      { name: "wishlist", books: [] },
      { name: "have read", books: [] },
    ],
  },
  accountActivated: {
    type: Boolean,
    required: true,
    default: false
  },
  accountActivationToken: {
    type: String,
    required: true
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
