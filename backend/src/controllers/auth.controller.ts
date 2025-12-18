import { Request, Response} from 'express';
import User from '../model/user.model.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const authController = {
    register: async(req: Request, res: Response) => {
       try {
         const { email, password, name } = req.body;
 
         if (!email || !password || !name) {
             res.status(400).json({ message: 'Please provide email, password and name' });
             return;
         }
 
         const existingUser = await User.findOne({ email });
         if (existingUser) {
             res.status(400).json({ message: 'User already exists with this email' });
             return;
         }
 
         const payload = { email, password, name };
         const newUser = await User.create(payload)
 
          res.status(201).json({
             message: 'User registered successfully',
             newUser
         });
       } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
       }
    },

    login: async(req: Request, res: Response) => {
        try {
            const {email, password} = req.body;
            if (!email || !password) {
                res.status(400).json({ message: 'Please provide email and password' });
                return;
            }
            const user = await User.findOne({ email, password }).select('-password');
            if (!user) {
                res.status(401).json({ message: 'Invalid email or password' });
                return;
            }
            const token = jwt.sign({id : user._id}, config.jwtSecret);
            res.status(200).json({
                message: 'Login successful',
                token,
                user
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    },

    getMe: async(req: Request, res: Response) => {
        try {
            // @ts-ignore
            const userId = req.userId;
            const user = await User.findById(userId).select('-password')
            if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ user });
        } catch (error) {
            console.error('GetMe error:', error);
            res.status(500).json({ message: 'Server error during fetching user data' });
        }
    }
}

export default authController;