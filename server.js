const path = require("path");
const cors = require("cors");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const Request = require("./models/request.model");
const express = require("express");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/heartbeat", (req, res) => {
    res.send({message: "WakeUp server is running!"});
});

app.get("/entries", async (req, res) => {
    const entries = await Request.find();
    res.send(entries);
});

app.post("/request", (req, res) => {
    console.log(req.body);
    res.send({message: "Request recieved!"});
});

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.on("error", (error) => {
    console.error(error);
});
mongoose.connection.once("open", () => {
    console.log("Connected to DB!");
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server has started!");
    });
});
