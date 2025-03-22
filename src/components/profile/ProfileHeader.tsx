
import { UserIcon } from '@heroicons/react/24/outline';
import { User } from '@supabase/supabase-js';

interface ProfileHeaderProps {
  user: User;
  profile: { firstName: string; lastName: string; phoneNumber: string } | null;
}

export function ProfileHeader({ user, profile }: ProfileHeaderProps) {
  return (
    <div className="bg-indigo-600 px-6 py-8">
      <div className="flex items-center">
        <div className="h-20 w-20 rounded-full bg-indigo-300 flex items-center justify-center">
          <UserIcon className="h-10 w-10 text-indigo-700" />
        </div>
        <div className="ml-6 text-white">
          <h1 className="text-2xl font-bold">
            {profile?.firstName} {profile?.lastName}
          </h1>
          <p className="text-indigo-100">{user.email}</p>
          <p className="text-indigo-100 mt-1">{profile?.phoneNumber}</p>
        </div>
      </div>
    </div>
  );
}
