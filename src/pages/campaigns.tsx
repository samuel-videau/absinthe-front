'use client'

import { FormEvent, useState } from "react";
import { useApi } from "@/libs/useApi";

export default function Campaigns({ userId }: {userId: string}) {
  const [campaignName, setCampaignName] = useState<string>("");
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { createCampaign } = useApi();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!campaignName) return;
    setLoading(true);

    try {
      const campaign = await createCampaign({ name: campaignName, userId, startDate: new Date() });
      setCampaignId(campaign.id);
      setCampaignName("");
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }

    setLoading(false);
  };

  return (
    <div>
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

      {campaignId && (
        <div className="mt-4 bg-white p-4 rounded shadow w-full max-w-md">
          <p className="text-gray-700">Campaign ID: {campaignId}</p>
        </div>
      )}
    </div>
  );
}
