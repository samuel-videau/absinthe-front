'use client'

import Modal from "@/components/modal";
import { useState } from "react";
import { useApi } from "@/libs/useApi";
import { KEY_PERMISSION } from "@/types/key";
import { useAppSelector } from "@/store/hooks";

export default function Keys() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<string>("");
  const [campaignId, setCampaignId] = useState<string>("");
  const [permissions, setPermissions] = useState<KEY_PERMISSION[]>([]);
  const [modal, setModal] = useState<{ type: 'success' | 'error', title: string, message: string } | null>(null);

  const user = useAppSelector((state) => state.user);

  const { createKey } = useApi();

  const handleCreateKey = async () => {
    setLoading(true);

    try {
      console.log("endDate", endDate);
      console.log("permissions", permissions);
      console.log("userId", user);
      console.log("campaignId", campaignId);
      const keyResponse = await createKey({
        endDate: endDate ? new Date(endDate) : undefined,
        permissions,
        userId: user.id,
        campaignId: campaignId ? parseInt(campaignId) : undefined,
      });
      setApiKey(keyResponse.apiKey);
      setModal({ type: 'success', title: 'Success', message: 'API Key successfully created!' });
    } catch (error) {
      console.error("Failed to create key:", error);
      setModal({ type: 'error', title: 'Failed to create the key', message: (error as any).response.data.message });
    }

    setLoading(false);
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

  return (
    <div className="min-h-screen text-black flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Create API Key</h2>

        {modal && <Modal type={modal.type} title={modal.title} message={modal.message} onClose={closeModal} />}

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
          className="w-full mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Key"}
        </button>

        {apiKey && (
          <div className="mt-4 bg-gray-50 p-4 rounded shadow">
            <p className="text-gray-700 font-semibold">API Key:</p>
            <p className="break-all whitespace-pre-wrap text-xs text-slate-400">{apiKey}</p>
          </div>
        )}
      </div>
    </div>
  );
}
