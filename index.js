import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs"
import { exec } from "child_process"; //watchout
import {stderr,stdout} from "process";


const app = express(); 


app.use(
    cors({
        origin: ["http://localhost:3000","http://localhost:5173"],
        credentials: true
    })
)

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*"); //watch it
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
    next();
})

//multer middleware

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads")
    },
    filename: function (req, file, cb) {
      cb(null,file.fieldname + '-' + uuid() + path.extname(file.originalname))
    }})

//multer confiragtion

const upload = multer({storage: storage})






app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads",express.static("uploads"))



app.get ("/", function(req, res) {
    res.json({
        message: "Hello World"})

})


app.post ("/upload", upload.single("file"), function(req, res) { 
    
    const lessonId = uuid();
    const videoPath = req.file.path
    const outputPath = `./uploads/courses/${lessonId}`;
    const hlsPath = `${outputPath}/index.m3u8`;

    console.log("hlsPath",hlsPath)

if(!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath,{recursive: true})
}

//ffmpeg  



   const ffmpegCommand = `ffmpeg -i "${videoPath}" -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 "${hlsPath}"`;

   //no queue because of poc cuz not used in real world

exec (ffmpegCommand, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    console.error(`Stderr: ${stderr}`);
        console.log(`Stdout: ${stdout}`);
const videoURL = `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`
 

res.json({
    message: "Video converted to HLS",
    videoURL : videoURL,
    lessonId : lessonId
})



  });




    
    console.log("file uploaded")})


app.listen (8000, function() {
    console.log ("Listening on port 8000")
})