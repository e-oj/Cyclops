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
    var gm = require('gm').subClass({imageMagick: true});
    var streamifier = require('streamifier');
    var mongoose = require("mongoose");
    var ffmpeg = require("fluent-ffmpeg");
    var fs = require("fs");
    var fileSuite = {};

    /**
     * This function creates a MongoDB id to be assigned to the
     * uploaded file, a writeStream that allows us to write files to
     * GridFS, calls writeToDB, and emits a savedFile event when the file
     * has finished uploading.
     *
     * @param req The request
     * @param file The file to upload.html
     */
    fileSuite.saveFile = function(req, file){
        //console.log("File ===> ", file);

        //id to be assigned to file in GridFS
        var id = mongoose.Types.ObjectId();
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
            console.log(file.filename + ' has been uploaded');
            eventEmitter.emit("savedFile");
        });

        //writes the file to GridFS
        writeToDb(req, file, id, writeStream);
    };

    /**
     * This function pipes (writes) the given file to the given writeStream.
     * It re-sizes non-gif images with a width greater than 800px before
     * piping them to the write stream. Videos, Audio and GIFs are piped
     * without any checks.
     *
     * TODO: Add video/audio compression
     *
     * @param req The request
     * @param file the file to upload.html
     * @param id the id assigned to the file
     * @param writeStream the write stream that handles the upload.html
     */
    function writeToDb(req, file, id, writeStream){
        //The maximum width for any image
        var IMAGE_SIZE = 800;

        var write = false;

        //the content of this file stored as binary data
        var buffer = file.buffer;

        if(fileIs('image', file)){

            var fileBuffer = gm(buffer, file.name);

            fileBuffer.size(function(err, size){
                if(err){
                    console.log(err);
                }

                //resize if width > 800 and image is not a gif
                else if(size.width > 800 && !fileIs("gif", file)){
                    fileBuffer = fileBuffer.resize(IMAGE_SIZE);

                    fileBuffer.size(function(err, newSize){
                        fileBuffer.stream().pipe(writeStream);

                        //save the mediaID
                        req.mediaIds.push({
                            media: id
                            , mediaType: 'image'
                            , dimension: {
                                width: newSize.width
                                , height: newSize.height
                            }
                        });
                    });
                }

                else{
                    fileBuffer.stream().pipe(writeStream);

                    //save the mediaID
                    req.mediaIds.push({
                        media: id
                        , mediaType: 'image'
                        , dimension: {
                            width: size.width
                            , height: size.height
                        }
                    });
                }

            });
            //}
            //else write = true;
        }
        else if (fileIs('audio', file)){
            //save the mediaID
            req.mediaIds.push({media: id, mediaType: 'audio'});
            write = true
        }
        else if (fileIs('video', file)) {
            var vidPath = "./uploads/" + file.name;

            //writes the file to the filesystem so we can convert it to mp4
            fs.writeFile(vidPath, buffer, function(err){
                if(err) console.log(err);

                var video = ffmpeg(vidPath);
                var mp4Path = "./uploads/" + id + ".mp4";

                //save the mediaID
                req.mediaIds.push({media: id, mediaType: 'video'});

                //Convert the video to mp4
                video.format("mp4")
                    .size("800x?")
                    .aspect("16:9")
                    .autopad("white")
                    .outputOptions("-preset faster")
                    .on("end", function(){
                        var mp4Stream = fs.createReadStream(mp4Path);

                        mp4Stream.on("end", function(){
                            fs.unlink(mp4Path, function(err){if(err) throw err});
                        });
                        mp4Stream.pipe(writeStream);

                        fs.unlink(vidPath, function(err){if(err)throw err});
                    })
                    .on("progress", function(progress){
                        console.log('Processing: ' + progress.percent + '% done')
                    })
                    .on("error", function(error){
                        console.log(error);
                    })
                .save(mp4Path);
            });
        }

        //pipes the buffer to the writeStream if write is true
        if(write){
            streamifier.createReadStream(buffer).pipe(writeStream);
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

    return fileSuite;
};