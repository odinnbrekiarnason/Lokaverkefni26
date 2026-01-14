import {NextFunction, Request, Response} from 'express'
import { addFunds, getUserById } from '../services/getters/userGetters.js';

export const addFundsCtrl = async(req: Request, res: Response, next: NextFunction) => {
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
    const uN = result.user_name;
    const wallet = result.wallet;

    return res.status(200).json({
      success: true, 
      message: 'Funds have been added to you account!',
      user_name: uN,
      wallet: wallet
    });
  } catch(e) {
    next(e);
  }
}
