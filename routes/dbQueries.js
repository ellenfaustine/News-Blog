/**
 * @desc Retrieves all settings from the Settings table.
 * @returns {Promise<Object>} Promise object representing settings mapped by id to value.
 */
const getSettings = () => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM Settings";
        global.db.all(query, (err, rows) => {
            if (err) {
                reject(err); // Reject promise if there's an error
            } else {
                const settings = {};
                rows.forEach(row => {
                    settings[row.id] = row.value; // Map settings by id to value
                });
                resolve(settings); // Resolve with settings object
            }
        });
    });
};

/**
 * @desc Retrieves all draft articles from the Articles table.
 * @returns {Promise<Array>} Promise object representing an array of draft articles.
 */
const getDraftArticles = () => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM Articles WHERE condition = 'draft'";
        global.db.all(query, (err, rows) => {
            if (err) {
                reject(err); // Reject promise if there's an error
            } else {
                resolve(rows); // Resolve with array of draft articles
            }
        });
    });
};

/**
 * @desc Retrieves all published articles from the Articles table.
 * @returns {Promise<Array>} Promise object representing an array of published articles.
 */
const getPublishedArticles = () => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM Articles WHERE condition = 'published'";
        global.db.all(query, (err, rows) => {
            if (err) {
                reject(err); // Reject promise if there's an error
            } else {
                resolve(rows); // Resolve with array of published articles
            }
        });
    });
};

/**
 * Retrieves an article with its associated comments.
 * @param {number} articleId - The ID of the article to retrieve.
 * @param {Object} res - The response object for rendering the article page.
 * @param {Function} next - The next function for error handling middleware.
 * @param {string} errorMessage - Optional error message to display.
 */
function getArticleWithComments(articleId, res, next, errorMessage) {
    Promise.all([getSettings()])
    .then(([settings]) => {
        const getArticleQuery = "SELECT * FROM Articles WHERE id = ?";

        global.db.get(getArticleQuery, [articleId], function (err, article) {
            if (err) {
                next(err); // Handle error if fetching article fails
            } else {
                if (!article) {
                    return res.status(404).send("Article not found"); // Return 404 if article not found
                }

                const getCommentQuery = "SELECT * FROM Comments WHERE article_id = ? ORDER BY created DESC";

                global.db.all(getCommentQuery, [articleId], function (err, comments) {
                    if (err) {
                        next(err); // Handle error if fetching comments fails
                    } else {
                        // Render reader-article.ejs with settings, article, comments, and error message
                        res.render("reader-article.ejs", {
                            settings: settings,
                            article: article,
                            comments: comments,
                            error: errorMessage
                        });
                    }
                });
            }
        });
    })
    .catch(err => {
        next(err); // Handle any promise rejection
    });
}

// Exporting functions for use in other modules
module.exports = {
    getSettings,
    getDraftArticles,
    getPublishedArticles,
    getArticleWithComments
};