import express from "express";
import dbConnect from "./db/mongoose";
import userRouter from "./routers/User";
import blogRouter from "./routers/Blog";
import {setupSwagger} from "./swagger";

const app = express();
const port = process.env.PORT || 3000;


// Use JSON middleware
app.use(express.json());


//Set up Swagger
setupSwagger(app);

//Use The Routers
app.use(userRouter);
app.use(blogRouter);


//Connect To Database
dbConnect();

//Expose Web Server
app.listen(port,()=>
{
    console.log(`Web Server Listening on port: ${port}`);
});
