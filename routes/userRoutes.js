const express = require('express')
router = express.Router()
const userscontroller = require("../controllers/userscontrollers")
const verifyJWT = require("../middleware/verifyjwt")


router.use(verifyJWT)
router.route("/").get(userscontroller.getAllUsers)

module.exports = router