const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const FileModel = require('../models/file')
const nodemailer = require('nodemailer');

//Config mailer
const transporter = nodemailer.createTransport({
    host: 'localhost', // Replace with your provider's SMTP server
    port: 1025, // Port may vary depending on your provider
    secure: false, // Use true for TLS, false for non-TLS (consult your provider)
  });
  

const uploadDirectoryPath = path.join(__dirname, '..', 'Files');
// console.log(uploadDirectoryPath);

const storage = multer.diskStorage({
destination: (req, file, cb) =>{
    cb(null, uploadDirectoryPath)
},
filename: (req, file, cb) =>{
    // const fileName = `${file.originalname}`;
    const fileName = uuidv4()+ path.extname(file.originalname);
    cb(null, fileName)
}
})

const upload = multer(
    {storage: storage,}
).single("File"); //creating a new instance multer(CONFIGURATION)

const uploadFile = async (req, res)=>{

    upload(req, res, async (error)=>{
        // console.log(req.body)
        // console.log(req.file)
        if(error){
            console.log("error uploading", error.message);
            return;
        }
//Save file to Db

        const newFile = new FileModel({
            originalFileName: req.file.originalname,
            newFileName: req.file.filename,
            path: req.file.path,
        })

       const newlyInsertedFile = await newFile.save();
        // console.log("file upoaded successfully");
        res.json({
            success:true,
            message: "Uploaded file successfully",
            fileId: newlyInsertedFile._id
        })
    })
    // res.json({
    //     success: true,
    //     message:"Upload file API"
    // })
}

const generateDynamicLink = async (req, res)=>{

    try{
        const fileId = req.params.uuid;
    // console.log(fileId);
    const file = await FileModel.findById(fileId);

    if(!file){
        //DB doenst have this file
        return res.status(404).json({
            success: false,
            message: 'File not found',
        })
    }
    res.json({
        success: true,
        message:"Generate Dynamic Link API",
        result: "http://localhost:8080/files/download/"+fileId,
    })
    }
    catch(err){
        res.status(500).json({success: false, message:"something went wrong", err})
    }
    
}

const downloadFile = async (req, res)=>{
   try{
    const fileId = req.params.uuid;
    const file = await FileModel.findById(fileId);
    if(!file){
        return res.end('file with given ID not found')
    }
    res.download(file.path, file.originalFileName);
}catch(err){
    console.log(err);
   }
}

const sendFile = async (req, res)=>{
    const {fileId, shareTo} = req.body;
    const downloadableLink = "http://localhost:8080/files/download/"+fileId;

    const info = await transporter.sendMail({
        from:"do-not-reply@file-sharing.com",
        to:shareTo,
        subject:"A file shared through link",
        html:`
        <html>
      <head>
      </head>
      <body>
        Your friend has shared a new file with you click the below link to download the file
      <br />
      <a href="${downloadableLink}">Click Here</a>
      </body>
      </html>`,
    });

    console.log("Message sent: %s", info.messageId);

    res.json({
        success: true,
        message:"file shared on email successfully"
    })
}

const fileController = {
    uploadFile,
    generateDynamicLink,
    downloadFile,
    sendFile
}

module.exports = fileController;