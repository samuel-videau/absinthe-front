'use client'

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/router";
import Modal from "@/components/modal";
import { useApi } from "@/libs/useApi";
import { Campaign, CAMPAIGN_STATUS } from "@/types/campaign";
import { AbsintheSdk, Points } from 'sam-absinthe-sdk';
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/globals";

export default function CampaignPage() {
  const router = useRouter();
  const { id } = router.query;
  const userId = useAppSelector((state) => state.user.id);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [points, setPoints] = useState<Points[]>([]); 
  const [pointsForm, setPointsForm] = useState({
    apiKey: '',
    address: '',
    points: '',
    eventName: '',
    metadata: ''
  });
  const [searchForm, setSearchForm] = useState({
    apiKey: '',
    address: '',
    eventName: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [modal, setModal] = useState<{ type: 'success' | 'error', title: string, message: string } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const { findCampaign, updateCampaign } = useApi();

  useEffect(() => {
    const fetchCampaign = async () => {
      if (id) {
        try {
          const campaignResponse = await findCampaign(Number(id));
          setCampaign(campaignResponse);
        } catch (error) {
          console.error("Failed to fetch campaign:", error);
        }
      }
    };
    fetchCampaign();
  }, [id]);

  const handlePointsSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const { apiKey, address, points, eventName, metadata } = pointsForm;
    if (!apiKey || !address || !points || !eventName) return;

    setLoading(true);

    try {
      const absintheSdk = new AbsintheSdk(apiKey, Number(id), API_URL);
      const pointsData = {
        points: Number(points),
        address,
        eventName,
        metadata: metadata ? JSON.parse(metadata) : undefined
      };
      const pointsResponse = await absintheSdk.distribute(pointsData.eventName, pointsData);
      console.log("Points Response:", pointsResponse);
      setPointsForm({
        apiKey: pointsForm.apiKey,
        address: '',
        points: '',
        eventName: '',
        metadata: ''
      });
      setModal({ type: 'success', title: 'Success', message: 'Points successfully added!' });
    } catch (error: any) {
      console.error("Failed to add points:", error);
      setModal({ type: 'error', title: 'Failed to add points.', message: error.response.data.message });
    }

    setLoading(false);
    setIsFormOpen(false);
  };

  const findPoints = async (event: FormEvent) => {
    event.preventDefault();
    const { apiKey, address, eventName } = searchForm;

    if (!apiKey || !address) return;

    setLoading(true);

    try {
      const absintheSdk = new AbsintheSdk(apiKey, Number(id), API_URL);
      const pointsResponse = await absintheSdk.getPoints(address, eventName);
      console.log("Points Response:", pointsResponse);
      setPoints(pointsResponse);
    } catch (error: any) {
      console.error("Failed to find points:", error);
      setModal({ type: 'error', title: 'Failed to find points.', message: error.response.data.message });
    }

    setLoading(false);
  };

  const handleStatusToggle = async () => {
    if (!campaign) return;
    const newStatus = campaign.status === CAMPAIGN_STATUS.ON ? CAMPAIGN_STATUS.OFF : CAMPAIGN_STATUS.ON;
    try {
      await updateCampaign(campaign.id, { userId, status: newStatus });
      setCampaign((prevCampaign) => (prevCampaign ? { ...prevCampaign, status: newStatus } : prevCampaign));
      setModal({ type: 'success', title: 'Success', message: `Campaign ${campaign.name} turned ${newStatus === CAMPAIGN_STATUS.ON ? 'ON' : 'OFF'}.` });
    } catch (error) {
      console.error("Failed to update campaign status:", error);
      setModal({ type: 'error', title: 'Failed to update campaign status', message: (error as any).response.data.message });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPointsForm(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchForm(prevState => ({ ...prevState, [name]: value }));
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <div className="min-h-screen text-black flex flex-col items-center justify-center bg-gray-100">
      {modal && <Modal type={modal.type} title={modal.title} message={modal.message} onClose={closeModal} />}
      
      {campaign ? (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-2xl font-semibold mb-4 text-center">Campaign Details</h2>
          <p><strong>ID:</strong> {campaign.id}</p>
          <p><strong>Name:</strong> {campaign.name}</p>
          <p><strong>Created At:</strong> {new Date(campaign.createdAt).toLocaleString()}</p>
          <p><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Status:</strong> {CAMPAIGN_STATUS[campaign.status]}</p>
          <button
            onClick={handleStatusToggle}
            className={`mt-2 px-4 py-2 rounded text-white ${campaign.status === CAMPAIGN_STATUS.ON ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'}`}
          >
            {campaign.status === CAMPAIGN_STATUS.ON ? 'Turn Off' : 'Turn On'}
          </button>
        </div>
      ) : (
        <p className="text-gray-700">Loading campaign details...</p>
      )}

      <form onSubmit={findPoints} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mt-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">Find Points</h2>
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            name="apiKey"
            placeholder="API Key"
            value={searchForm.apiKey}
            onChange={handleSearchInputChange}
            className="px-4 py-2 border rounded w-full text-black"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={searchForm.address}
            onChange={handleSearchInputChange}
            className="px-4 py-2 border rounded w-full text-black"
          />
          <input
            type="text"
            name="eventName"
            placeholder="Event Name (Optional)"
            value={searchForm.eventName}
            onChange={handleSearchInputChange}
            className="px-4 py-2 border rounded w-full text-black"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || !searchForm.apiKey || !searchForm.address}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {points.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mt-4">
          <h2 className="text-2xl font-semibold mb-4 text-center">Points Results</h2>
          <ul>
            {points.map(point => (
              <li key={point.id} className="bg-gray-50 p-4 rounded shadow mb-2 text-sm text-slate-700">
                <p><strong>ID:</strong> {point.id}</p>
                <p><strong>Address:</strong> {point.address}</p>
                <p><strong>Points:</strong> {point.points}</p>
                <p><strong>Event Name:</strong> {point.eventName}</p>
                <p><strong>Metadata:</strong> {point.metadata}</p>
                <p><strong>Created At:</strong> {new Date(point.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-8 right-8 bg-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl hover:bg-purple-700"
      >
        +
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">Add Points</h2>

            <form onSubmit={handlePointsSubmit}>
              <div className="flex flex-col space-y-2">
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
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading || !pointsForm.apiKey || !pointsForm.address || !pointsForm.points || !pointsForm.eventName}
                >
                  {loading ? "Adding Points..." : "Add Points"}
                </button>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="w-full mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
