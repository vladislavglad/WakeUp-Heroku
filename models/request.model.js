const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    URL: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Request", requestSchema);