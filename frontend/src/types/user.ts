export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  bookings: number;
  user_group: string;
  created_at: string;
  is_active: boolean;
} 

export interface UserDocument {
  id: number;
  document: string;
  created_at: string;
  updated_at: string;
}
