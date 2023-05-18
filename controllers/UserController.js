import UserModel from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { validationResult } from 'express-validator';
const generateToken = (user) => {
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
export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }

        const { fullName, email, password } = req.body;
        
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const doc = new UserModel({
            fullName,
            email,
            passwordHash: hash,
        });

        const user = await doc.save();
        const token = generateToken(user);

        const { passwordHash, ...userData } = user._doc;
        res.json({
            ...userData,
            token
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Не вдалося зареєструватися',
        })
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'Невірний логін або пароль'
            });
        }
        const isValidPass = await bcrypt.compare(password, user._doc.passwordHash);

        if (!isValidPass) {
            return res.status(400).json({
                message: 'Невірний логін або пароль'
            });
        }
        const token = generateToken(user);

        const { passwordHash, ...userData } = user._doc;
        res.json({
            ...userData,
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Не вдалося авторизуватися',
        })
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                message: 'Невірний логін або пароль',
            })
        }
        const { passwordHash, ...userData } = user._doc;
        res.json(userData);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Нема доступа',
        })
    }
};