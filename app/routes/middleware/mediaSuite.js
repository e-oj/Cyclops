module.exports = function(mongoose, fs, gfs){
    var gm = require('gm').subClass({imageMagick: true});
    var mediaSuite = {};

    mediaSuite.saveMedia = function(req, res,next){
        if(req.method == 'POST' || req.method == 'PUT'){
            if (req.files) {

                //arrays for placing file ids based on their type
                req.mediaIds = [];

                var files = req.files['file'];
                //console.log(files);

                if(files) {
                    for (var i = 0; i < files.length; i++) {
                        //id to be assigned to file in GridFS
                        var id = mongoose.Types.ObjectId();
                        var buffer = files[i].buffer;

                        if((files[i].mimetype).indexOf('image') > -1) req.mediaIds.push({media: id, mediaType: 'image'});
                        else if((files[i].mimetype).indexOf('audio') > -1) req.mediaIds.push({media: id, mediaType: 'audio'});
                        else if((files[i].mimetype).indexOf('video') > -1) req.mediaIds.push({media: id, mediaType: 'video'});

                        var writeStream = gfs.createWriteStream({
                            _id: id
                            , filename: files[i].name
                            , metadata: {mimeType:files[i].mimetype}
                        });

                        //when the file has been written to GridFS
                        writeStream.on('close', function (file) {
                            console.log(file.filename + ' has been uploaded');
                        });

                        gm(buffer, files[i].name)
                            .resize(500)
                            .stream()
                            .pipe(writeStream);
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

            else if(found) return true;

            else return false;
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