'use client'

import { useApi } from "@/libs/useApi";
import { STORAGE_KEY, useLocalStorage } from "@/libs/useLocalStorage";
import { Campaign } from "@/types/campaign";
import { FormEvent, Key, useState, useEffect } from "react";
import { Points, AbsintheSdk } from 'sam-absinthe-sdk';

export default function Home() {
  const [keyData, setKeyData] = useState<Partial<Key>>();
  const [campaignData, setCampaignData] = useState<Partial<Campaign>>();
  const [pointData, setPointData] = useState<Partial<Points>>();
  const [absintheSdk, setAbsintheSdk] = useState<AbsintheSdk | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const isConnected = () => !!userId;

  const { createUser } = useApi();
  const { getValue, setValue } = useLocalStorage();

  useEffect(() => {
    const init = async () => {
      const userId = getValue(STORAGE_KEY.USER_ID);
      console.log("User ID:", userId);
      if (userId) {
        setUserId(userId);
      }
    }

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
    }
  };

  return (
    <main className="flex flex-col items-center p-4">
      <div className="flex items-center space-x-2">
        <div className={`w-4 h-4 rounded-full ${isConnected() ? 'bg-green-500' : 'bg-red-500'}`}></div>
        {isConnected() && <span>ID: {userId}</span>}
      </div>
      <button
        onClick={handleConnect}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        {isConnected() ? 'Disconnect' : 'Connect'}
      </button>
    </main>
  );
}
