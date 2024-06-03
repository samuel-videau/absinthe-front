import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLocalStorage, STORAGE_KEY } from '@/libs/useLocalStorage';
import { useApi } from "@/libs/useApi";
import { setUser } from '@/store/user-reducer';
import { useAppDispatch } from '@/store/hooks';
import Modal from "@/components/modal";

export default function Navbar() {
  const [userId, setUserId] = useState<string | null>(null);
  const { createUser } = useApi();
  const { getValue, setValue } = useLocalStorage();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [modal, setModal] = useState<{ type: 'success' | 'error', title: string, message: string, subMessage?: string } | null>(null);

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
    setLoading(true);
    if (!isConnected()) {
      try {
        const user = await createUser();
        setUserId(user.id);
        setValue(STORAGE_KEY.USER_ID, user.id);
      } catch (error) {
        console.error("Failed to create account:", error);
        setModal({ type: 'error', title: 'Failed to create account', message: 'There was an error creating your account. Please try again.' });
      }
    } else {
      setUserId(null);
      setValue(STORAGE_KEY.USER_ID, '');
      dispatch(setUser({id: ''}));
    }
    setLoading(false);
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <nav className="bg-blue-600 py-4 text-white flex justify-between px-4">
      {modal && <Modal type={modal.type} title={modal.title} message={modal.message} subMessage={modal.subMessage} onClose={closeModal} />}
      <div className="flex space-x-4">
        <Link href="/campaigns" className="hover:underline">Campaigns</Link>
        <Link href="/keys" className="hover:underline">Keys</Link>
      </div>
      <button
        onClick={handleConnect}
        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Processing..." : isConnected() ? 'Disconnect' : 'Create Account'}
      </button>
    </nav>
  );
}
