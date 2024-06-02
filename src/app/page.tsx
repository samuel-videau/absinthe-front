'use client'

import { useApi } from "@/libs/useApi";
import { STORAGE_KEY, useLocalStorage } from "@/libs/useLocalStorage";
import { Campaign } from "@/types/campaign";
import { KEY_PERMISSION } from "@/types/key";
import { FormEvent, Key, useState, useEffect } from "react";
import { Points, AbsintheSdk } from 'sam-absinthe-sdk';

export default function Home() {
  const [keyData, setKeyData] = useState<Partial<Key>>();
  const [campaignData, setCampaignData] = useState<Partial<Campaign>>();
  const [userId, setUserId] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [pointsForm, setPointsForm] = useState({
    campaignId: '',
    apiKey: '',
    address: '',
    points: '',
    eventName: '',
    metadata: ''
  });

  const isConnected = () => !!userId;

  const { createUser, createCampaign, createKey } = useApi();
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
    setLoading(true);
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
      setCampaignId(null);
      setValue(STORAGE_KEY.USER_ID, '');
    }
    setLoading(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isConnected() || !campaignName) return;
    setLoading(true);

    try {
      const campaign = await createCampaign({ name: campaignName, userId: userId!, startDate: new Date() });
      setCampaignId(campaign.id);
      setCampaignName("");
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }

    setLoading(false);
  };

  const handleCreateKey = async () => {
    setLoading(true);

    try {
      const keyResponse = await createKey({ permissions: [KEY_PERMISSION.FULL], userId: userId! });
      setApiKey(keyResponse.apiKey);
    } catch (error) {
      console.error("Failed to create key:", error);
    }

    setLoading(false);
  };

  const handlePointsSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const { campaignId, apiKey, address, points, eventName, metadata } = pointsForm;
    if (!campaignId || !apiKey || !address || !points || !eventName) return;

    try {
      const absintheSdk = new AbsintheSdk(apiKey, Number(campaignId));
      const pointsData = {
        points: Number(points),
        address,
        eventName,
        metadata: metadata ? JSON.parse(metadata) : undefined
      };
      const pointsResponse = await absintheSdk.distribute("points", pointsData);
      console.log("Points Response:", pointsResponse);
      setPointsForm({
        campaignId: pointsForm.campaignId,
        apiKey: pointsForm.apiKey,
        address: '',
        points: '',
        eventName: '',
        metadata: ''
      });
    } catch (error) {
      console.error("Failed to add points:", error);
    }

    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPointsForm(prevState => ({ ...prevState, [name]: value }));
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center">
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
        </div>
      )}

      <header className="bg-blue-600 w-full py-4 text-white flex justify-center">
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-full ${isConnected() ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {isConnected() && <span>ID: {userId}</span>}
        </div>
        <button
          onClick={handleConnect}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          {isConnected() ? 'Disconnect (cannot reconnect for now :/)' : 'Create Account'}
        </button>
      </header>

      <main className="container mx-auto p-4 flex flex-col items-center">
        {isConnected() && (
          <>
            <form onSubmit={handleSubmit} className="mt-4 w-full max-w-md">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Campaign Name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="px-4 py-2 border rounded w-full text-black"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                >
                  Create Campaign
                </button>
              </div>
            </form>
            <button
              onClick={handleCreateKey}
              className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700"
            >
              Create Key (Full Permissions)
            </button>

            <form onSubmit={handlePointsSubmit} className="mt-4 w-full max-w-md">
              <div className="flex flex-col space-y-2">
                <input
                  type="number"
                  name="campaignId"
                  placeholder="Campaign ID"
                  value={pointsForm.campaignId}
                  onChange={handleInputChange}
                  className="px-4 py-2 border rounded w-full text-black"
                />
                <input
                  type="text"
                  name="apiKey"
                  placeholder="API Key"
                  value={pointsForm.apiKey}
                  onChange={handleInputChange}
                  className="px-4 py-2 border rounded w-full text-black"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={pointsForm.address}
                  onChange={handleInputChange}
                  className="px-4 py-2 border rounded w-full text-black"
                />
                <input
                  type="number"
                  name="points"
                  placeholder="Number of Points"
                  value={pointsForm.points}
                  onChange={handleInputChange}
                  className="px-4 py-2 border rounded w-full text-black"
                />
                <input
                  type="text"
                  name="eventName"
                  placeholder="Event Name"
                  value={pointsForm.eventName}
                  onChange={handleInputChange}
                  className="px-4 py-2 border rounded w-full text-black"
                />
                <textarea
                  name="metadata"
                  placeholder="Metadata (JSON)"
                  value={pointsForm.metadata}
                  onChange={handleInputChange}
                  className="px-4 py-2 border rounded w-full text-black"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Add Points
                </button>
              </div>
            </form>
          </>
        )}

        {campaignId && (
          <div className="mt-4 bg-white p-4 rounded shadow w-full max-w-md">
            <p className="text-gray-700">Campaign ID: {campaignId}</p>
          </div>
        )}

        {apiKey && (
          <div className="mt-4 bg-white p-4 rounded shadow w-full max-w-md">
            <p className="text-gray-700">API Key:</p>
            <p className="break-all whitespace-pre-wrap text-xs text-slate-400">{apiKey}</p>
          </div>
        )}
      </main>

      <style jsx>{`
        .loader {
          border-top-color: #3498db;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
