'use client'

import { useState } from "react";
import { useApi } from "@/libs/useApi";
import { KEY_PERMISSION } from "@/types/key";

export default function Keys({ userId }: {userId: string}) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { createKey } = useApi();

  const handleCreateKey = async () => {
    setLoading(true);

    try {
      const keyResponse = await createKey({ permissions: [KEY_PERMISSION.FULL], userId });
      setApiKey(keyResponse.apiKey);
    } catch (error) {
      console.error("Failed to create key:", error);
    }

    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleCreateKey}
        className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700"
      >
        Create Key (Full Permissions)
      </button>

      {apiKey && (
        <div className="mt-4 bg-white p-4 rounded shadow w-full max-w-md">
          <p className="text-gray-700">API Key:</p>
          <p className="break-all whitespace-pre-wrap text-xs text-slate-400">{apiKey}</p>
        </div>
      )}
    </div>
  );
}
