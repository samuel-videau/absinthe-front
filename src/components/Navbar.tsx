import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLocalStorage, STORAGE_KEY } from '@/libs/useLocalStorage';
import { useApi } from "@/libs/useApi";
import { setUser } from '@/store/user-reducer';
import { useAppDispatch } from '@/store/hooks';

export default function Navbar() {
  const [userId, setUserId] = useState<string | null>(null);
  const { createUser } = useApi();
  const { getValue, setValue } = useLocalStorage();
  const dispatch = useAppDispatch();

  const isConnected = () => !!userId;

  useEffect(() => {
    const init = async () => {
      const userId = getValue(STORAGE_KEY.USER_ID);
      if (userId) {
        setUserId(userId);
        dispatch(setUser({id: userId}));
        console.log("User ID:", userId);
      }
    };
    init();
  }, []);

  const handleConnect = async () => {
    if (!isConnected()) {
      try {
        const user = await createUser();
        setUserId(user.id);
        setValue(STORAGE_KEY.USER_ID, user.id);
      } catch (error) {
        console.error("Failed to create account:", error);
      }
    } else {
      setUserId(null);
      setValue(STORAGE_KEY.USER_ID, '');
    }
  };

  return (
    <nav className="bg-blue-600 py-4 text-white flex justify-between px-4">
      <div className="flex space-x-4">
        <Link href="/campaigns" className="hover:underline">Campaigns</Link>
        <Link href="/keys" className="hover:underline">Keys</Link>
        <Link href="/points" className="hover:underline">Points</Link>
      </div>
      <button
        onClick={handleConnect}
        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        {isConnected() ? 'Disconnect' : 'Create Account'}
      </button>
    </nav>
  );
}
