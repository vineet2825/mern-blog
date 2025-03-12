const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const fs = require('fs');
const path = require('path');
const {v4: uuid} = require('uuid');

const HttpError = require("../models/errorModel");
const User = require("../models/userModel");
const { unlink } = require('fs').promises;


// =================== REGISTER A NEW USER
// POST : api/users/register
// UNPROTECTED

const registerUser = async (req, res, next) => {

  try {
    const { name, email, password, password2 } = req.body;

    if (!name || !email || !password) {
      return next(new HttpError("Fill in all the feilds", 422));
    }

    const newEmail = email.toLowerCase();

    const emailExists = await User.findOne({ email: newEmail });

    if (emailExists) {
      return next(new HttpError("Email already exits.", 422));
    }


    if (password.trim().length < 6) {
      return next(
        new HttpError("Password should be at least 6 characters.", 422)
      );
    }

    if (password != password2) {
      return next(new HttpError("Password do not match.", 422));
    }

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email: newEmail,
      password: hashPass,
    });

    res.status(201).json(`New User ${newUser.email} registered.`);
  } catch (error) {
    return next(new HttpError("User registration failed", 422));
  }
};

// =================== LOGIN A REGISTERED USER
// POST : api/users/login
// UNPROTECTED


const loginUser = async (req, res, next) => {


  try {
    
    const {email, password} = req.body;

    if(!email || !password){
      return next(new HttpError("Fill in all the feilds", 422));
    };

    const newEmail = email.toLowerCase();

    const user = await User.findOne({email: newEmail});

    if(!user){
      return next(new HttpError("Invalid credentials.", 422))
    };

    const comparePass = await bcrypt.compare(password, user.password);

    if(!comparePass){
      return next(new HttpError("Invalid credentials.", 422))
    }

    const {_id: id , name}= user

    const token =  jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn:'1d'})

    res.status(200).json({token, id , name})
  } catch (error) {
    return next(new HttpError("Login failed. Please check your credentials.", 422))
  }


};

// =================== USER PROFILE
// GET : api/users/:id
// PROTECTED

const getUser = async (req, res, next) => {
 
  try {
    const {id} = req.params;
    const user = await User.findById(id).select('-password');

    if(!user){
      return next(new HttpError("User not found.", 404))
    }

    res.status(200).json(user);

  } catch (error) {
    return next(new HttpError(error));
  }


};


// const changeAvatar = async (req, res, next) => {
//   try {
//     if (!req.files || !req.files.avatar) {
//       return next(new HttpError("Please choose an image", 422));
//     }

//     // Find user from database
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return next(new HttpError("User not found", 404));
//     }

//     // Delete old avatar if exists
//     if (user.avatar) {
//       const oldAvatarPath = path.join(__dirname, '..', 'uploads', user.avatar);
//       try {
//         await unlinkPromise(oldAvatarPath); // Await for the file deletion
//       } catch (err) {
//         return next(new HttpError(err.message || "Error deleting old avatar", 500));
//       }
//     }

//     const { avatar } = req.files;

//     // Check file size
//     if (avatar.size > 500000) {
//       return next(new HttpError("Profile picture is too big. Should be less than 500KB", 422));
//     }

//     // Generate new filename
//     const fileName = avatar.name;
//     const fileExtension = path.extname(fileName);
//     const newFileName = uuid() + fileExtension; // Generate a unique filename

//     const uploadsDir = path.join(__dirname, '..', 'uploads');

//     // Check if the uploads directory exists, if not, create it
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir); // Create the directory if it doesn't exist
//     }

//     const newFilePath = path.join(uploadsDir, newFileName);

//     // Move file to the uploads directory
//     avatar.mv(newFilePath, async (err) => {
//       if (err) {
//         return next(new HttpError("Error uploading file: " + err.message, 500));
//       }

//       // Update avatar in the database
//       const updatedUser = await User.findByIdAndUpdate(
//         req.user.id,
//         { avatar: newFileName },
//         { new: true }
//       );

//       if (!updatedUser) {
//         return next(new HttpError("Avatar couldn't be changed.", 422));
//       }

//       // Respond with updated user
//       res.status(200).json(updatedUser);
//     });

//   } catch (error) {
//     return next(new HttpError(error.message || "An error occurred", 500));
//   }
// };

// =================== CHANGE USER AVATAR (profile picture)
// PUT : api/users/change-avatar
// PROTECTED

const changeAvatar = async (req, res, next) => {
  try {
    // Check if a file is uploaded
    if (!req.files || !req.files.avatar) {
      return next(new HttpError("Please choose an image", 422));
    }

    // Find the user from the database
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', 'uploads', user.avatar);
      try {
        await unlink(oldAvatarPath); // Await the file deletion
      } catch (err) {
        return next(new HttpError(err.message || "Error deleting old avatar", 500));
      }
    }

    const { avatar } = req.files;

    // Check file size (500KB max)
    if (avatar.size > 500000) {
      return next(new HttpError("Profile picture is too big. Should be less than 500KB", 422));
    }

    // Check file type (only allow image files)
    const fileExtension = path.extname(avatar.name).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!allowedExtensions.includes(fileExtension)) {
      return next(new HttpError("Invalid file type. Only .jpg, .jpeg, .png, and .gif are allowed.", 422));
    }

    // Generate a unique filename
    const newFileName = uuid() + fileExtension; // Generate a unique filename using uuid

    const uploadsDir = path.join(__dirname, '..', 'uploads');

    // Check if the uploads directory exists, if not, create it
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true }); // Make sure the directory exists
    }

    const newFilePath = path.join(uploadsDir, newFileName);

    // Use promise-based approach to move the file
    await avatar.mv(newFilePath);

    // Update the avatar in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: newFileName },
      { new: true }
    );

    if (!updatedUser) {
      return next(new HttpError("Avatar couldn't be changed.", 422));
    }

    // Respond with the updated user
    res.status(200).json(updatedUser);
  } catch (error) {
    return next(new HttpError(error.message || "An error occurred", 500));
  }
};


// =================== EDIT USER DETAILS (from profile)
// PUT : api/users/edit-user
// PROTECTED

const editUser = async (req, res, next) => {

  try {
    
    const {name , email, currentPassword, newPassword, confirmNewPassword} = req.body;

    if(!name || !email || !currentPassword || !newPassword){
      return next(new HttpError("Fill in all fields.", 422))
    }

    const user = await User.findById(req.user.id);
    if(!user){
        return next(new HttpError("User not found.", 403))
    }

    // make sure new email doesn't already exists

    const emailExits = await User.findOne({email});

    // we want to update other details with/without changing the email (which is a unique id because we use it to login).

    if(emailExits && (emailExits._id !== req.user.id)){
      return next(new HttpError("Email already exists.", 422));
    }

    // compare current password to db passowrd
    const validdateUserPassword = await bcrypt.compare(currentPassword , user.password);

    if(!validdateUserPassword){
      return next(new HttpError("Invalid current password", 422));
    }

    // compare new password
    if(newPassword !== confirmNewPassword){
      return next(new HttpError("New password do not match.", 422));
    }

    // hash new password;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // update user info in database;

    const newInfo = await User.findByIdAndUpdate(req.user.id , {name , email , password : hash}, {new:true});

    res.status(200).json(newInfo)


  } catch (error) {
    return next(new HttpError(error))
  }

};


// ===================  Get Authors
// PUT : api/users/
// UNPROTECTED

const getAuthors = async (req, res, next) => {
  
  try {
    const authors = await User.find().select('-password');
    res.json(authors);


  } catch (error) {
    return next(new HttpError(error))
  }

};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  changeAvatar,
  editUser,
  getAuthors,
};
