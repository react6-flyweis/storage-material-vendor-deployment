import type { PayableInvoiceBootstrap } from "@/redux/api/payableApi";
import {
  Building2,
  Briefcase,
  Hash,
  Truck,
  DollarSign,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  FileText,
  ExternalLink,
} from "lucide-react";

interface PayableRequestOverviewProps {
  details: PayableInvoiceBootstrap;
}

export default function PayableRequestOverview({ details }: PayableRequestOverviewProps) {
  const isFreightCarrier = details.invoiceType === "freight_carrier";

  return (
    <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Invoice Overview</h3>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isFreightCarrier
                ? "bg-purple-50 text-purple-700 border border-purple-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {isFreightCarrier ? "Freight Carrier" : "Vendor Payable"}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {/* Payee Name */}
          <div className="flex gap-3 items-start">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isFreightCarrier
                  ? "bg-purple-50 text-purple-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {isFreightCarrier ? (
                <Truck className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                {isFreightCarrier ? "Carrier / Payee" : "Vendor / Payee"}
              </p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {details.payeeName || "N/A"}
              </p>
            </div>
          </div>

          {/* Project Name */}
          <div className="flex gap-3 items-start">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Project Name
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {details.projectName || "N/A"}
              </p>
            </div>
          </div>

          {/* Job ID */}
          <div className="flex gap-3 items-start">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Job Reference ID
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 font-mono">
                {details.jobId || "N/A"}
              </p>
            </div>
          </div>

          {/* PO Number if available */}
          {details.project?.poNumber && (
            <div className="flex gap-3 items-start">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Purchase Order (PO)
                </p>
                <p className="text-sm font-bold text-slate-800 mt-0.5 font-mono">
                  {details.project.poNumber}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested / Agreed Amount Card */}
      {details.suggestedAmount !== null && details.suggestedAmount !== undefined && (
        <div className="bg-linear-to-br from-slate-50 to-blue-50/40 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isFreightCarrier ? "Awarded Bid Amount" : "Approved Quote Value"}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ${Number(details.suggestedAmount).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Expected total based on the accepted quote specifications.
          </p>

          {/* Reference to original approved quote PDF if available */}
          {details.approvedQuote?.submittedFileUrl && (
            <div className="mt-3 pt-3 border-t border-blue-100/80">
              <a
                href={details.approvedQuote.submittedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors group"
              >
                <FileText className="h-3.5 w-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-50">
                  {details.approvedQuote.submittedFileName || "View Approved Quote"}
                </span>
                <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Workflow Process Steps */}
      <div className="mt-auto pt-5 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Accounts Payable Lifecycle
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">1. Invoice Submission:</span>{" "}
              Upload your official PDF invoice with billing details.
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">2. Admin Verification:</span>{" "}
              Project admin reviews and approves your payable submission.
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">3. Payment Execution:</span>{" "}
              Account department processes remittance per payment terms.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
