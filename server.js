const path = require("path");
const cors = require("cors");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const express = require("express");


const app = express();

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/heartbeat", (req, res) => {
    res.send({message: "WakeUp server is running!"});
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server has started!");
});