import express from 'express';
import dotenv from 'dotenv'
dotenv.config()
const app = express();
const port = process.env.PORT

app.get('/', (req, res) => {
    res.send('Working');
})

app.listen(port, (err) => {
    if (err) {
        return console.log(err)
    }
    console.log('Server OK')
})