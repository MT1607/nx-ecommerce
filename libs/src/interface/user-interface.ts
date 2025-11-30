export interface UserInterface {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  type: 'admin' | 'guest';
  created_at: Date;
  updated_at: Date;
}

export type PublicUserInterface = Omit<
  UserInterface,
  'password' | 'created_at' | 'updated_at'
>;
