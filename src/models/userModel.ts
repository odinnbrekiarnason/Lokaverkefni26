import db from '../config/db.js'
import { CreateUserType, EditUserType } from '../config/schemas.js';
import { User } from '../config/typesAndInterfaces.js';
import { getUserById } from '../services/getters/userGetters.js';
//==================================================================================================

export const createUser = async (user: CreateUserType): Promise<User> => {
  return await db.one(
    'insert into users (user_name, email, password_hash, wallet) values ($1, $2, $3, $4) returning *',
    [ user.user_name, user.email, user.password_hash, user?.wallet ?? 5000]
  );
}

//==================================================================================================

export const editUser = async(user: EditUserType, userId: number, email: string): Promise<User | null> => {
  const userObject = await getUserById(userId);
  const query: string[] = [];
  const params: any[] = [];
  let i = 1;

  if (user.user_name !== undefined) {
    query.push(`user_name = $${i}`);
    params.push(user.user_name);
    i++;
  }

  if (user.email !== undefined) {
    query.push(`email = $${i}`);
    params.push(user.email);
    i++;
  }

  if (user.password_hash !== undefined) {
    query.push(`password_hash = $${i}`);
    params.push(user.password_hash);
    i++;
  }

  if (query.length === 0) {
    console.log('editUser error nothing input');
    return null;
  }

  const setQuery = ['updated_at = now()', ...query].join(', ');

  const sql = `update users set ${setQuery} where id = ${userObject?.id} and email = '${email}' returning id, user_name, email, user_role, wallet, created_at, updated_at`;
  const result = await db.oneOrNone<User>(sql, params);
  return result;
}

//==================================================================================================

export const deleteUser = async(userId: number, userEmail: string): Promise<void | null> => {
  return await db.none('delete from users where id = $1 and email = $2', [userId, userEmail]);
}

//==================================================================================================

