import UserModel from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { validationResult } from 'express-validator';

export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const doc = new UserModel({
            fullName: req.body.fullName,
            email: req.body.email,
            passwordHash: hash,
        });

        const user = await doc.save();
        const token = jwt.sign(
            {
                _id: user._id,
            },
            process.env.ID_KEY,
            {
                expiresIn: '30d'
            }
        );

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
        const user = await UserModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({
                message: 'Невірний логін або пароль'
            });
        }
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
        if (!isValidPass) {
            return res.status(400).json({
                message: 'Невірний логін або пароль'
            });
        }
        const token = jwt.sign(
            {
                _id: user._id,
            },
            process.env.ID_KEY,
            {
                expiresIn: '30d'
            }
        );

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