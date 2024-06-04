import express from "express";
import {
  walletConnect,
  writeHistory,
} from "../controller/Controller";
import jwt,{JwtPayload} from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const generateToken = (payload: string | object | Buffer) => {
  return jwt.sign(payload, 'your_secret_key', { expiresIn: '1h' });
};
const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, 'your_secret_key') as JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

router.use(apiLimiter)




router.post("/history", apiLimiter, async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const { userId } = decoded;
    console.log('Authenticated user ID:', userId);

    await writeHistory(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/walletConnect", apiLimiter, async (req, res, next) => {
  try {
    await walletConnect(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
