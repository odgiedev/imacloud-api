import express from 'express';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import uploadFile from './middlewares/Upload'

import { User } from './models/User';

import {file_type_not_allowed} from './middlewares/Upload'
import { Image } from './models/Image';

export const routes = express.Router();

function checkToken(req:any, res:any, next:any) {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
    
        if(!token) return res.status(401).json({error: "Access denied."});

        const secret = process.env.SECRET;

        jsonwebtoken.verify(token, secret!);

        next();
        
    } catch (err) {
        return res.status(500).json({error: err});
    }
};

routes.get('/', async (req, res) => {
    const all = await User.find({});
    return res.status(200).json({users: all});
});

routes.post('/user/create', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
    
        if(!username || !email || !password || confirmPassword != password) {
            return res.status(422).json({error: "Enter all fields correctly."});
        }
    
        const userExists = await User.findOne({ email: email });

        if(userExists) return res.status(422).json({error: "Email already in use."});

        const hashSalt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, hashSalt);

        const user = new User({
            username,
            email,
            password: passwordHash,
        });
    
        await user.save();
    
        return res.status(201).json({data: "User created."});
    } catch (err) {
        return res.status(500).json({error: err})
    }    
});

routes.post('/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(422).json({error: "Enter all fields correctly."});
        }

        const user:any = await User.findOne({email: email});

        if(!user) return res.status(404).json({error: "User not found."});

        const passwordCheck = await bcrypt.compare(password, user.password);

        if(!passwordCheck) return res.status(422).json({error: "Invalid password."})
        
        const secret = process.env.SECRET;

        const token = jsonwebtoken.sign({
            id: user._id,
        }, secret!);

        return res.status(200).json({data: {username: user.username, user_id: user._id, token: token}});
    } catch (err) {
        return res.status(500).json({error: err});
    }
});

routes.get('/images/:user_id', async (req, res) => {
    try {
        const images = await Image.find({'user_id': req.params.user_id})
        return res.status(200).json(images);
    } catch (err) {
        return res.status(500).json({error: err});
    }
});

routes.post('/image/create/:user_id', uploadFile.single('img'), (req, res) => {
    try {
        if(!req.file) return res.status(422).json({error: "Insert a image."});
        // if(file_type_not_allowed != null) return res.status(200).json({data: file_type_not_allowed});
        
        try {
            const img = new Image({
                name: req.file.filename,
                user_id: req.params.user_id,
            });
    
            img.save();
        } catch (err) {
            return res.status(500).json({error: err});
        }

        return res.status(200).json({data: "Uploaded the file successfully: " + req.file.filename});
    } catch (err) {
        return res.status(500).json({error: err});
    }
});
