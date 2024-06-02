export class User {
  id: string;
  createdAt: Date;
  role: 'admin' | 'user';
  tier: SUBSCRIPTION_TIER;
  campaigns: Campaign[];
  keys: Key[];
}

export enum SUBSCRIPTION_TIER {
  FREE = 0,
  BASIC = 1,
  PREMIUM = 2,
}
