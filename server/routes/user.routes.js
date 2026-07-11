import express, { Router } from 'express'
import { upload } from '../middleware/multer.middleware.js'
import { importfile } from '../controllers/importcsvfile.controller.js';
const router=express.Router();
router.route('/import').post(
       upload.single('csvfile'),
       importfile
)
export{router}