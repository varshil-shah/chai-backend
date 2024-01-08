import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  // get title and description from req.body
  const { title, description } = req.body;

  // check if title and description are present
  if (!title || !description)
    throw new ApiError(400, "Title and Description are required");

  // get video and thumbnail path from req.files
  const videoPath = req.files?.videoFile[0]?.path;
  const thumbnailPath = req.files?.thumbnail[0]?.path;

  // check if video and thumbnail are present
  if (!videoPath || !thumbnailPath)
    throw new ApiError(400, "Video and Thumbnail are required");

  // upload video and thumbnail on cloudinary
  const video = await uploadOnCloudinary(videoPath);
  const thumbnail = await uploadOnCloudinary(thumbnailPath);

  // check if video and thumbnail are uploaded successfully
  if (!video || !thumbnail)
    throw new ApiError(500, "Error while uploading video or thumbnail");

  // create a new video document
  const newVideo = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    title,
    description,
    owner: req.user._id,
  });

  // return response
  return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
