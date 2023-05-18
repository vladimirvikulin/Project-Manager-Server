import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export default (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || '';
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.ID_KEY);
            req.userId = decoded._id;
            next();
        } catch (error) {
            return res.status(403).json({
                message: 'Нема доступа',
            })
        }
    } else {
        return res.status(403).json({
            message: 'Нема доступа',
        })
    }
};
