import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useSubmitPayableInvoiceMutation,
  type PayableInvoiceBootstrap,
  type SubmitPayableInvoiceResponse,
} from "@/redux/api/payableApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Loader2,
  DollarSign,
  FileCheck,
  Calendar,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import PayableFileUploader from "./PayableFileUploader";

interface PayableSubmissionFormProps {
  details: PayableInvoiceBootstrap;
  onSubmitSuccess?: (response: SubmitPayableInvoiceResponse) => void;
}

export default function PayableSubmissionForm({
  details,
  onSubmitSuccess,
}: PayableSubmissionFormProps) {
  const { token } = useParams<{ token: string }>();
  const [submitPayableInvoice, { isLoading: isSubmitting }] =
    useSubmitPayableInvoiceMutation();

  const isFreightCarrier = details.invoiceType === "freight_carrier";

  // Pre-fill totalAmount with suggestedAmount if available
  const [totalAmount, setTotalAmount] = useState<string>(
    details.suggestedAmount !== null && details.suggestedAmount !== undefined
      ? String(details.suggestedAmount)
      : ""
  );
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState<string>("");
  const [daysToPay, setDaysToPay] = useState<number>(30);
  const [customDays, setCustomDays] = useState<string>("");
  const [isCustomDays, setIsCustomDays] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");

  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleApplySuggestedAmount = () => {
    if (details.suggestedAmount !== null && details.suggestedAmount !== undefined) {
      setTotalAmount(String(details.suggestedAmount));
    }
  };

  const handleDaysChange = (value: number | "custom") => {
    if (value === "custom") {
      setIsCustomDays(true);
    } else {
      setIsCustomDays(false);
      setDaysToPay(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const parsedAmount = parseFloat(totalAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setSubmitError("Please enter a valid invoice total amount greater than 0.");
      return;
    }

    if (!uploadedFileUrl || !uploadedFileName) {
      setSubmitError("Please upload your invoice PDF document.");
      return;
    }

    const effectiveDaysToPay = isCustomDays ? parseInt(customDays, 10) || 30 : daysToPay;

    setSubmitError(null);

    try {
      const response = await submitPayableInvoice({
        token,
        documentUrl: uploadedFileUrl,
        documentFileName: uploadedFileName,
        totalAmount: parsedAmount,
        vendorInvoiceNumber: vendorInvoiceNumber.trim() || undefined,
        daysToPay: effectiveDaysToPay,
        description: description.trim() || undefined,
      }).unwrap();

      onSubmitSuccess?.(response);
    } catch (err) {
      console.error("Submission error:", err);
      const errorResponse = err as { data?: { message?: string }; message?: string };
      setSubmitError(
        errorResponse.data?.message ||
          errorResponse.message ||
          "Failed to submit payable invoice. Please try again."
      );
    }
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Submit Payable Invoice
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in the billing details and upload the official PDF invoice for payment processing.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Total Amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-slate-700">
              Total Invoice Amount (USD) <span className="text-red-500">*</span>
            </label>
            {details.suggestedAmount !== null &&
              details.suggestedAmount !== undefined &&
              totalAmount !== String(details.suggestedAmount) && (
                <button
                  type="button"
                  onClick={handleApplySuggestedAmount}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  Use agreed amount ($
                  {Number(details.suggestedAmount).toLocaleString()})
                </button>
              )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <Input
              type="number"
              step="any"
              required
              min="0.01"
              placeholder="0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="pl-10 block w-full rounded-xl border-slate-200 py-6 text-base font-semibold focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Invoice Number & Payment Terms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Vendor / Carrier Invoice Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {isFreightCarrier ? "Carrier / Pro Invoice #" : "Vendor Invoice #"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <Input
                type="text"
                placeholder={isFreightCarrier ? "e.g. FB-98210" : "e.g. INV-2026-001"}
                value={vendorInvoiceNumber}
                onChange={(e) => setVendorInvoiceNumber(e.target.value)}
                className="pl-10 block w-full rounded-xl border-slate-200 py-5 text-sm font-medium focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment Terms (Days to Pay) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Payment Terms (Days to Pay)
            </label>
            <div className="flex gap-2 items-center">
              {[15, 30, 45].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDaysChange(d)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    !isCustomDays && daysToPay === d
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Net {d}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleDaysChange("custom")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  isCustomDays
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Custom
              </button>
            </div>
            {isCustomDays && (
              <div className="mt-2 relative animate-in fade-in duration-200">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="180"
                  placeholder="Enter number of days (e.g. 60)"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="pl-10 block w-full rounded-xl border-slate-200 py-4 text-xs font-medium focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Invoice File Uploader */}
        <PayableFileUploader
          token={token || ""}
          onUploadSuccess={(url, name) => {
            setUploadedFileUrl(url);
            setUploadedFileName(name);
          }}
          onClear={() => {
            setUploadedFileUrl(null);
            setUploadedFileName(null);
          }}
          onUploadingChange={setIsUploading}
        />

        {/* Description / Notes for AP Team */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Notes / Description <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Add any specific instructions, bank remittance notes, or order details for the accounts team..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
          />
        </div>

        {/* Error Alert */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium leading-relaxed">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isUploading || isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg py-6 flex items-center justify-center gap-2 text-base font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting Invoice...
            </>
          ) : isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Uploading PDF Document...
            </>
          ) : (
            <>
              <FileCheck className="h-5 w-5" />
              Submit Invoice for Payment
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
