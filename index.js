import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
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

app.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('Server OK');
})