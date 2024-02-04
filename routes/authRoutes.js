const express = require('express')
router = express.Router()
const authcontroller = require("../controllers/authcontrollers")


router.route("/register").post(authcontroller.register)
router.route("/login").post(authcontroller.login)
router.route("/refresh").get(authcontroller.refresh)
router.route("/logout").post(authcontroller.logout)




module.exports = router