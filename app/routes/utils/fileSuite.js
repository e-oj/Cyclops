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
    var fileSuite = {};

    /**
     * This function creates a MongoDB id to be assigned to the
     * uploaded file, a writeStream that allows us to write files to
     * GridFS, calls writeToDB, and emits a savedFile event when the file
     * has finished uploading.
     *
     * @param req The request
     * @param file The file to upload
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
                , author : req.decoded._id
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
     * This function pipes the given file to the given writeStream.
     * It re-sizes non-gif images with a width greater than 800px before
     * piping them to the write stream. Videos, Audio and GIFs are piped
     * without any checks.
     *
     * TODO: Add video/audio compression
     *
     * @param req
     * @param file
     * @param id
     * @param writeStream
     */
    function writeToDb(req, file, id, writeStream){
        //The maximum width for any image
        var IMAGE_SIZE = 800;

        var write = false;

        //the content of this file stored as binary data
        var buffer = file.buffer;

        if(fileIs('image', file)){
            //save the mediaID
            req.mediaIds.push({media: id, mediaType: 'image'});

            //if the file is not a gif, resize if necessary then pipe
            if(!fileIs('gif', file)) {
                var fileBuffer = gm(buffer, file.name);

                fileBuffer.size(function(err, size){
                    if(err) console.log(err);

                    else if(size.width > 800){
                        fileBuffer.resize(IMAGE_SIZE).stream().pipe(writeStream);
                    }

                    else{
                        fileBuffer.stream().pipe(writeStream);
                    }
                });
            }
            else write = true;
        }
        else if (fileIs('audio', file)){
            //save the mediaID
            req.mediaIds.push({media: id, mediaType: 'audio'});
            write = true
        }
        else if (fileIs('video', file)) {
            //save the mediaID
            req.mediaIds.push({media: id, mediaType: 'video'});
            write = true
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