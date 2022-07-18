require("dotenv").config();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import {routes} from './routes';

const app = express();

app.use(cors());
app.use(express.static('uploads'));
app.use('/images', express.static(__dirname + '/assets/public/uploads'));
app.use(express.json());

app.use(routes);


const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD

const port = process.env.SERVER_PORT

mongoose
.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.yxl98.mongodb.net/?retryWrites=true&w=majority`
    )
    .then(() => {
        console.log("MongoDB connected.");
        app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
  })
  .catch((err) => console.log(err));
