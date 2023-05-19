import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import checkAuth from './utils/checkAuth.js'
import handleValidationErrors from './utils/handleValidationErrors.js';
import { loginValidation, registerValidation } from './validations/auth.js';
import { groupCreateValidation } from './validations/group.js';
import * as UserController from './controllers/UserController.js';
import * as GroupController from './controllers/GroupController.js';

dotenv.config();
const app = express();
const port = process.env.PORT;
app.use(express.json());
mongoose.set('strictQuery', false);
mongoose
    .connect(process.env.DB_TOKEN)
    .then(() => console.log('DB OK'))
    .catch((err) => console.log('DB ERROR', err))

app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.get('/auth/me', checkAuth, UserController.getMe);

app.get('/groups', checkAuth, GroupController.getAll);
app.get('/groups/:id', checkAuth, GroupController.getOne);
app.post('/groups', checkAuth, groupCreateValidation, handleValidationErrors, GroupController.create);
app.delete('/groups/:id', checkAuth, GroupController.remove)
app.patch('/groups/:id', checkAuth, groupCreateValidation, handleValidationErrors, GroupController.update)

app.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('Server OK');
})