import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //cloudinary url
      required: true,
    },
    thumbnail: {
      type: String, //cloudinary url
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);

// filter out unpublished videos
videoSchema.pre("find", function (next) {
  this.find({ isPublished: true });
  next();
});

// populate the owner field
videoSchema.pre("find", function (next) {
  this.populate({
    path: "owner",
    select: "-password -__v -createdAt -updatedAt -refreshToken",
  });
  next();
});

export const Video = mongoose.model("Video", videoSchema);
