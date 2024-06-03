'use client'

import { useEffect, useState, FormEvent } from "react";
import { useAppSelector } from "@/store/hooks";
import { useApi } from "@/libs/useApi";
import Modal from "@/components/modal";
import { Campaign, CAMPAIGN_STATUS } from "@/types/campaign";
import router from "next/router";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignName, setCampaignName] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [modal, setModal] = useState<{ type: 'success' | 'error', title: string, message: string } | null>(null);

  const userId = useAppSelector((state) => state.user.id);
  const { createCampaign, findAllCampaigns, updateCampaign } = useApi();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignsResponse = await findAllCampaigns(userId);
        setCampaigns(campaignsResponse);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      }
    };
    if (userId) {
      fetchCampaigns();
    }
  }, [userId, findAllCampaigns]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!campaignName) return;
    setLoading(true);

    try {
      const campaign = await createCampaign({
        name: campaignName,
        userId,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
      });
      setCampaigns((prevCampaigns) => [...prevCampaigns, campaign]);
      setModal({ type: 'success', title: 'Success', message: 'Campaign successfully created!' });
      setCampaignName("");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Failed to create campaign:", error);
      setModal({ type: 'error', title: 'Failed to create the campaign', message: (error as any).response.data.message });
    }

    setLoading(false);
    setIsFormOpen(false);
  };

  const handleStatusToggle = async (campaign: Campaign) => {
    const newStatus = campaign.status === CAMPAIGN_STATUS.ON ? CAMPAIGN_STATUS.OFF : CAMPAIGN_STATUS.ON;
    try {
      await updateCampaign(campaign.id, { userId, status: newStatus });
      setCampaigns((prevCampaigns) =>
        prevCampaigns.map((c) => (c.id === campaign.id ? { ...c, status: newStatus } : c))
      );
      setModal({ type: 'success', title: 'Success', message: `Campaign ${campaign.name} turned ${newStatus === CAMPAIGN_STATUS.ON ? 'ON' : 'OFF'}.` });
    } catch (error) {
      console.error("Failed to update campaign status:", error);
      setModal({ type: 'error', title: 'Failed to update campaign status', message: (error as any).response.data.message });
    }
  };

  const closeModal = () => {
    setModal(null);
  };

  const navToCampaign = (id: string) => {
    router.push(`/campaigns/${id}`);
  }

  return (
    <div className="min-h-screen text-black flex flex-col items-center justify-center bg-gray-100">
      {modal && <Modal type={modal.type} title={modal.title} message={modal.message} onClose={closeModal} />}

      <h2 className="text-2xl font-semibold mb-4 text-center">Your Campaigns</h2>

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        {campaigns.length === 0 ? (
          <p className="text-gray-700">No campaigns found.</p>
        ) : (
          <ul className="space-y-2">
            {campaigns.map((campaign) => (
              //clickable
              <li key={campaign.id}>
                <div onClick={() => navToCampaign(campaign.id.toString())} className="bg-gray-50 p-4 rounded shadow text-sm text-slate-700 hover:bg-gray-100 cursor-pointer">
                <p><strong>ID:</strong> {campaign.id}</p>
                <p><strong>Name:</strong> {campaign.name}</p>
                <p><strong>Created At:</strong> {new Date(campaign.createdAt).toLocaleString()}</p>
                <p><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Status:</strong> {CAMPAIGN_STATUS[campaign.status]}</p>
                <button
                  onClick={() => handleStatusToggle(campaign)}
                  className={`mt-2 px-4 py-2 rounded text-white ${campaign.status === CAMPAIGN_STATUS.ON ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'}`}
                >
                  {campaign.status === CAMPAIGN_STATUS.ON ? 'Turn Off' : 'Turn On'}
                </button>
                </div>
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
            <h2 className="text-2xl font-semibold mb-4 text-center">Create Campaign</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Campaign Name:</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="mt-1 p-2 border rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Start Date (Optional):</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 p-2 border rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">End Date (Optional):</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 p-2 border rounded w-full"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                disabled={loading || !campaignName}
              >
                {loading ? "Creating..." : "Create Campaign"}
              </button>

              <button
                onClick={() => setIsFormOpen(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
