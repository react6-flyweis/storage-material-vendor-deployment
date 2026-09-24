import type {
  PayableInvoiceBootstrap,
  SubmitPayableInvoiceResponse,
} from "@/redux/api/payableApi";
import {
  CheckCircle,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  Briefcase,
  DollarSign,
  Calendar,
} from "lucide-react";

interface PayableSuccessViewProps {
  details: PayableInvoiceBootstrap;
  submittedData?: SubmitPayableInvoiceResponse | null;
}

export default function PayableSuccessView({
  details,
  submittedData,
}: PayableSuccessViewProps) {
  const isFreightCarrier = details.invoiceType === "freight_carrier";

  // Resolve values prioritizing recently submitted data or bootstrap data
  const totalAmount =
    submittedData?.totalAmount ??
    details.totalAmount ??
    details.submittedInvoice?.totalAmount ??
    details.suggestedAmount ??
    0;

  const documentUrl =
    submittedData?.documentUrl ??
    details.documentUrl ??
    details.submittedInvoice?.documentUrl ??
    null;

  const documentFileName =
    submittedData?.documentFileName ??
    details.documentFileName ??
    details.submittedInvoice?.documentFileName ??
    "Invoice_Document.pdf";

  const invoiceNumber =
    submittedData?.vendorInvoiceNumber ??
    details.vendorInvoiceNumber ??
    details.submittedInvoice?.vendorInvoiceNumber ??
    null;

  const daysToPay =
    submittedData?.daysToPay ??
    details.daysToPay ??
    details.submittedInvoice?.daysToPay ??
    30;

  const submittedAt =
    submittedData?.submittedAt ??
    submittedData?.createdAt ??
    details.submittedAt ??
    details.createdAt ??
    details.submittedInvoice?.submittedAt ??
    details.submittedInvoice?.createdAt ??
    new Date().toISOString();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300">
      {/* Top Emerald Header */}
      <div className="bg-emerald-600 px-8 py-10 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="inline-flex bg-white/20 p-4 rounded-full mb-4 shadow-inner">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Invoice Submitted Successfully
        </h2>
        <p className="mt-2 text-emerald-100 max-w-md mx-auto text-sm leading-relaxed">
          Your payable invoice has been registered and forwarded to the operations and accounts teams for approval.
        </p>

        {/* Status Pill */}
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-400/30 text-white text-xs font-bold tracking-wide">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
          </span>
          Status: Pending Admin Approval
        </div>
      </div>

      {/* Submission Summary Body */}
      <div className="p-6 sm:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Invoice Summary</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {isFreightCarrier ? "Freight Carrier Payable" : "Vendor Payable"}
            </span>
          </h3>

          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            {/* Payee Name */}
            <div>
              <dt className="text-slate-400 font-medium flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                {isFreightCarrier ? "Carrier / Payee" : "Vendor / Payee"}
              </dt>
              <dd className="text-slate-800 font-bold mt-1 text-base">
                {details.payeeName}
              </dd>
            </div>

            {/* Project Name */}
            <div>
              <dt className="text-slate-400 font-medium flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                Project
              </dt>
              <dd className="text-slate-800 font-semibold mt-1">
                {details.projectName}
              </dd>
            </div>

            {/* Job Reference */}
            <div>
              <dt className="text-slate-400 font-medium">Job Reference ID</dt>
              <dd className="text-slate-800 font-mono font-semibold mt-1">
                {details.jobId}
              </dd>
            </div>

            {/* Total Amount */}
            <div>
              <dt className="text-slate-400 font-medium flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                Submitted Total Amount
              </dt>
              <dd className="text-emerald-700 font-extrabold text-xl mt-1">
                ${Number(totalAmount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </dd>
            </div>

            {/* Invoice Number */}
            {invoiceNumber && (
              <div>
                <dt className="text-slate-400 font-medium">Invoice Number</dt>
                <dd className="text-slate-800 font-bold mt-1 font-mono">
                  {invoiceNumber}
                </dd>
              </div>
            )}

            {/* Payment Terms */}
            <div>
              <dt className="text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Payment Terms
              </dt>
              <dd className="text-slate-800 font-semibold mt-1">
                Net {daysToPay} Days
              </dd>
            </div>

            {/* Submitted Date */}
            <div>
              <dt className="text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Submitted At
              </dt>
              <dd className="text-slate-800 font-semibold mt-1">
                {formatDate(submittedAt)}
              </dd>
            </div>

            {/* Uploaded PDF Document */}
            {documentUrl && (
              <div className="md:col-span-2">
                <dt className="text-slate-400 font-medium">Invoice Document</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer border border-blue-200/60"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>{documentFileName}</span>
                    <ExternalLink className="h-3 w-3 text-blue-400" />
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Process Roadmap */}
        <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Next Steps in the Payment Lifecycle
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">1. Invoice Received</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Document and amount safely recorded.
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-sm flex items-start gap-3 ring-1 ring-amber-400/30">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                <Clock className="h-4 w-4 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">2. Admin Verification</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Under review in the approval queue.
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3 opacity-75">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">3. Remittance</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Accounts team marks paid upon disbursement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
