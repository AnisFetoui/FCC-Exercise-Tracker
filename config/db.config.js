const Mongoose = require('mongoose');

exports.connectDB = () => {
    Mongoose.connect(
        process.env.DB_URL)
        .then(() => {
            console.log("Connected to DB Successfully!");
        })
        .catch((err) => {
            console.log("Connection to Database Failed! Existing Now....");
            console.error(err);
            process.exit(1);
        });
};