'use client'

import Modal from "@/components/modal";
import { useEffect, useState } from "react";
import { useApi } from "@/libs/useApi";
import { KEY_PERMISSION, Key } from "@/types/key";
import { useAppSelector } from "@/store/hooks";

export default function Keys() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<string>("");
  const [campaignId, setCampaignId] = useState<string>("");
  const [permissions, setPermissions] = useState<KEY_PERMISSION[]>([KEY_PERMISSION.FULL]);
  const [modal, setModal] = useState<{ type: 'success' | 'error', title: string, message: string, subMessage?: string } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const user = useAppSelector((state) => state.user);

  const { createKey, findKeys } = useApi();

  useEffect(() => {
    if (user.id) fetchKeys();    
  }, [user.id]);

  const fetchKeys = async () => {
    try {
      console.log("Fetching keys for user:", user.id);
      const keysResponse = await findKeys(user.id);
      setKeys(keysResponse);
    } catch (error) {
      console.error("Failed to fetch keys:", error);
    }
  };

  const handleCreateKey = async () => {
    setLoading(true);

    try {
      const keyResponse = await createKey({
        endDate: endDate ? new Date(endDate) : undefined,
        permissions,
        userId: user.id,
        campaignId: campaignId ? parseInt(campaignId) : undefined,
      });
      setModal({ type: 'success', title: 'API Key successfully created!', message: `Copy this key, you won't be able to get it back.`, subMessage: keyResponse.apiKey });
      setCampaignId("");
      setPermissions([KEY_PERMISSION.FULL]);
      setEndDate("");
      await fetchKeys();
    } catch (error) {
      console.error("Failed to create key:", error);
      setModal({ type: 'error', title: 'Failed to create the key', message: (error as any).response.data.message });
    }

    setLoading(false);
    setIsFormOpen(false);
  };

  const handlePermissionChange = (permission: KEY_PERMISSION) => {
    setPermissions((prevPermissions) =>
      prevPermissions.includes(permission)
        ? prevPermissions.filter((perm) => perm !== permission)
        : [...prevPermissions, permission]
    );
  };

  const closeModal = () => {
    setModal(null);
  };

  if (!user.id) {
    return (
      <div className="min-h-screen text-black flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-center">You need to create an account to use the page</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black flex flex-col items-center justify-center bg-gray-100">
      {modal && <Modal type={modal.type} title={modal.title} message={modal.message} subMessage={modal.subMessage} onClose={closeModal} />}

      <h2 className="text-2xl font-semibold mb-4 text-center">Your API Keys</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        {keys.length === 0 ? (
          <p className="text-gray-700">No API Keys found.</p>
        ) : (
          <ul className="space-y-2">
            {keys.map((key) => (
              <li key={key.id} className="bg-gray-50 p-4 rounded shadow text-xs text-slate-400 break-all">
                <p><strong>ID:</strong> {key.id.slice(0, 8)}...</p>
                <p><strong>Created At:</strong> {new Date(key.createdAt).toLocaleString()}</p>
                <p><strong>End Date:</strong> {key.endDate ? new Date(key.endDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Permissions:</strong> {key.permissions.join(', ')}</p>
                {key.campaign && (
                  <p><strong>Campaign:</strong> {key.campaign.name} (ID: {key.campaign.id})</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-8 right-8 bg-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl hover:bg-purple-700"
      >
        +
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">Create API Key</h2>

            <div className="mb-4">
              <label className="block text-gray-700">End Date (Optional):</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Campaign ID (Optional):</label>
              <input
                type="number"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Permissions:</label>
              {Object.values(KEY_PERMISSION).map((permission) => (
                <div key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    id={permission}
                    checked={permissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                    className="mr-2"
                  />
                  <label htmlFor={permission}>{permission}</label>
                </div>
              ))}
            </div>

            <button
              onClick={handleCreateKey}
              className="w-full mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              disabled={loading || permissions.length === 0}
            >
              {loading ? "Creating..." : "Create Key"}
            </button>

            <button
              onClick={() => setIsFormOpen(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
