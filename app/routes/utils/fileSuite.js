/**
 * File suite
 */

module.exports = function(gfs, eventEmitter){
    var gm = require('gm').subClass({imageMagick: true});
    var streamifier = require('streamifier');
    var mongoose = require("mongoose");
    var fileSuite = {};

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

        writeToDb(req, file, id, writeStream);
    };

    function writeToDb(req, file, id, writeStream){
        var IMAGE_SIZE = 800;
        var write = false;
        var buffer = file.buffer;

        if(fileIs('image', file)){
            req.mediaIds.push({media: id, mediaType: 'image'});

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
            req.mediaIds.push({media: id, mediaType: 'audio'});
            write = true
        }
        else if (fileIs('video', file)) {
            req.mediaIds.push({media: id, mediaType: 'video'});
            write = true
        }

        if(write){
            streamifier.createReadStream(buffer).pipe(writeStream);
        }
    }

    function fileIs(type, file){
        return (file.mimetype).indexOf(type) > -1
    }

    return fileSuite;
};