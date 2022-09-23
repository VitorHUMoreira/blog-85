const express = require("express");
const CommentModel = require("../models/Comment.model");
const PostModel = require("../models/Post.model");
const router = express.Router();

const UserModel = require("../models/User.model");

router.post("/create", async (req, res) => {
  try {
    const newUser = await UserModel.create({ ...req.body });

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/all", async (req, res) => {
  try {
    const allUsers = await UserModel.find();

    return res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id).populate("posts");

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await UserModel.findByIdAndDelete(id);

    const deletedComents = await CommentModel.deleteMany({ author: id });

    const postsFromUser = await PostModel.find({ author: id });

    postsFromUser.forEach(async (post) => {
      post.comments.forEach(async (comment) => {
        await CommentModel.findByIdAndDelete(comment._id);
      });
    });

    const deletedPosts = await PostModel.deleteMany({ author: id });

    return res.status(200).json({
      deletedUser: deletedUser,
      deletedPosts: deletedPosts,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

module.exports = router;