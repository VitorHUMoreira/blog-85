const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dbConnection = require("./config/db.config");
dbConnection();

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.REACT_APP_URI }));

const UsersRoute = require("./routes/users.routes");
app.use("/users", UsersRoute);

const PostsRoute = require("./routes/posts.routes");
app.use("/posts", PostsRoute);

const CommentsRoute = require("./routes/comments.routes");
app.use("/comments", CommentsRoute);

app.listen(+process.env.PORT, () => {
  console.log("Servidor funcionando na porta:", process.env.PORT);
});
