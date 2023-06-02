const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

const corsOptions = {
  origin:"https://my-reads-de613.web.app",
  optionsSuccessStatus: 200,
  methods: 'GET,POST,PUT,PATCH,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'] // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.options(cors(corsOptions));
 
app.use(cookieParser());

app.use(cors(corsOptions));
app.use(bodyParser.json());

const authRoutes = require("./routes/authRoutes");
const libRoutes = require("./routes/libRoutes");

app.use("/auth", authRoutes);
app.use("/library", libRoutes);
app.get("/healthCheck", (req,res,next) => {
  res.status(200).json({message:"server running"})
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const errorMessage = err.message;
  console.log(err);
  res.status(status).json({ message: err.message});
  next();
});

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@myreadscluster.ascevxk.mongodb.net/MyReads?retryWrites=true&w=majority`, 
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  );


  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error: "));
  db.once("open", function () {
    console.log("Database connected successfully");
  });  


app.listen(process.env.PORT || 8000, () => {
    console.log(`server running on port ${process.env.PORT || 8000}`);
});