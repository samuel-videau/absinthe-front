export interface Campaign {
  id: number;
  name: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date | null;
  status: CAMPAIGN_STATUS;
}

export enum CAMPAIGN_STATUS {
  OFF = 0,
  ON = 1,
  COMPLETED = 2,
}


export interface CreateCampaign {
  name: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
}

export interface UpdateCampaign extends Partial<CreateCampaign> {
  userId: string;
  status?: CAMPAIGN_STATUS;
}
