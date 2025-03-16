const express=require('express');
const { registerCompany, getCompany, getCompanyById, updateCompany }=require('../controllers/companyController');
const isAuthenticated=require('../middlewares/isAuthenticated');
const router = express.Router();
const {singleUpload}=require('../middlewares/mutler');


router.route("/register").post(isAuthenticated,registerCompany);
router.route("/get").get(isAuthenticated,getCompany);
router.route("/get/:id").get(isAuthenticated,getCompanyById);
router.route("/update/:id").put(isAuthenticated,singleUpload, updateCompany);

module.exports= router;