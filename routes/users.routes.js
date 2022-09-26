const express = require("express");
const router = express.Router();

const CommentModel = require("../models/Comment.model");
const PostModel = require("../models/Post.model");
const UserModel = require("../models/User.model");
const bcrypt = require("bcrypt");
const generateToken = require("../config/jwt.config");
const saltRounds = 10;

router.post("sign-up", async (req, res) => {
  const { password } = req.body;
  if (!password || !password.match()) {
    return res.status(400).json({ message: "Senha inválida!" });
  }

  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);
  const newUser = await UserModel.create({
    ...req.body,
    passwordHash: passwordHash,
  });
  delete newUser._doc.passwordHash;
  return res.status(201).json(newUser);
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Por favor, informe e-mail e senha!" });
    }

    const user = await UserModel.findOne({ email: email });

    if (await bcrypt.compare(password, user.passwordHash)) {
      delete user._doc.passwordHash;
      const token = generateToken(user);
      return res.status(200).json({ user: user, token: token });
    } else {
      return res.status(400).json({ message: "E-mail ou senha incorretos!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

// router.post("/create", async (req, res) => {
//   try {
//     const newUser = await UserModel.create({ ...req.body });

//     return res.status(201).json(newUser);
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json(error);
//   }
// });

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

router.put("/edit/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;

    const editedUser = await UserModel.findByIdAndUpdate(
      idUser,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json;
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete("/delete/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;

    const deletedUser = await UserModel.findByIdAndDelete(idUser);

    const deletedComments = await CommentModel.deleteMany({ author: idUser });

    const postsFromUser = await PostModel.find({ author: idUser });

    postsFromUser.forEach(async (post) => {
      post.comments.forEach(async (comment) => {
        await CommentModel.findByIdAndDelete(comment._id);
      });
    });

    const deletedPosts = await PostModel.deleteMany({ author: idUser });

    await UserModel.updateMany(
      {
        $or: [
          { following: { $in: [idUser] } },
          { followers: { $in: [idUser] } },
        ],
      },
      {
        $pull: {
          following: idUser,
          followers: idUser,
        },
      }
    );

    return res.status(200).json({
      deleteduser: deletedUser,
      postsFromUser: postsFromUser,
      commentsUser: deletedComments,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/follow/:idUserFollowing/:idUserFollowed", async (req, res) => {
  try {
    const { idUserFollowing, idUserFollowed } = req.params;

    //FAZER UM IF PARA NÃO DEIXAR O PRÓPRIO USUÁRIO SE SEGUIR

    const userFollowing = await UserModel.findByIdAndUpdate(
      idUserFollowing,
      {
        $addToSet: { following: idUserFollowed },
      },
      { new: true }
    );

    const userFollowed = await UserModel.findByIdAndUpdate(idUserFollowed, {
      $addToSet: { followers: idUserFollowing },
    });

    return res.status(200).json(userFollowing);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put(
  "/unfollow/:idUserUnfollowing/:idUserUnfollowed",
  async (req, res) => {
    try {
      const { idUserUnfollowing, idUserUnfollowed } = req.params;

      const userUnfollowing = await UserModel.findByIdAndUpdate(
        idUserUnfollowing,
        {
          $pull: { following: idUserUnfollowed },
        },
        {
          new: true,
        }
      );

      const userUnfollowed = await UserModel.findByIdAndUpdate(
        idUserUnfollowed,
        {
          $pull: { followers: idUserUnfollowing },
        }
      );

      return res.status(200).json(userUnfollowing);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

module.exports = router;
