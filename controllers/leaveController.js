import Leave from "../models/Leave.js"
import Employee from '../models/Employee.js';
import path from "path";
import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  const uploadImages = async (req, res) => {
    try {
      const { files } = req;
      const uploadPromises = files.map((file) =>
        cloudinary.v2.uploader.upload(file.path, { folder: "leave-images" })
      );
  
      const uploadedImages = await Promise.all(uploadPromises);
  
      return res.status(200).json({
        success: true,
        images: uploadedImages.map((img) => ({
          url: img.secure_url,
          public_id: img.public_id,
        })),
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Image upload error" });
    }
  };

const addLeave = async (req, res) => {

    try {
        const {userId, leaveType, startDate, reason, economico, images} = req.body
        const employee = await Employee.findOne({userId})

        const newLeave = new Leave({
           employeeId: employee._id, leaveType, startDate, reason, economico, images
        })

        await newLeave.save()

        return res.status(200).json({success: true})
    } catch(error) {
        return res.status(500).json({success: false, error: "leave add server error" })
    }

}

const getLeave = async (req, res) => {
    try {
        const {id, role} = req.params;
        let leaves
        if(role === "admin") {
            leaves = await Leave.find({employeeId: id})
        } else {
            const employee = await Employee.findOne({userId: id})
            leaves = await Leave.find({employeeId: employee._id})
        }
     
        return res.status(200).json({success: true, leaves})

     } catch(error) {
        return res.status(500).json({success: false, error: "leave add server error" })
    }
}


const getLeaves = async (req, res) => {
    try {
        
        const leaves = await Leave.find().populate({
            path: "employeeId",
            populate: [
                {
                    path: 'department',
                    select: 'dep_name'
                },
                {
                    path: 'userId',
                    select: 'name'
                }
            ]
        })

        return res.status(200).json({success: true, leaves})

     } catch(error) {
        return res.status(500).json({success: false, error: "leave add server error" })
    }
}

const getLeaveDetail = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Fetch the leave details with populated employee information
      const leave = await Leave.findById({ _id: id }).populate({
        path: "employeeId",
        populate: [
          {
            path: 'department',
            select: 'dep_name'
          },
          {
            path: 'userId',
            select: 'name profileImage'
          }
        ]
      });
  
      // Check if the leave is found
      if (!leave) {
        return res.status(404).json({ success: false, error: "Leave not found" });
      }
  
      // Explicitly include the images field if it exists
      res.status(200).json({
        success: true,
        leave: {
          ...leave._doc, // Spread the leave document fields
          images: leave.images || [], // Explicitly add images, if not present return an empty array
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Leave detail server error" });
    }
  };
  
const updateLeave = async (req, res) => {
    try {
        const {id} = req.params;
        const leave = await Leave.findByIdAndUpdate({_id: id}, {status: req.body.status})
        if(!leave) {
            return res.status(404).json({success: false, error: "leave not founded" })
        }
        return res.status(200).json({success: true})
    }  catch(error) {
        return res.status(500).json({success: false, error: "leave update server error" })
    }
}


export {addLeave, getLeave, getLeaves, getLeaveDetail, updateLeave, uploadImages}