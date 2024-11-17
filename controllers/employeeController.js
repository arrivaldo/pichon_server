import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import Department from "../models/Department.js";
import dotenv from 'dotenv'; // Add this line
dotenv.config(); // Load environment variables from the .env file


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'employee_profiles', // Cloudinary folder to store images
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp'], // Added 'webp'
  },
});
const upload = multer({ storage });

// Add Employee Controller
const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      password,
      role,
    } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: "User already registered in emp" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const profileImageUrl = req.file ? req.file.path : ""; // Cloudinary returns the URL in the `path`

    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role,
      profileImage: profileImageUrl,
    });

    const savedUser = await newUser.save();
    const newEmployee = new Employee({
      userId: savedUser._id,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
    });

    await newEmployee.save();
    return res.status(200).json({ success: true, message: "Employee created" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error in adding employee" });
  }
};

// Other functions remain unchanged


const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().populate('userId', {password: 0}).populate("department")
        return res.status(200).json({success: true, employees})
    } catch(error) {
        return res.status(500).json({success: false, error: "get employees server error"})
    }
}
const getEmployee = async (req, res) => {
    const {id} = req.params;
    try {
        let employee;
        employee = await Employee.findById({_id: id}).populate('userId', {password: 0}).populate("department")
        if(!employee) {
         employee = await Employee.findOne({ userId: id }).populate('userId', {password: 0}).populate("department")
        }
        return res.status(200).json({success: true, employee})
    } catch(error) {
        return res.status(500).json({success: false, error: "get employees server error"})
    }
}
const updateEmployee = async (req, res) => {
    try {
            const {id} = req.params;
            const {
                name,
                maritalStatus,
                designation,
                department,
                salary,
        
            } = req.body;
        
            const employee = await Employee.findById({_id: id})
            if(!employee) {
                return res.status(404).json({success: false, error: "employee not found"})
            }
            const user = await User.findById({_id: employee.userId})
            if(!user) {
                return res.status(404).json({success: false, error: "user not found"})
            }
            const updateUser = await User.findByIdAndUpdate({_id: employee.userId}, {name})
            const updateEmployee = await Employee.findByIdAndUpdate({_id: id}, {
                maritalStatus,
                designation,
                salary,
                department
            })
            if(!updateEmployee || !updateUser) {
    
                    return res.status(404).json({success: false, error: "document not found"})   
            }
            return res.status(200).json({success: true, message: "employee update" })
    } catch(error) {
        return res.status(500).json({success: false, error: "update employees server error"})
    }
}
const fetchEmployeesByDepId = async (req, res) => {
    const {id} = req.params;
    try {
        const employees = await Employee.find({ department: id })
        return res.status(200).json({success: true, employees })
    } catch(error) {
        return res.status(500).json({success: false, error: "get employeesbyDepId server error"})
    }
}






export { addEmployee, upload, getEmployees, getEmployee, updateEmployee, fetchEmployeesByDepId };
