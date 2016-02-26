/**
 * This module contains functions for saving and retrieving
 * media.
 *
 * TODO: Get head out of ass and move the functions into separate files
 *
 * @param gfs GridFS
 * @param eventEmitter eventEmitter module to signal complete upload
 *
 * @returns an object containing the saveMedia and getMedia functions
 */
module.exports = function(gfs, eventEmitter){
    var mediaSuite = {};
    var fileSuite = require("../utils/fileSuite")(gfs, eventEmitter);

    /**
     * This function is responsible for saving media files
     * to GFS. It filters out files with unsupported formats
     * (non image/video/audio files) and doesn't moves on to the
     * next middleware/route until all files are done uploading
     * and the doneWithUpload event fires.
     *
     * @param req The request
     * @param res The response
     * @param next move to the next route/middleware
     */
    mediaSuite.saveMedia = function(req, res,next){

        /**
         * Media can only be uploaded via POST/PUT requests
         */
        if(req.method == 'POST' || req.method == 'PUT'){

            if (req.files) {

                //arrays for placing file ids based on their type
                req.mediaIds = [];

                var files = req.files['file'];
                var index = 0;
                var validTypes = ["image", "video", "audio"];
                var MAX_FILE_SIZE = 1500000000;

                var isValidFile = function(file){
                    return validTypes.indexOf(file.mimetype.split("/")[0]) > -1 && file.size <= MAX_FILE_SIZE;
                };

                //if there's a files array and it's not empty, proceed
                if(files && files.length) {
                    var validFiles = [];

                    files.forEach(function(file){
                        if(isValidFile(file)) validFiles.push(file);
                    });

                    if(validFiles.length) {
                        req.files.file = validFiles;

                        validFiles.forEach(function (file) {
                            fileSuite.saveFile(req, res, file);
                        });
                    } else{
                        console.log("File(s) too large");
                        res.status(406);
                        res.json({
                            success: false
                            , message: "File(s) too large"
                        });
                    }

                    /**
                     * Checks if all the files are done uploading.
                     * For every file that completely uploads, it increments index and
                     * when all the files are done uploading, i.e when index == index of
                     * the last file in the array, it emits "doneWithUpload" which triggers
                     * the next function and exits the middleware.
                     */
                    var checkDone = function(){
                        if(index < validFiles.length) {
                            if(index == validFiles.length - 1){
                                eventEmitter.emit("doneWithUpload");
                            }
                            index++;
                        }
                    };

                    //calls checkDone every time a file uploads successfully.
                    eventEmitter.on("savedFile", checkDone);

                    /**
                     * when all the files are done uploading, log a message
                     * to the console and detach the "savedFile listener"
                     */
                    eventEmitter.on("doneWithUpload", function(){
                        console.log("All files have been Uploaded");
                        eventEmitter.removeAllListeners("savedFile");
                    });
                    eventEmitter.on("doneWithUpload", next);
                } else next();
            } else next();
        } else next();
    };

    /**
     * This function handles media retrieval. It sends the whole
     * file if no range is specified. A 404 is sent if the file is not
     * found.
     *
     * @param req The request
     * @param res The response
     */
    mediaSuite.loadMedia = function(req, res){

        //searches the database for the requested media.
        gfs.findOne({_id: req.params.id}, function(err, file){
            if(err) throw err;

            //if the file is not found, send a 404
            else if(!file){
                res.status(404);
                res.send('file not found');
            }

            else {
                var readStream;

                //if a range is specified
                if(req.headers.range) {
                    var range = req.headers.range;

                    //parse the range header to get the requested range.
                    var parts = range.replace(/bytes=/, "").split("-");
                    var partialStart = parts[0];//the start of the range
                    var partialEnd = parts[1];//end of the range

                    var length = file.length;

                    //parse start and end from string to number
                    var start = parseInt(partialStart, 10);
                    var end = partialEnd ? parseInt(partialEnd, 10) : length - 1;

                    //206 is the status for partial response
                    res.status(206);

                    //set the appropriate headers for media streaming
                    res.set({
                        'Content-Type': file.metadata.mimeType
                        , 'Content-Length': (end-start)+1
                        , 'Accept-Ranges': 'bytes'
                        , 'Transfer-Encoding': 'chunked'
                        , 'Content-Range': "bytes " + start + "-" + end + "/" + (length)
                    });

                    //create the read stream
                    readStream = gfs.createReadStream({
                        _id: req.params.id
                        , range: {
                            startPos: start,
                            endPos: end
                        }
                    });

                    //pipe the stream to the response
                    readStream.pipe(res);
                }

                else{
                    //set the appropriate headers for media streaming
                    res.set({
                        'Content-Type': file.metadata.mimeType
                    });

                    //create the read stream
                    readStream = gfs.createReadStream({
                        _id: req.params.id
                    });

                    //pipe the stream to the response
                    readStream.pipe(res);
                }
            }
        });
    };

    /**
     * Checks if the specified media exists.
     *
     * @param id the id of the media to check for
     * @param callback function to pass the result to
     */
    mediaSuite.mediaExists = function(id, callback){
        gfs.findOne({_id: id}, function(err, found){
            if(err) throw err;

            process.nextTick(function(){callback(found ? true : false)});
        });
    };

    /**
     * Deletes the specified media from the database
     *
     * @param id the id of the media to be deleted
     */
    mediaSuite.removeMedia = function(id){
        gfs.remove({_id: id}, function(err){
            if(err) throw err;

            else console.log('Media with id ' + id +' has been Removed');
        });
    };

    return mediaSuite;
};