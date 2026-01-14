import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {NextFunction, Request, Response} from 'express'
import { createUser, deleteUser, editUser } from '../models/userModel.js';
import { payloadToken }  from '../config/typesAndInterfaces.js';
import { CreateUserType, deleteUserTypeBody, EditUserType, IdParam, LoginType } from '../config/schemas.js';
import { getMyEvents, getUserByEmail, getUserById, getUserByIdWoPw } from '../services/getters/userGetters.js';
import { getBookingsMadeByUser } from '../services/getters/bookingGetters.js';
import { getEventIdByBookingId } from '../services/getters/eventGetters.js';



export const signup = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const JWT_SECRET = process.env.JWT_SECRET;
    const ROUNDS = process.env.ROUNDS;
    const ROUNDS_NUM = ROUNDS ? parseInt(ROUNDS) : 12;

    if(!JWT_SECRET) {
      return res.status(400).json({error: 'JWT_SECRET is missing from enviroment'});
    }

    const { email, user_name, password_hash }: CreateUserType = req.bodyParsed;
    const wallet = req.bodyParsed?.wallet ?? 10000;

    const checkEmail = await getUserByEmail(email);
    if(checkEmail?.email !== undefined) {
      return res.status(409).json({error: 'Cannot register on existing email'});
    }
  
    const hashedPassword = await bcrypt.hash(password_hash, ROUNDS_NUM);
  
    const newUser: CreateUserType = {
      user_name,
      email,
      password_hash: hashedPassword,
      userRole: 'User',
      wallet
    } 
    
    const userCreated = await createUser(newUser);
    const {password_hash: _, ...safeUser} = userCreated;
  
    return res.status(201).json({sucess: true, user: safeUser});
  } catch(e: any) {
    console.error(e);
    next(e);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const JWT_SECRET = process.env.JWT_SECRET;
    if(!JWT_SECRET) {
      return res.status(400).json({ error: 'JWT_SECRET missing from enviroment' });
    }

    const { email, password_hash }: LoginType = req.bodyParsed

    
    const user = await getUserByEmail(email);
    if(!user) {
      return res.status(401).json({ error: 'incorrect email and password' });
    }

    const isPasswordValid = await bcrypt.compare(password_hash, user.password_hash);
    if(!isPasswordValid) {
      return res.status(401).json({ error: 'incorrect email and password' });
    }

    const payload: payloadToken = {
      user_name: user.user_name,
      sub: user.id,
      role: user.user_role
    }

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h'
    });

    return res.json({ success: true, token: token });
  } catch (e: any) {
    console.error(e);
    next(e);
  }
};

export const editUserCtrl = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const ROUNDS = process.env.ROUNDS;
    const ROUNDS_NUM = ROUNDS ? parseInt(ROUNDS) : 12;

    const filters: EditUserType = req.bodyParsed;
    const userId = req.user?.id;
    const isCorrectId = req.paramsParsed.id == userId;
    
    if(userId === undefined || req.user?.role === 'Guest') {
      return res.status(403).json({error: 'Must be logged in to continue'});
    }
    
    const user = await getUserById(userId);
    if(!user) {
      return res.status(404).json({error: 'User not found: ID invalid'});
    }

    if(!isCorrectId) {
      return res.status(403).json({error: 'Id provided does not match with your userId'});
    }

    if(Object.keys(filters).length === 0) {
      return res.status(400).json({error: 'Filters cannot be empty'});
    }

    if(filters.password_hash) { 
      const newHashedPw = await bcrypt.hash(filters.password_hash, ROUNDS_NUM);
      filters.password_hash = newHashedPw
    }

    const safeUser = await editUser(filters, userId, user.email);
    if(safeUser === null) {
      const user = await getUserByIdWoPw(userId);
      return res.status(400).json({error: `No changes made returning user`, user: user});
    }

    return res.status(200).json({success: true , updatedUser: safeUser});
  } catch(e: any) {
    console.error(e);
    next(e);
  }
}

export const deleteUserCtrl = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const {email, password_hash}: deleteUserTypeBody = req.bodyParsed;
    const {id}: IdParam = req.paramsParsed;
  
    if(!email || !password_hash || !id) {
      return res.status(401).json({error: 'Email, Password and ID are required to delete account'});
    }

    const existing = await getUserByEmail(email);
    const existingId = await getUserById(id);
    
    if(existing === null || existingId === null) {
      return res.status(404).json({error: 'User not found: invalid ID or email'});
    }
    
    const isPasswordValid = await bcrypt.compare(password_hash, existing.password_hash);
    if(!isPasswordValid) {
      return res.status(401).json({error: 'Incorrect email and password'})
    } 

    await deleteUser(id, email);

    return res.status(200).json({message: 'Account successfully deleted'});
  } catch(e: any) {
    console.error(e);
    next(e);
  }
}

export const getMyInfo = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const user = req.user;
    if(!user) {
      return res.status(401).json({error: 'Need to be logged in to access'});
    }

    const data = await getUserByIdWoPw(user.id);
    if(!data) {
      return res.status(404).json({error: 'User not found on registered ID'});
    }

    return res.status(200).json({user: data});
  } catch(e) {
    next(e);
  }
}

export const getMyEventsAndBookingsCtrl = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const user = req.user;
    if(!user) {
      return res.status(401).json({error: 'Need tot be logged in to access'});
    }
    
    const id = user.id;
    if(id === 0) {
      return res.status(403).json({error: 'You have no bookings as a guest'});
    }
    
    const result = await getMyEvents(id);
    return res.status(200).json({data: result});
  } catch(e) {
    next(e);
  }
}