export type UUID = string;
export type ISODateTime = string;

export const APP_ROLES = ["KAGE", "MEMBER"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const APPROVAL_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export type ActorContext = {
  userId: UUID;
  role: AppRole;
  approvalStatus: ApprovalStatus;
};

export type PageRequest = {
  page?: number;
  pageSize?: number;
};

export type PageInfo = {
  page: number;
  pageSize: number;
  total: number;
};

export type Paginated<T> = {
  items: T[];
  pageInfo: PageInfo;
};
