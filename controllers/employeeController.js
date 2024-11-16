import multer from "multer";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import path from 'path';
import Department from '../models/Department.js';
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "employee_images", // Folder in your Cloudinary account
    allowed_formats: ["jpeg", "png", "jpg"],
  },
});

const upload = multer({ storage });

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

    // Check if the user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: "User already registered in emp" });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create a new User
    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role,
      profileImage: req.file ? req.file.path : "", // Cloudinary URL
    });
    const savedUser = await newUser.save();

    // Create a new Employee
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

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('userId', { password: 0 })
      .populate("department");
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Get employees server error" });
  }
};

const getEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    let employee;
    employee = await Employee.findById({ _id: id })
      .populate('userId', { password: 0 })
      .populate("department");
    if (!employee) {
      employee = await Employee.findOne({ userId: id })
        .populate('userId', { password: 0 })
        .populate("department");
    }
    return res.status(200).json({ success: true, employee });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Get employee server error" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      maritalStatus,
      designation,
      department,
      salary,
    } = req.body;

    const employee = await Employee.findById({ _id: id });
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    const user = await User.findById({ _id: employee.userId });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const updateUser = await User.findByIdAndUpdate(
      { _id: employee.userId },
      { name, profileImage: req.file ? req.file.path : user.profileImage }
    );
    const updateEmployee = await Employee.findByIdAndUpdate(
      { _id: id },
      {
        maritalStatus,
        designation,
        salary,
        department,
      }
    );

    if (!updateEmployee || !updateUser) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    return res.status(200).json({ success: true, message: "Employee updated" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Update employees server error" });
  }
};

const fetchEmployeesByDepId = async (req, res) => {
  const { id } = req.params;
  try {
    const employees = await Employee.find({ department: id });
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Get employees by department ID server error" });
  }
};

export { addEmployee, upload, getEmployees, getEmployee, updateEmployee, fetchEmployeesByDepId };
