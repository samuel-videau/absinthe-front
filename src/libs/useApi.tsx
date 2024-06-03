import axios from 'axios';
import { API_URL } from "@/globals";
import { User } from "@/types/user";
import { CreateKey, CreateKeyResponse, Key } from '@/types/key';
import { CreateCampaign, UpdateCampaign } from '@/types/campaign';

export const useApi = () => {
  const apiUrl = API_URL;

  const createUser = async (): Promise<User> => {
    const response = await axios.post<User>(`${apiUrl}/users`);
    return response.data;
  };

  const createKey = async (keyData: CreateKey): Promise<CreateKeyResponse> => {
    const response = await axios.post<CreateKeyResponse>(`${apiUrl}/keys`, keyData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  };


  const findKeys = async (userId: string, campaignId?: number): Promise<Key[]> => {
    const response = await axios.get<Key[]>(`${apiUrl}/keys`, {
      params: { userId, campaignId },
    });
    return response.data;
  }

  const createCampaign = async (campaignData: CreateCampaign) => {
    const response = await axios.post(`${apiUrl}/campaigns`, campaignData, {
      headers: {
        'Content-Type': 'application/json',
      },
      });
    return response.data;
  };

  const findAllCampaigns = async (userId: string) => {
    const response = await axios.get(`${apiUrl}/campaigns`, {
      params: { userId },
    });
    return response.data;
  };

  const updateCampaign = async (campaignId: number, campaignData: UpdateCampaign) => {
    const response = await axios.patch(`${apiUrl}/campaigns/${campaignId}`, campaignData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  };

  return {
    createUser,
    createKey,
    createCampaign,
    findAllCampaigns,
    updateCampaign,
    findKeys
  };
};
