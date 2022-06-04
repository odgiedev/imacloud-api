import express from 'express';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

import { User } from './models/User';

export const routes = express.Router();

function checkToken(req:any, res:any, next:any) {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
    
        if(!token) return res.status(401).json({data: "Access denied."});

        const secret = process.env.SECRET;

        jsonwebtoken.verify(token, secret!);

        next();
        
    } catch (err) {
        return res.status(500).json({error: err});
    }
};

routes.get('/', checkToken, async (req, res) => {
    const all = await User.find({});
    return res.status(200).json(all);
});

routes.post('/user/create', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
    
        if(!username || !email || !password || confirmPassword != password) {
            return res.status(422).json({data: "Enter all fields correctly."});
        }
    
        const userExists = await User.findOne({ email: email });

        if(userExists) return res.status(422).json({data: "Email already in use."});

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
            return res.status(422).json({data: "Enter all fields correctly."});
        }

        const user = await User.findOne({email: email});

        if(!user) return res.status(404).json({data: "User not found."});

        const passwordCheck = await bcrypt.compare(password, user.password);

        if(!passwordCheck) return res.status(422).json({data: "Invalid password."})
        
        const secret = process.env.SECRET;

        const token = jsonwebtoken.sign({
            id: user._id,
        }, secret!);

        return res.status(200).json({data: "Successfully authenticated.", token });
    } catch (err) {
        return res.status(500).json({error: err});
    }
})
