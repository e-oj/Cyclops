/**
 * Contains constant attributes that are used throughout
 * the program. The attributes are here so that they can be
 * easily changed if need be.
 * @type {{port: (*|number), database: string, secret: string}}
 */

module.exports = {
    port: process.env.PORT || 8080, //server runs on this port
    database: 'mongodb://127.0.0.1:27017/userDB', //database url
    secret: 'blah' //secret for signing tokens
};