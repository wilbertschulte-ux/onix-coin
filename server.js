const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const coinRoutes = require("./routes/coinRoutes");

app.use("/api/coins", coinRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
})
.catch((err) => {
    console.log(err);
});

app.get("/", (req, res) => {
    res.send("ONIX backend working");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

