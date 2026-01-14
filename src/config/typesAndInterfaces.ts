import { user_role } from "./schemas.js"

//===============================================================================================
//
//                                            TYPES
//
//===============================================================================================
export type payloadToken = {
  sub: number
  user_name: string
  role: user_role
}
//===============================================================================================
export type Category = {
  id: number
  categoryName: string
  createdAt: Date | string
}
//===============================================================================================
//
//                                          INTERFACES
//
//===============================================================================================
export interface User {
  id: number
  user_name: string
  email: string
  password_hash: string
  user_role: user_role
  wallet: number
  createdAt: Date | string
  updatedAt: Date | string
}
//===============================================================================================
export interface UserWoPw {
  id: number
  user_name: string
  email: string
  user_role: user_role
  wallet: number
  createdAt: Date | string
  updatedAt: Date | string
}
//===============================================================================================
export interface Admin {
  id: number
  user_name: string
  email: string
  password_hash: string
  user_role: user_role
  createdAt: Date | string
}
//===============================================================================================
export interface Event {
  id: number
  name: string
  date: Date | string
  description: string
  venue_id: number 
  category_id: number
  created_at: Date | string
}
//===============================================================================================
export interface Venue {
  id: number
  name: string
  city: string
  address: string
  capacity: number
}
//===============================================================================================
export interface Bookings {
  id: number
  user_id: number
  event_id: number
  ticket_id: number
  quantity: number
  created_at: Date | string
}
//===============================================================================================
export interface Ticket {
  id: number
  event_id: number
  price: number
  quantity_available: number
}
//===============================================================================================

