const path = require("path");
const cors = require("cors");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const URLRequest = require("./models/request.model");
const express = require("express");

require("dotenv").config();
const TIME_LIMIT = 25 * 60 * 1000;
const HEARTBEAT_API = "https://check-heartbeat.herokuapp.com/heartbeat";
const self = "https://wakeup-heroku.herokuapp.com/heartbeat/";

const app = express();
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/heartbeat", (req, res) => {
    res.send({message: "WakeUp server is running!"});
});

app.get("/entries", async (req, res) => {
    const entries = await URLRequest.find();
    res.send(entries);
});

app.post("/request", (req, res) => {
    console.log("Recieved new request:");
    console.log(req.body);
    const {URL} = req.body;

    if (URL.indexOf("herokuapp.com") === -1)
        res.send({error: "Invalid URL!"});
    else {
        fetch(URL); // Hit the url for the first time (non-bocking).
        const newEntry = new URLRequest({
            URL,
            time: new Date()
        })
        .save((err, entry) => {
            if (err) {
                console.log(err);
                res.send({error: "Duplicate entry detected!"});
            } else {
                console.log("processed new entry:");
                console.log(entry);
                res.send({message: "Request recieved!"});
            }
        });
    }

});

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.on("error", (error) => {
    console.error(error);
});
mongoose.connection.once("open", () => {
    console.log("Connected to DB!");
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server has started!");
        selfCall(TIME_LIMIT);
        wakeUp();
        if (process.env.PRODUCTION === "true")
            checkHeartbeat(TIME_LIMIT);
    });
});

function wakeUp(interval = 60 * 1000) {
    setInterval(async () => {
        const entries = await URLRequest.find();

        entries.forEach(entry => {
            const elapsedTime = new Date() - entry.time;
            if (elapsedTime > TIME_LIMIT) {

                /*Wake up a server at given url (non-blocking).
                We don't really care what the server returns
                as long as we hit any route and get something
                even if this something is an error 
                such as Cannot GET /someroute */
                fetch(entry.URL) 
                    .then(res => res.json())
                    .then(data => {
                        console.log("" + entry.URL + " responded with:");
                        console.log(data);
                    })
                    .catch(err => console.log(err)); 
                
                // Update entry.
                entry.time = new Date();
                entry.save((err, product) => {
                    if (err) {
                        console.log("Could not update " + product.URL);
                        console.log(err);
                    } else 
                        console.log("" + product.URL + " Updated successfully.");
                });
            }
        });
    }, interval);
}

// Keep heartbeat server active.
function checkHeartbeat(interval = 30 * 1000) {
    setInterval(async () => {
        const res = await fetch(HEARTBEAT_API);
        const data = await res.json();
        console.log(data);
        if (data.msg !== "Heartbeat server is up and running!") 
            console.log("Heartbeat server is down... Wake it up!");
    }, interval);
}

// Keep calling 'self' to stay active/awake.
function selfCall(interval = 30 * 1000) {
    setInterval(() => {
        console.log("Calling " + self);
        fetch(self)
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(error => console.log(error));
    }, interval)
}
