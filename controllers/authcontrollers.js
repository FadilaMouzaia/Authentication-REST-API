const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const register = async(req,res)=>{
 const {first_name,last_name,email,  password} = req.body

if(!first_name|| !last_name|| !email|| !password){
 return res.status(400).json({message:"All fields are required"})     
}
const foundUser = await User.findOne({email}).exec()  
if(foundUser){
return res.status(401).json({message:"user already exists"})
}
const hashedPassword = await bcrypt.hash(password,10)
const user = await User.create({
    first_name,
    last_name,
    email,
    password: hashedPassword
})

// au niveau de serveur
const accessToken = jwt.sign({
    Userinfo:{
        id:user._id
    }
}, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"15m"})

// au niveau de serveur
const refreshToken = jwt.sign({
    Userinfo:{
        id:user._id,
    },
},
process.env.REFRESH_TOKEN_SECRET,
{expiresIn:"7d"}
)

//au niveau browser
res.cookie("jwt", refreshToken, {
    httpOnly:true, //accessible only by web server
    secure:true, //https
    sameSite:"None", //cross site cookie
    maxAge:7 *24 *60 *60 *1000,// il eccepte en ms
})


res.json({accessToken, 
    email:user.email,
    first_name:user.first_name,
    last_name:user.last_name
     })
}
const login = async(req,res)=>{
    const {email,password} = req.body

    if(!email||!password){
     return res.status(400).json({message:"All fields are required"})
    }
    const foundUser = await User.findOne({email}).exec()
    if(!foundUser){
    return res.status(401).json({message:"user doesn't exist"})
    }
    const match = await bcrypt.compare(password,foundUser.password)
    if(!match) return res.status(401).json({message:"Wrong Password"})
    const accessToken = jwt.sign({
        Userinfo:{
            id:foundUser._id
        }
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"15m"})
    
    const refreshToken = jwt.sign({
        Userinfo:{
            id:foundUser._id,
        },
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn:"7d"}
    )
    res.cookie("jwt", refreshToken, {
        httpOnly:true, //accessible only by web server
        secure:true, //https
        sameSite:"None", //cross site cookie
        maxAge:7 *24 *60 *60 *1000,
    })
    res.json({accessToken, 
        email:foundUser.email,
         })
    }

    
    const refresh =(req,res)=>{
        const cookies = req.cookies
        if(!cookies?.jwt) res.status(401).json({message : "Unauthorized"})
        const refreshToken = cookies.jwt
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async(err,decoded)=>{
            if(err) return res.status(403).json({message: "Forbidden"})
            const foundUser = await User.findById(decoded.Userinfo.id).exec()
        if(!foundUser) return res.status(401).json({message : "Unauthorized"})
        const accessToken = jwt.sign(
        {
            Userinfo:{
                id:foundUser._id,
            },
        },
         process.env.ACCESS_TOKEN_SECRET,
          {expiresIn:"15m"})
        
         res.json({accessToken})
        }
        )
    }
    const logout =(req,res)=>{
        const cookies = req.cookies
        if(!cookies?.jwt)return res.sendStatus(204) // No content
        
    res.clearCookie("jwt", {
        httpOnly : true,
        sameSite:"None",
        secure:"true"
    })
    res.json({message:"Cookie cleared"})
    }
module.exports = {
    register,
    login,
    refresh,
    logout,
}


