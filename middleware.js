// Error handling middleware
module.exports = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).send('Something went wrong.'); // Respond with a generic error message
};