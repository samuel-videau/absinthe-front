'use client'

import Modal from "@/components/modal";
import { FormEvent, useState } from "react";
import { AbsintheSdk } from 'sam-absinthe-sdk';

export default function Points() {
  const [pointsForm, setPointsForm] = useState({
    campaignId: '',
    apiKey: '',
    address: '',
    points: '',
    eventName: '',
    metadata: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [modal, setModal] = useState<{ type: 'success' | 'error', title: string, message: string } | null>(null);

  const handlePointsSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const { campaignId, apiKey, address, points, eventName, metadata } = pointsForm;
    if (!campaignId || !apiKey || !address || !points || !eventName) return;

    setLoading(true);

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
      setModal({ type: 'success', title: 'Success', message: 'Points successfully added!' });
    } catch (error) {
      console.error("Failed to add points:", error);
      setModal({ type: 'error', title: 'Error', message: 'Failed to add points. Please try again.' });
    }

    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPointsForm(prevState => ({ ...prevState, [name]: value }));
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <div>
      {modal && <Modal type={modal.type} title={modal.title} message={modal.message} onClose={closeModal} />}
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
            disabled={loading || !pointsForm.campaignId || !pointsForm.apiKey || !pointsForm.address || !pointsForm.points || !pointsForm.eventName}
          >
            Add Points
          </button>
        </div>
      </form>
    </div>
  );
}
