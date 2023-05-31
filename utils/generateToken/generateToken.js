import jwt from 'jsonwebtoken'

export const generateToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
        },
        process.env.ID_KEY,
        {
            expiresIn: '30d'
        }
    );
}