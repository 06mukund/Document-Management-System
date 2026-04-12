require("dotenv").config({
  path: require("path").resolve(__dirname, ".env")
});

//console.log("DIR:", __dirname);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());

//console.log("ENV CHECK:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

    const fileRoutes = require("./routes/fileRoutes");
    app.use("/api/files", fileRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

