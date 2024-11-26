import express from 'express'
import multer from "multer";
import authMiddleware from '../middleware/authMiddleware.js'
import { addLeave, getLeave, getLeaves, getLeaveDetail, updateLeave, uploadImages } from '../controllers/leaveController.js'
const upload = multer({ dest: "uploads/" });

const router = express.Router()

router.post('/add', authMiddleware, addLeave)
router.get('/detail/:id', authMiddleware, getLeaveDetail)
router.get('/:id/:role', authMiddleware, getLeave)
router.get('/', authMiddleware, getLeaves)
router.put('/:id', authMiddleware, updateLeave)
router.post("/upload-images", authMiddleware, upload.array("images"), uploadImages);


export default router