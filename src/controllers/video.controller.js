import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

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

  // check if videoId is present
  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  // check if videoId is valid
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  // get video based on videoId
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "No video found with this Id");
  }

  // return response
  return res.status(200).json(new ApiResponse(200, video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  const thumbnail = req.file?.path;

  // check if videoId is present
  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  // check if videoId is valid
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  // check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "No video found with this Id");
  }

  // check if user is owner of video
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this video");
  }

  const updateVideo = {
    title: title || video.title,
    description: description || video.description,
  };

  // check if new thumbnail is present
  if (thumbnail) {
    // upload new thumbnail on cloudinary
    const newThumbnail = await uploadOnCloudinary(thumbnail);
    if (!newThumbnail) {
      throw new ApiError(500, "Error while uploading thumbnail");
    }

    if (newThumbnail) {
      // delete old thumbnail from cloudinary
      const fileToDelete = video.thumbnail.split(".").at(2).split("/").at(-1);
      console.log(fileToDelete);
      await deleteFromCloudinary(fileToDelete);
    }

    // update thumbnail url
    updateVideo.thumbnail = newThumbnail.url;
  }

  // update video
  const updatedVideo = await Video.findByIdAndUpdate(videoId, updateVideo, {
    new: true,
  });

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // check if videoId is present
  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  // check if videoId is valid
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  // check if video exists
  const video = await Video.findById(videoId);
  console.log(video);
  if (!video) {
    throw new ApiError(404, "No video found with this Id");
  }

  // check if user is owner of video
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this video");
  }

  // delete video and thumbnail from cloudinary
  const fileToDelete = video.videoFile.split(".").at(2).split("/").at(-1);
  await deleteFromCloudinary(fileToDelete);

  const thumbnailToDelete = video.thumbnail.split(".").at(2).split("/").at(-1);
  await deleteFromCloudinary(thumbnailToDelete);

  // delete video from db
  await Video.findByIdAndDelete(videoId);

  // return response
  return res.status(204).json({
    status: "success",
    message: "Video deleted successfully",
  });
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
