const express = require("express");
const router = express.Router();
const { getSettings, getPublishedArticles, getArticleWithComments } = require("./dbQueries");
const errorHandler = require("../middleware");
/**
 * @desc Render reader home page
 */
router.get("/home", (req, res, next) => {
    // Promise to retrieve settings and published articles
    Promise.all([getSettings(), getPublishedArticles()])
    .then(([settings, publishedArticles]) => {
        // Render the reader's home page with settings and articles
        res.render("reader-home.ejs", {
            settings: settings,
            publishedArticles: publishedArticles,
        });
    })
    .catch(next); // Pass any errors to the error handler middleware
});

/**
 * @desc Increments article views and redirects to the article page
 */
router.get("/views/:id", (req, res, next) => {
    // Update article views count in the database
    const updateViewsQuery = "UPDATE Articles SET views = views + 1 WHERE id = ?";
    
    global.db.run(updateViewsQuery, [req.params.id], function (err) {
        if (err) {
            next(err); // Pass error to the error handler middleware
        } else {
            res.redirect(`/reader/article/${req.params.id}`); // Redirect to the article page
        }
    });
});

/**
 * @desc Retrieves an article with its comments and renders the article page
 */
router.get("/article/:id", (req, res, next) => {
    // Fetch article details and comments
    getArticleWithComments(req.params.id, res, next)
});

/**
 * @desc Handles actions like liking or commenting on an article
 */
router.post("/article/:id", (req, res, next) => {
    const articleId = req.params.id;
    const action = req.body.action;
    
     // Check if the user has liked any articles
    if (!req.session.likedArticles) {
        req.session.likedArticles = {};
    }

     // Process liking action
    if (req.session.userId && action === "like") {
        if (req.session.likedArticles[articleId]) {
            getArticleWithComments(articleId, res, next, "You have liked this article"); // Notify user about liking the article
        } else {
            req.session.likedArticles[articleId] = true;

            // Update likes count in the database
            const query = "UPDATE Articles SET likes = likes + 1 WHERE id = ?";
            global.db.run(query, [articleId], function (err) {
                if (err) {
                    next(err); // Pass error to the error handler middleware
                } else {
                    res.redirect(`/reader/article/${articleId}`); // Redirect to the article page
                }
            });
        }
    } else if (action === "comment") { // Process commenting action
        const name = req.body.name.trim();
        const comment = req.body.comment.trim();

        if ((name && !comment) || (!name && comment)) {
            res.status(400).send("Both Name and Comment fields must be filled if either is provided."); // Send error if fields are incomplete
            return;
        }

        // Insert comment into the database
        if(name && comment){
            const insertCommentQuery = "INSERT INTO comments (name, comment, article_id, created) VALUES (?, ?, ?, ?)";
            const insertCommentParams = [req.body.name, req.body.comment, articleId, new Date().toLocaleString()];
            
            global.db.run(insertCommentQuery, insertCommentParams, function (err) {
                if (err) {
                    next(err); // Pass error to the error handler middleware
                } else {
                    getArticleWithComments(articleId, res, next); // Fetch updated article with comments
                }
            });
        }
    } else if(!req.session.userId){
        getArticleWithComments(articleId, res, next, "Only registered users can like this article. Please create an account to proceed."); // Notify user about the need to register
    } 
});

// Error handling middleware
router.use(errorHandler);

// Export the router object so index.js can access it
module.exports = router;
