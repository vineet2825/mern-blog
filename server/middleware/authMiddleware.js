const jwt = require('jsonwebtoken');
const HttpError = require('../models/errorModel');

const authMiddleware = async (req, res, next) => {
    const Authorization = req.headers.Authorization || req.headers.authorization;

    if (Authorization && Authorization.startsWith("Bearer")) {
        const token = Authorization.split(' ')[1];

        try {
            const info = await new Promise((resolve, reject) => {
                jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                    if (err) reject(err);
                    else resolve(decoded);
                });
            });
            req.user = info;
            next();
        } catch (err) {
            return next(new HttpError("Unauthorized. Invalid token.", 403));
        }
    } else {
        return next(new HttpError("Unauthorized. No token", 401));
    }
};

module.exports = authMiddleware;
