const Post = require('../models/postModel');
const User =  require('../models/userModel');
const path = require('path');
const fs  = require('fs');
const {v4:uuid} = require('uuid');
const HttpError = require('../models/errorModel')

// ======================== CREATE A POST
// POST : api/posts
// PROTECTED

const createPost = async (req , res , next) =>{
   
    try {
        
        let {title , category ,description} = req.body;
        if(!title || !category || !description || !req.files){
            return next(new HttpError("Fill in all feilds and choose thumbnail.", 422))
        };

        const {thumbnail} = req.files;
        // check the files size
        if(thumbnail.size > 2000000){
            return next(new HttpError("Thumbnail too big. File should be less than 2mb"));
        }

        let fileName = thumbnail.name;
        let splittedFilename = fileName.split('.');
        let newFilename = splittedFilename[0] + uuid() + '.' + splittedFilename[splittedFilename.length - 1];
        thumbnail.mv(path.join(__dirname, '..' , '/uploads' , newFilename), async (err) =>{

            if(err){
                return next(new HttpError(err))
            }else{
                const newPost = await Post.create({title, category , description , thumbnail:newFilename, creator: req.user.id});
                if(!newPost){
                    return next(new HttpError("Post couldn't be created.", 422))
                }

                // find the user and increase the count by 1

                const currentUser = await User.findById(req.user.id);
                const userPostConst = currentUser.posts + 1;
                await User.findByIdAndUpdate(req.user.id, {posts:userPostConst});
                res.status(201).json(newPost)
            }

        })



    } catch (error) {
        return next(new HttpError(error));
    }

}


// ======================== GET ALL POSTS
// GET : api/posts
// UNPROTECTED

const getPosts = async (req , res , next)  =>{
  try {
    
    const posts = await Post.find().sort({updateAt : -1})
    res.status(200).json([posts]);

  } catch (error) {
    return next(new HttpError(error))
  }
}

// ======================== GET Single POSTS
// GET : api/posts/:id
// UNPROTECTED

const getPost = async (req , res , next) =>{

    try {
        
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post){
            return next(new HttpError("Post not found", 404));
           
        }

        res.status(200).json(post)

    } catch (error) {
    return next(new HttpError(error))
        
    }
}


// ======================== GET POSTS BY CATEGORY
// GET : api/posts/categories/:category
// UNPROTECTED

const getCatPost = async (req , res , next)  =>{
  
    try {
        
        const {category} = req.params;
        const catPosts = await Post.find({category}).sort({createdAt:-1})
        res.status(200).json(catPosts)

    } catch (error) {
    return next(new HttpError(error))
        
    }

}




// ======================== GET AUTHOR POST
// GET : api/posts/users/:id
// UNPROTECTED

const getUserPosts = async (req , res , next)  =>{
  
    try {
        const {id} = req.params;
        const posts = await Post.find({creator:id}).sort({createAt: -1});
        res.status(200).json(posts);

    } catch (error) {
    return next(new HttpError(error))
        
    }


}


// ======================== EDIT POST
// PATCH : api/posts/:id
// PROTECTED

const editPost = async (req, res, next) => {
    try {
        let fileName;
        let newFilename;
        let updatePost;
        const postId = req.params.id;
        let { title, category, description } = req.body;

        // Validate input
        if (!title || !category || description.length < 12) {
            return next(new HttpError("Fill in all the details"));
        }

        if (!req.files) {
            // No file, just update text fields
            updatePost = await Post.findByIdAndUpdate(postId, { title, category, description }, { new: true });
        } else {
            // Get old post from database
            const oldPost = await Post.findById(postId);

            // Check if the old thumbnail exists before attempting to delete it
            if (oldPost.thumbnail) {
                // Delete the old thumbnail from the server
                await new Promise((resolve, reject) => {
                    fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), (err) => {
                        if (err) {
                            reject(new HttpError(err));
                        } else {
                            resolve();
                        }
                    });
                });
            }

            // Handle new thumbnail upload
            const { thumbnail } = req.files;

            // Check file size
            if (thumbnail.size > 2000000) {
                return next(new HttpError("Thumbnail too big. Should be less than 2mb"));
            }

            // Generate new file name with uuid
            fileName = thumbnail.name;
            let splittedFilename = fileName.split('.');
            newFilename = splittedFilename[0] + uuid() + '.' + splittedFilename[splittedFilename.length - 1];

            // Move new thumbnail to uploads directory
            await new Promise((resolve, reject) => {
                thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), (err) => {
                    if (err) {
                        reject(new HttpError(err));
                    } else {
                        resolve();
                    }
                });
            });

            // Update the post with new thumbnail and other fields
            updatePost = await Post.findByIdAndUpdate(postId, { title, category, description, thumbnail: newFilename }, { new: true });
        }

        // If no post was updated, return an error
        if (!updatePost) {
            return next(new HttpError("Couldn't update post.", 400));
        }

        // Send updated post in the response
        res.status(200).json(updatePost);

    } catch (error) {
        return next(new HttpError(error));
    }
};




// ======================== DELETE POST
// DELETE : api/posts/:id
// PROTECTED

const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        if (!postId) {
            return next(new HttpError("Post unavailable.", 400));
        }

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return next(new HttpError("Post not found.", 404));
        }

        // Check if the post has a thumbnail before attempting to delete it
        const fileName = post.thumbnail;
        if (fileName) {
            // Delete thumbnail from uploads folder
            fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
                if (err) {
                    return next(new HttpError("Failed to delete the thumbnail.", 500));
                } else {
                    // Delete the post from the database
                    await Post.findByIdAndDelete(postId);

                    // Find user and reduce the post count by 1
                    const currentUser = await User.findById(req.user.id);
                    if (currentUser) {
                        const userPostCount = currentUser.posts - 1;
                        // Use findByIdAndUpdate to modify user post count
                        await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
                    } else {
                        return next(new HttpError("User not found.", 404));
                    }

                    // Return a success response
                    res.status(200).json({ message: "Post deleted successfully." });
                }
            });
        } else {
            // Handle the case where the post doesn't have a thumbnail
            await Post.findByIdAndDelete(postId);
            const currentUser = await User.findById(req.user.id);
            if (currentUser) {
                const userPostCount = currentUser.posts - 1;
                await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
            }
            res.status(200).json({ message: "Post deleted successfully without thumbnail." });
        }
    } catch (error) {
        return next(new HttpError(error));
    }
};


module.exports = {createPost , getPosts , getPost ,getCatPost, getUserPosts, editPost, deletePost }