module.exports = function(gfs){
    var mediaSuite = {};
    var fileSuite = require("../utils/fileSuite")(gfs);

    mediaSuite.saveMedia = function(req, res,next){
        if(req.method == 'POST' || req.method == 'PUT'){
            if (req.files) {

                //arrays for placing file ids based on their type
                req.mediaIds = [];

                var files = req.files['file'];
                var validTypes = ["image", "video", "audio"];
                //console.log(files);

                if(files) {
                    for (var i = 0; i < files.length; i++) {
                        if(validTypes.indexOf(files[i].mimetype.split("/")[0]) > -1){
                            fileSuite.saveFile(req, files[i]);
                        }
                    }
                }
            }
        }

        next();
    };
    

    mediaSuite.getMedia = function(req, res){
        gfs.findOne({_id: req.params.id}, function(err, file){
            if(err) throw err;
            else if(!file){
                res.status(404);
                res.send('file not found');
            }
            else {
                var readStream;

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
                        //, 'Content-Length': (end-start)+1
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

    mediaSuite.mediaExists = function(id){
        gfs.findOne({_id: id}, function(err, found){
            if(err) throw err;

            return (found)? true : false;
        });
    };

    mediaSuite.removeMedia = function(id){
        gfs.remove({_id: id}, function(err){
            if(err) throw err;

            else console.log('Media with id ' + id +' has been Removed');
        });
    };

    return mediaSuite;
};