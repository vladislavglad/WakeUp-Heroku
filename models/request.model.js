const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    URL: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model("URLRequest", requestSchema);