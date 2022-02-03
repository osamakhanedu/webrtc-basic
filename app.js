const express = require("express")
const app = express();
let http = require("http").Server(app);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"))

app.listen(PORT,()=>{
    console.log(`running  server on port ${PORT}`)
})