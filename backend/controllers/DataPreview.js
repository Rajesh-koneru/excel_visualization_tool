const ExcelData = require('../models/ExcelSchema');
const ExcelDoc=require('../models/ExcelSchema');

exports.DataPreview = async (req, res) => {
  try {
    const file  = req.body.file;
    console.log("Filename received:", file);


    const fileData = await ExcelData.find({ fileName:file }); 
    console.log(fileData.length );


    if (fileData.length > 0) {
      
      const data = fileData[0].data;
    
      res.status(200).json({ Data: data });
    } else {
      res.status(404).json({ message: 'File data not found.' });
    }
  } catch (error) {
    console.error("Error fetching preview data:", error);
    res.status(500).json({ message: 'Server error' });
  }
};





exports.FileData=async (req,res)=>{

  try{

    const filesData=await  ExcelDoc.find({});
    console.log(filesData);
   if (!filesData || filesData.length === 0) {
      console.log('No files are there...');
      return res.status(404).json({ message: "No data found" });
    }
    
    const files = filesData.filter(file =>file['fileName']).map(file => file.fileName); 
  
  
   res.status(200).json({data:files,message:'files found'})
  } catch(error) {
    console.log('something went wrong while searching files..',error);
  }

}

