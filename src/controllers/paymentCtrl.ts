import {NextFunction, Request, Response} from 'express'
import db from '../config/db.js'
import { User } from '../config/typesAndInterfaces.js';
import { getUserById } from '../services/getters/userGetters.js';

export const addFunds = async(amount: number, userId: number): Promise<Partial<User>> => {
  return await db.one<Partial<User>>('update users set wallet = wallet + $1 where id = $2 returning user_name, wallet', [amount, userId]);
}

export const addFundCtrl = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const userId = req.user?.id;
    if(!userId) {
      return res.status(401).json({error: 'Need to be logged in'});
    }
    const user = await getUserById(userId);
    if(!user) {
      return res.status(404).json({error: 'No user found on your id'});
    }
    
    const amount = req.bodyParsed.amount;
    const amountNumber = parseInt(amount);

    if(!amount || amount === 0) {
      return res.status(400).json({error: 'Amount must be defined and be a positive number'});
    }

    const result = await addFunds(amountNumber, userId);
    console.log(result);
    return res.status(200).json({
      success: true, 
      message: 'Funds have been added to you account!',
      result: result
    });
  } catch(e) {
    next(e);
  }
}
