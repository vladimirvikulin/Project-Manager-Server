import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import UserModel from './models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { registerValidation } from './validations/auth.js';
import { validationResult } from 'express-validator';
const app = express();
const port = process.env.PORT;
app.use(express.json());
mongoose
    .connect(process.env.DB_TOKEN)
    .then(() => console.log('DB OK'))
    .catch((err) => console.log('DB ERROR', err))

app.get('/', (req, res) => {
    res.send('Working');
})

app.post('/auth/register', registerValidation, async (req, res) => {
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
            process.env.ID_TOKEN,
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
})

app.post('/auth/login', async (req, res) => {
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
            process.env.ID_TOKEN,
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
});

app.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('Server OK');
})