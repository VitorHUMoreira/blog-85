const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    content: { type: String, required: true, minLength: 1, maxLength: 240 },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);

const CommentModel = mongoose.model("Comment", CommentSchema);

module.exports = CommentModel;
