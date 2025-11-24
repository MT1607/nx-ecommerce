export interface UserInterface {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  type: 'admin' | 'guest';
}

export type PublicUserInterface = Omit<UserInterface, 'password'>;
