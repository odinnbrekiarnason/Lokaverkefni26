import db from '../../config/db.js'
import { Category } from '../../config/typesAndInterfaces.js'

//===============================================================================================

export const getAllCategories = async(): Promise<Category[]> => {
  return await db.many('select * from categories');
}

//===============================================================================================

export const getCategoryById = async(id: number): Promise<Category | null> => {
  return await db.oneOrNone('select * from categories where id = $1', [id]);
}
