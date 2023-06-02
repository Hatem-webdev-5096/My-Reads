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
  bookShelves: {
    type: [
      {
        shelfName: String,
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
  }
});

const GoogleUser = mongoose.model("GoogleUser", UserSchema);

module.exports = GoogleUser;
