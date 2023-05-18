import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import checkAuth from './utils/checkAuth.js'
import { loginValidation, registerValidation } from './validations/auth.js';
import * as UserController from './controllers/UserController.js';
const app = express();
const port = process.env.PORT;
app.use(express.json());
mongoose
    .connect(process.env.DB_TOKEN)
    .then(() => console.log('DB OK'))
    .catch((err) => console.log('DB ERROR', err))

app.post('/auth/register', registerValidation, UserController.register);
app.post('/auth/login', loginValidation, UserController.login);
app.get('/auth/me', checkAuth, UserController.getMe);


app.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('Server OK');
})