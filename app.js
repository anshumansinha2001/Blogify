require("dotenv").config();

const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const userRoute = require("./routes/user-router");
const blogRoute = require("./routes/blog-router");
const {
  checkForAutheticationCookie,
} = require("./middlewares/auth-middleware");

const Blog = require("./models/blog-model");

const app = express();
const PORT = process.env.PORT || 8000;

// DB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.error("Failed to connect to DB! \n", error.message);
  });

// EJS Config
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAutheticationCookie("token"));
app.use(express.static(path.resolve("./public"))); //-> it will serve the images statically

app.get("/", async (req, res) => {
  try {
    const allBlogs = await Blog.find({});
    res.render("home", {
      user: req.user,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () =>
  console.log(`App listining at http://localhost:${PORT}`)
);
