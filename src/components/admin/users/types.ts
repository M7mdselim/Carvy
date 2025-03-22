
export interface Profile {
  id: string;
  email: string;
  is_admin: boolean | null;
  owner_id: string | null;
  created_at: string;
  username?: string | null;
}

export interface NewUserForm {
  email: string;
  password: string;
  isAdmin: boolean;
  isOwner: boolean;
  ownerId: string;
}
