import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "./apiResponse";

export interface ApprovedQuoteDetails {
  status?: string;
  quoteValue?: number;
  submittedFileUrl?: string;
  submittedFileName?: string;
  submittedAt?: string;
  reviewedAt?: string;
  consolidatedBOMFileUrl?: string;
  consolidatedBOMId?: string;
}

export interface PayableVendorDetails {
  _id?: string;
  vendorCode?: string;
  vendorName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  vendorType?: string;
  status?: string;
}

export interface PayableProjectDetails {
  _id?: string;
  jobId?: string;
  projectName?: string;
  buildingType?: string;
  location?: string;
  quoteValue?: number;
  lifecycleStatus?: string;
  poNumber?: string;
  poStatus?: string;
}

export interface PayableInvoiceBootstrap {
  invoiceType: "vendor" | "freight_carrier" | string;
  uploadKind?: "vendor" | "freight_carrier" | string;
  projectName: string;
  jobId: string;
  payeeName: string;
  suggestedAmount?: number | null;
  alreadySubmitted: boolean;
  requiresAuth?: boolean;
  existingInvoiceId?: string | null;
  leadId?: string;
  approvedQuote?: ApprovedQuoteDetails | null;
  vendor?: PayableVendorDetails | null;
  project?: PayableProjectDetails | null;
  shipperRequest?: Record<string, unknown> | null;
  documentUrl?: string | null;
  documentFileName?: string | null;
  totalAmount?: number | null;
  description?: string | null;
  vendorInvoiceNumber?: string | null;
  daysToPay?: number | null;
  submittedAt?: string | null;
  createdAt?: string | null;
  submittedInvoice?: {
    documentUrl?: string;
    documentFileName?: string;
    totalAmount?: number;
    description?: string;
    vendorInvoiceNumber?: string;
    daysToPay?: number;
    submittedAt?: string;
    createdAt?: string;
  };
}

export interface PayablePresignedUrlRequest {
  token: string;
  fileName: string;
  fileType: string;
  folder?: string;
}

export interface PayablePresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key?: string;
}

export interface SubmitPayableInvoicePayload {
  documentUrl: string;
  documentFileName: string;
  totalAmount: number;
  description?: string;
  vendorInvoiceNumber?: string;
  daysToPay?: number;
}

export interface SubmitPayableInvoiceRequest extends SubmitPayableInvoicePayload {
  token: string;
}

export interface SubmitPayableInvoiceResponse {
  _id?: string;
  invoiceType?: string;
  totalAmount?: number;
  documentUrl?: string;
  documentFileName?: string;
  vendorInvoiceNumber?: string;
  daysToPay?: number;
  description?: string;
  payableWorkflow?: {
    status: string;
    source: string;
    documentUrl?: string;
  };
  submittedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

export const payableApi = createApi({
  reducerPath: "payableApi",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  tagTypes: ["PayableInvoice"],
  endpoints: (builder) => ({
    getPayableInvoiceBootstrap: builder.query<PayableInvoiceBootstrap, string>({
      query: (token) => `/api/public/payable-invoice-upload/${token}`,
      providesTags: ["PayableInvoice"],
      transformResponse: (
        response: ApiResponse<PayableInvoiceBootstrap> | PayableInvoiceBootstrap
      ): PayableInvoiceBootstrap => {
        if ("data" in response && response.data) {
          return response.data as PayableInvoiceBootstrap;
        }
        return response as PayableInvoiceBootstrap;
      },
    }),
    getPayablePresignedUrl: builder.mutation<
      PayablePresignedUrlResponse,
      PayablePresignedUrlRequest
    >({
      query: ({ token, ...body }) => ({
        url: `/api/public/payable-invoice-upload/${token}/presigned-url`,
        method: "POST",
        body,
      }),
      transformResponse: (
        response: ApiResponse<PayablePresignedUrlResponse> | PayablePresignedUrlResponse
      ): PayablePresignedUrlResponse => {
        if ("data" in response && response.data) {
          return response.data as PayablePresignedUrlResponse;
        }
        return response as PayablePresignedUrlResponse;
      },
    }),
    submitPayableInvoice: builder.mutation<
      SubmitPayableInvoiceResponse,
      SubmitPayableInvoiceRequest
    >({
      query: ({ token, ...body }) => ({
        url: `/api/public/payable-invoice-upload/${token}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PayableInvoice"],
      transformResponse: (
        response: ApiResponse<SubmitPayableInvoiceResponse> | SubmitPayableInvoiceResponse
      ): SubmitPayableInvoiceResponse => {
        if ("data" in response && response.data) {
          return response.data as SubmitPayableInvoiceResponse;
        }
        return response as SubmitPayableInvoiceResponse;
      },
    }),
  }),
});

export const {
  useGetPayableInvoiceBootstrapQuery,
  useGetPayablePresignedUrlMutation,
  useSubmitPayableInvoiceMutation,
} = payableApi;
