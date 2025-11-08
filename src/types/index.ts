import { ReactNode } from "react";

export interface ServiceCardProps { 
    color: string, 
    title: string,
    icon: ReactNode, 
    subtitle: string
}

export interface NavBarItemProps { 
    title: string, 
    classprops?: string,
    icon?: any,
}

export interface Image {
  id: string;
  url: string;
  name?: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
  isImage?: boolean;
}

export interface CreateFundRequest {
  plan: string
  package: number
  perday?: number | null
  quarter?: number | null
  imageId?: string | null
}

export interface UpdateFundRequest {
  plan: string
  package?: number
  perday?: number | null
  quarter?: number | null
  imageId?: string | null
}

export interface FundsResponse {
  funds: Fund[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ImagesResponse {
  images: Image[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface UploadResponse {
  message: string
  error?: string
  image: Image
}


// export interface Fund {
//   id: string; 
//   plan: string;
//   package: number;
//   perday: number;
//   quarter: number;
//   image?: Image;
//   imageId: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

export type Fund = {
  id: string;
  plan: string;
  package: number;
  perday?: number | null;
  quarter: number;
  imageId?: string | null;
  createdAt: string;
  updatedAt: string;
  image?: { id: string; url: string } | null;
};

export type FundPurchaseRecord = {
  id: number;
  userId: number;
  fundId: string;
  package?: number | null;
  perday?: number | null;
  quarter?: number | null;
  status: string;
  joinedAt: string;
  lastClaimedAt: string;
  totalClaimed: number;
  isActive: boolean;
  fund?: Fund;
};

export type FundStatus = {
  fundId: string;
  isPurchased: boolean;
  isClaimable: boolean;
  nextClaimTime?: number; 
  joinedAt?: string;
  lastClaimedAt?: string;
  quarter?: number;
  package?: number;
  perday?: number;
  plan?: string;
  image?: { id: string; url: string } | null;
};
