import { Campaign } from "./campaign";
import { User } from "./user";

export interface Key {
  id: string;
  hashedKey: string;
  createdAt: Date;
  endDate: Date | null;
  permissions: KEY_PERMISSION[];
  user: User;
  campaign: Campaign | null;
}

export interface CreateKey {
  endDate?: Date;
  permissions: KEY_PERMISSION[];
  userId: string;
  campaignId?: number;
}

export interface CreateKeyResponse {
  apiKey: string;
}


export enum KEY_PERMISSION {
  FULL = 'FULL',
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
}
