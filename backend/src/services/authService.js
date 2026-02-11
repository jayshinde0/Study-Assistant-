import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuthService {
  async register(name, email, password) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    return { user: { id: user._id, name: user.name, email: user.email }, token };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    return { user: { id: user._id, name: user.name, email: user.email }, token };
  }

  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}

export default new AuthService();
