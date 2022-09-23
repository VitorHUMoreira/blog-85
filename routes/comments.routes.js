const express = require("express");
const router = express.Router();

const UserModel = require("../models/User.model");
const PostModel = require("../models/Post.model");
const CommentModel = require("../models/Comment.model");

router.post("/create/:idPost/:idAuthor", async (req, res) => {
  try {
    const { idPost, idAuthor } = req.params;

    const newComment = await CommentModel.create({
      ...req.body,
      author: idAuthor,
      post: idPost,
    });

    await PostModel.findByIdAndUpdate(idPost, {
      $push: { comments: newComment._id },
    });

    return res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/edit/:idComment", async (req, res) => {
  try {
    const { idComment } = req.params;

    const editedComment = await CommentModel.findByIdAndUpdate(
      idComment,
      { ...req.body },
      { new: true }
    );

    return res.status(200).json(editedComment);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete("/delete/:idComment", async (req, res) => {
  try {
    const { idComment } = req.params;

    const deletedComment = await CommentModel.findByIdAndDelete(idComment);

    await PostModel.findByIdAndUpdate(
      deletedComment.post,
      {
        $pull: { comments: idComment },
      },
      { new: true }
    );

    return res.status(200).json(deletedComment);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

module.exports = router;
