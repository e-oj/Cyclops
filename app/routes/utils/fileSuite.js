var gm = require('gm').subClass({imageMagick: true});
var streamifier = require('streamifier');
var mongoose = require("mongoose");
var ffmpeg = require("fluent-ffmpeg");
var fs = require("fs");
var fileSuite = {};
var UPLOADS_DIR = "./uploads/";

/**
 * This module contains functions that enables media
 * uploads.
 *
 * @param gfs GridFS for storing the files
 * @param eventEmitter eventEmitter signals when a file is done uploading
 *
 * @returns An object containing the saveFile function.
 */
module.exports = function(gfs, eventEmitter){
    /**
     * This function creates a MongoDB id to be assigned to the
     * uploaded file, a writeStream that allows us to write files to
     * GridFS, calls writeToDB, and emits a savedFile event when the file
     * has finished uploading.
     *
     * @param req The request
     * @param res The response
     * @param file The file to upload
     */
    fileSuite.saveFile = function(req, res, file){
        //console.log("File ===> ", file);

        //id to be assigned to file in GridFS
        var id = mongoose.Types.ObjectId();
        var FILE_PATH = UPLOADS_DIR + file.name;

        var writeStream = gfs.createWriteStream({
            _id: id
            , filename: file.name
            , metadata: {
                mimeType:file.mimetype
                , date: Date.now()
                , author : req.decoded? req.decoded._id : req.body.username
            }
        });

        //when the file has been written to GridFS
        writeStream.on('close', function (file) {
            fs.unlink(FILE_PATH, function(err){if(err) console.log(err)});

            console.log(file.filename + ' has been uploaded');
            eventEmitter.emit("savedFile");
        });

        //writes the file to GridFS
        writeToDb(req, res, file, id, writeStream);
    };

    /**
     * This function pipes (writes) the given file to the given writeStream.
     * It re-sizes non-gif images with a width greater than 800px before
     * piping them to the write stream. Videos, Audio and GIFs are piped
     * without any checks.
     *
     * @param req The request
     * @param res The response
     * @param file the file to upload
     * @param id the id assigned to the file
     * @param writeStream the write stream that handles the upload
     */
    function writeToDb(req, res, file, id, writeStream){
        //The maximum width for any image
        var IMAGE_SIZE = 800;
        var FILE_PATH = "./uploads/" + file.name;
        var readStream = fs.createReadStream(FILE_PATH);

        if(fileIs('image', file)){
            var gmImage = gm(FILE_PATH);

            gmImage.size(function(err, size){
                if(err){
                    sendErrResponse(res);
                }
                else if(size.width > 800 && !fileIs("gif", file)){
                    gmImage = gmImage.resize(IMAGE_SIZE);

                    gmImage.size(function(err, newSize){
                        if(err){
                            sendErrResponse(res);
                        }
                        else {
                            gmImage.stream("png").pipe(writeStream);

                            //save the mediaID
                            req.mediaIds.push(getFileObject("image", id, newSize.width, newSize.height));
                        }
                    });
                }
                else{
                    gmImage.stream().pipe(writeStream);

                    //save the mediaID
                    req.mediaIds.push(getFileObject("image", id, size.width, size.height));
                }

            });
        }
        else if (fileIs('audio', file)){
            //save the mediaID
            req.mediaIds.push(getFileObject("audio", id));
            readStream.pipe(writeStream);
        }
        else if (fileIs('video', file)) {
            var video = ffmpeg(readStream);
            var mp4Path = "./uploads/" + id + ".mp4";

            //save the mediaID
            req.mediaIds.push(getFileObject("video", id));

            //Convert the video to mp4

            video.format("mp4")
                .size("800x450")
                .aspect("16:9")
                .autopad("black")
                .outputOptions("-preset veryfast")
                .on("end", function(){
                    //console.log("Done encoding");
                    var mp4Stream = fs.createReadStream(mp4Path);

                    mp4Stream.on("end", function(){
                        fs.unlink(mp4Path, function(err){if(err) console.log(err)});
                    });
                    mp4Stream.pipe(writeStream);
                })
                .on("error", function(){
                    fs.unlink(FILE_PATH, function(){
                        fs.unlink(mp4Path, function(){
                            sendErrResponse(res);
                        });
                    });
                })
            .save(mp4Path);
        }
    }

    /**
     * Checks if a file is of a given type
     *
     * @param type The type to check for
     * @param file the file to be checked
     *
     * @returns true if the file is of that type/false otherwise
     */
    function fileIs(type, file){
        return (file.mimetype).indexOf(type) > -1
    }

    function getFileObject(fileType, id, width, height){
        if(!fileType) throw errIsRequired("fileType argument", "getFileObject");
        if(!id) throw errIsRequired("id argument", "getFileObject");
        if((width && !height) || height && !width) throw errIsRequired("the width, and the height", "getFileObject");

        fileType = fileType.toLowerCase();

        var file = {};

        file.media = id;
        file.mediaType = fileType;

        if(fileType == "image" && width && height){
            file.dimension = {
                width: width
                , height: height
            }
        }

        return file;
    }

    function errIsRequired(requiredItem, requiredBy){
        return new Error(requiredItem + " is required " + requiredBy ? "by" + requiredBy : "function");
    }

    function sendErrResponse(res){
        res.status(400);
        res.json({
            message: "oops!!! something went wrong"
        });
    }

    return fileSuite;
};