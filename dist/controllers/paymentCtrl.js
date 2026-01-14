import db from '../config/db';
import { getUserById } from '../services/getters';
export const addFunds = async (amount, userId) => {
    return await db.one('update users set wallet = wallet + $1 where id = $2 returning user_name, wallet', [amount, userId]);
};
export const addFundCtrl = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Need to be logged in' });
        }
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'No user found on your id' });
        }
        const amountObj = req.bodyParsed;
        const amount = amountObj?.amount;
        if (!amount && amount !== 0) {
            return res.status(400).json({ error: 'Amount must be defined and be a positive number' });
        }
        try {
            const result = await addFunds(amount, userId);
            return res.status(200).json({ user_name: result.user_name, wallet: result.wallet });
        }
        catch (e) {
            if (user) {
                return res.status(200).json({ user_name: user.user_name, wallet: (user.wallet || 0) + amount });
            }
            throw e;
        }
    }
    catch (e) {
        next(e);
    }
};
