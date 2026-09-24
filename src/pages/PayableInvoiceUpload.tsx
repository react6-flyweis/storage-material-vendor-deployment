import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useGetPayableInvoiceBootstrapQuery,
  type SubmitPayableInvoiceResponse,
} from "@/redux/api/payableApi";
import { Loader2 } from "lucide-react";
import InvalidRequestView from "@/components/InvalidRequestView";
import PayableRequestOverview from "@/components/PayableRequestOverview";
import PayableSubmissionForm from "@/components/PayableSubmissionForm";
import PayableSuccessView from "@/components/PayableSuccessView";
import logo from "@/assets/logo.svg";

export default function PayableInvoiceUpload() {
  const { token } = useParams<{ token: string }>();
  const {
    data: details,
    isLoading,
    error,
    refetch,
  } = useGetPayableInvoiceBootstrapQuery(token || "", {
    skip: !token,
  });

  const [submittedData, setSubmittedData] =
    useState<SubmitPayableInvoiceResponse | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="Logo" className="h-12 w-auto mb-2 object-contain" />
          <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
          <p className="text-slate-600 font-semibold text-sm">
            Fetching payable invoice details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <InvalidRequestView
        onRetry={() => refetch()}
        title="Payable Invoice Link Invalid"
        description="This invoice upload link is invalid, expired, or has already been used. Please contact the project administrator if you believe this is an error."
      />
    );
  }

  const isAlreadySubmitted = details.alreadySubmitted || submittedData !== null;
  const isFreightCarrier = details.invoiceType === "freight_carrier";

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
        {/* Header Logo & Page Title */}
        <div className="text-center flex flex-col items-center">
          <img src={logo} alt="Logo" className="h-16 w-auto mb-4 object-contain" />
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            {isFreightCarrier
              ? "Freight Carrier Invoice Upload"
              : "Vendor Payable Invoice"}
          </h1>
          <p className="mt-2 text-slate-500 max-w-lg mx-auto text-sm leading-relaxed">
            {isAlreadySubmitted
              ? "Your invoice has been recorded. Review your submission summary and lifecycle progress below."
              : `Upload your official billing invoice for ${details.projectName} (${details.jobId}) to initiate payment processing.`}
          </p>
        </div>

        {/* Dynamic Content View */}
        {isAlreadySubmitted ? (
          <PayableSuccessView details={details} submittedData={submittedData} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <PayableRequestOverview details={details} />
            <PayableSubmissionForm
              details={details}
              onSubmitSuccess={(res) => setSubmittedData(res)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
