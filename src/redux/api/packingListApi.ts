import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";

export interface LoadLayout {
  bottomLayerBundleIds?: string[];
  middleLayerBundleIds?: string[];
  topLayerBundleIds?: string[];
  loadingNotes?: string;
}

export interface PackingListDetails {
  _id: string;
  packingListPlanId?: string;
  bundlePlanId?: string;
  leadId?: string;
  shipperRequestId?: string;
  packingListNo: string;
  truckNo?: string;
  truckType: string;
  truckLabel?: string;
  maxTruckWeight?: number;
  hardMaxTruckWeight?: number;
  maxTruckLengthFeet?: number;
  bundleIds?: string[];
  totalBundles: number;
  totalItems?: number;
  totalWeight: number;
  maxLengthFeet?: number;
  loadLayout?: LoadLayout;
  warnings?: string[];
  overrideReason?: string;
  status: string;
  notes?: string;
  actualWeight?: number | null;
  weightVerified?: boolean;
  loadingVerified?: boolean;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  dispatchedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TruckInfo {
  truckType: string;
  truckLabel?: string;
  totalWeight: number;
  maxTruckWeight?: number;
  hardMaxTruckWeight?: number;
  maxTruckLengthFeet?: number;
}

export interface StackingInfo {
  stackLevel?: string;
  canStackOnTop?: boolean;
  canHaveItemsStackedOnIt?: boolean;
  isFragile?: boolean;
  mustStayFlat?: boolean;
  keepDry?: boolean;
  requiresEdgeProtection?: boolean;
  loadingPriority?: number;
  unloadingPriority?: number;
  stackingNotes?: string;
}

export interface BundleItem {
  _id?: string;
  vendorQuoteLineId?: string;
  partCode?: string;
  description?: string;
  category?: string;
  color?: string;
  qty: number;
  lengthFeet?: number;
  widthFeet?: number | null;
  heightFeet?: number | null;
  weight?: number;
  unitWeight?: number;
  totalWeight?: number;
  weightBasis?: string;
  weightSource?: string;
  markIds?: string[];
  sourceLineSnapshot?: Record<string, unknown>;
}

export interface PackingListBundle {
  _id: string;
  bundleNo: string;
  bundleType: string;
  title?: string;
  items?: BundleItem[];
  totalQty: number;
  totalWeight: number;
  maxLengthFeet?: number;
  stacking?: StackingInfo;
  loadSequence?: number;
  warnings?: string[];
  notes?: string;
}

export interface PackingListResponse {
  packingList: PackingListDetails;
  truckInfo?: TruckInfo;
  bundles: PackingListBundle[];
  loadLayout?: LoadLayout;
  planStatus?: string;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

export const packingListApi = createApi({
  reducerPath: "packingListApi",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  tagTypes: ["PackingList"],
  endpoints: (builder) => ({
    getPackingListDetails: builder.query<PackingListResponse, string>({
      query: (packingListId) => `/api/packing-lists/${packingListId}`,
      providesTags: ["PackingList"],
      transformResponse: (response: ApiResponse<PackingListResponse>) => {
        if (!response.data) {
          throw new Error("No data returned from API");
        }
        return response.data;
      },
    }),
  }),
});

export const { useGetPackingListDetailsQuery } = packingListApi;
