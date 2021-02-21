require("dotenv").config();

const express = require("express");
const app = express()
const path = require("path");

const routes = require("./routes/routes");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use("/public",express.static(path.join(__dirname,"public")));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(routes);

app.listen(process.env.port,()=>{
    console.log(`server is running on "http://${process.env.host}:${process.env.port}"`)
})
