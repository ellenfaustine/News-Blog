const express = require("express");
const router = express.Router();
const { getSettings, getDraftArticles, getPublishedArticles } = require("./dbQueries");
const errorHandler = require("../middleware");

/**
 * @desc Middleware to check if user is authenticated
 */
function checkAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/author/login');
    }
    next();
}

/**
 * @desc Render registration page
 */
router.get("/register", (req, res, next) => {
    res.render("author-register.ejs");
});

/**
 * @desc Process registration page submission
 */
router.post("/register", (req, res, next) => {

    // Check if username contains spaces
    if (/\s/.test(req.body.username)) {
        return res.render("author-register.ejs", { error: "Username cannot contain spaces. Please choose a username without spaces." });
    }
    
    const checkUsernameQuery = "SELECT * FROM Users WHERE username = ?";

    global.db.get(checkUsernameQuery, [req.body.username], function (err, user) {
        if (err) {
            next(err);
        } else if (user) {
            res.render("author-register.ejs", { error: "The username you have chosen is already in use. Please select a different username." });
        } else {
            const insertUserQuery = "INSERT INTO Users(name, username, password) VALUES (?, ?, ?)";
            const insertUserParams = [req.body.name, req.body.username, req.body.password];

            global.db.run(insertUserQuery, insertUserParams, function (err) {
                if (err) {
                    res.render("author-register.ejs", { error: "Registration failed. Please try again." });
                } else {
                    res.redirect('/author/login');
                }
            });
        }
    });    
});

/**
 * @desc Render login page
 */
router.get("/login", (req, res, next) => {
    res.render("author-login.ejs");
});

/**
 * @desc Process login page submission
 */
router.post("/login", (req, res, next) => {
    const checkUserQuery = "SELECT * FROM Users WHERE LOWER(username) = LOWER(?)";

    global.db.get(checkUserQuery, [req.body.username], function (err, user) {
        if (err) {
            next(err); 
        } else if (!user) {
            res.render("author-login.ejs", { error: "User not found. Please create an account." });
        } else if (user.password !== req.body.password) {
            res.render("author-login.ejs", { error: "Password entered is incorrect. Please ensure you have entered the correct password for your account." });
        } else {
            const updateAuthorQuery = "UPDATE Settings SET VALUE = ? WHERE id = 'author'";

            global.db.run(updateAuthorQuery, [user.name], function (err) {
                if (err) {
                    next(err); 
                } else {
                    req.session.userId = user.id;
                    res.redirect('/author/home');
                }
            });
        }
    });
});

/**
 * @desc Render author's home page
 */
router.get("/home", checkAuth, (req, res, next) => {
    Promise.all([getSettings(), getDraftArticles(), getPublishedArticles()])
    .then(([settings, draftArticles, publishedArticles]) => {
        res.render("author-home.ejs", {
            settings: settings,
            draftArticles: draftArticles,
            publishedArticles: publishedArticles
        });
    })
    .catch(next); 
});

/**
 * @desc Publish a draft article
 */
router.post("/home", checkAuth, (req, res, next) => {
    const updateArticleQuery = "UPDATE Articles SET condition = 'published', published = ? WHERE id = ?";
    const updateArticleParams = [new Date().toLocaleString(), req.body.id];

    global.db.run(updateArticleQuery, updateArticleParams, function (err) {
        if (err) {
            next(err);
        } else {
            res.redirect('/author/home?success=1');
        }
    });
});

/**
 * @desc Render author's settings page
 */
router.get("/settings", checkAuth, (req, res, next) => {
    getSettings()
        .then(settings => {
            res.render("author-settings.ejs", { settings: settings });
        })
        .catch(err => {
            next(err);
        });
});

/**
 * @desc Update blog settings
 */
router.post("/settings", checkAuth, (req, res, next) => {
    const updateBlogNameQuery = "UPDATE Settings SET value = ? WHERE id = ?";
    const updateBlogNameParams = [req.body.blog_name, 'blog_name'];

    global.db.run(updateBlogNameQuery, updateBlogNameParams, function (err) {
        if (err) {
            next(err); 
            return;
        } else {
            const updateAuthorQuery = "UPDATE Settings SET value = ? WHERE id = ?";
            const updateAuthorParams = [req.body.author_name, 'author'];

            global.db.run(updateAuthorQuery, updateAuthorParams, function (err) {
                if (err) {
                    next(err);
                } else {
                    res.redirect('/author/settings?success=yes');
                }
            });
        }
    });
});

/**
 * @desc Render new draft page
 */
router.get("/new", checkAuth, (req, res) => {
    res.render("author-edit.ejs", { article: {} });
});

/**
 * @desc Process new draft page submission
 */
router.post("/new", checkAuth, (req, res, next) => {
    const getAuthorQuery = "SELECT value FROM Settings WHERE id = 'author'";

    global.db.get(getAuthorQuery, function (err, author) {
        if (err) {
            next(err);
        } else {
            const insertArticleQuery = "INSERT INTO Articles (condition, title, author, content, created, modified) VALUES (?, ?, ?, ?, ?, ?)";
            const insertArticleParams = ["draft", req.body.title, author.value, req.body.content, new Date().toLocaleString(), new Date().toLocaleString()];

            global.db.run(insertArticleQuery, insertArticleParams, function (err) {
                if (err) {
                    next(err);
                } else {
                    res.redirect('/author/home?success=2');
                }
            });
        }
    });
});

/**
 * @desc Render article editing page
 */
router.get("/edit/:id", checkAuth, async (req, res, next) => {
    const getArticleQuery = "SELECT * FROM Articles WHERE id = ?"

    try {
        const settings = await getSettings();

        global.db.get(getArticleQuery, [req.params.id], async function (err, article) {
            if (err) {
                next(err);
            } else {
                res.render("author-edit.ejs", {
                    article: article,
                    settings: settings
                });
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @desc Process article editing page submission
 */
router.post("/edit/:id", checkAuth, (req, res, next) => {
    const updateArticleQuery = "UPDATE Articles SET title = ?, content = ?, modified = ? WHERE id = ?";
    const updateArticleParams = [req.body.title, req.body.content, new Date().toLocaleString(), req.params.id];

    global.db.run(updateArticleQuery, updateArticleParams, function (err) {
        if (err) {
            next(err);
        } else {
            res.redirect('/author/home?success=3');
        }
    });
});

/**
 * @desc Process article deletion
 */
router.post("/delete", checkAuth, (req, res, next) => {
    const deleteArticlequery = "DELETE FROM Articles WHERE id = ?";

    global.db.run(deleteArticlequery, [req.body.id], function (err) {
        if (err) {
            next(err);
        } else {
            res.redirect('/author/home?success=4');
        }
    });
});

// Error handling middleware
router.use(errorHandler);

// Export the router object so index.js can access it
module.exports = router;
