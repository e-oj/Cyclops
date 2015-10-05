/**
 * This Router finds media on the database by
 * id
 *
 * ============================================
 * DEPENDENCY INJECTIONS
 * ============================================
 * @param express ------ExpressJS
 * @param mediaSuite ---mediaSuite
 * @param tkRouter -----Token router
 * ============================================
 * @returns mediaRouter
 */

module.exports = function(express, mediaSuite, tkRouter){
    mediaRouter = express.Router();

    //mediaRouter.use(tkRouter);

    mediaRouter.get('/:id', mediaSuite.getMedia);

    return mediaRouter;
};