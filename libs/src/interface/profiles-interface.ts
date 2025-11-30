export interface ProfilesInterface {
  id: string;
  user_id: string;
  address: string;
  phone: string;
  date_of_birth: string;
  created_at: Date;
  updated_at: Date;
}

export type PublicProfilesInterface = Omit<
  ProfilesInterface,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;
