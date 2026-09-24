import { useParams, Link } from "react-router-dom";
import { useGetPackingListPlanDetailsQuery, type Bundle } from "@/redux/api/packingListPlanApi";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  Package,
  Layers,
  Scale,
  Truck,
  FileText,
  ExternalLink,
} from "lucide-react";
import InvalidRequestView from "@/components/InvalidRequestView";
import logo from "@/assets/logo.svg";

export default function PackingListPlanDetails() {
  const { packingListPlanId } = useParams<{ packingListPlanId: string }>();
  const { data, isLoading, error, refetch } = useGetPackingListPlanDetailsQuery(packingListPlanId || "", {
    skip: !packingListPlanId,
  });
  const { t, i18n } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-slate-600 font-medium">{t("fetchingPackingListPlan")}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <InvalidRequestView
        onRetry={() => refetch()}
        title={t("packingListPlanNotFound")}
        description={t("packingListPlanNotFoundDesc")}
      />
    );
  }

  const { packingListPlan, packingLists, summary, bundles = [] } = data;

  // Render nicer labels for standard truck types
  const formatTruckType = (type: string) => {
    switch (type) {
      case "SEMI_53":
        return t("semi53Flatbed");
      case "HOTSHOT_40":
        return t("hotshot40");
      default:
        return type.replace(/_/g, " ");
    }
  };

  const formatBundleStatus = (status?: string) => {
    if (!status) return t("pending");
    if (status === "assigned_to_truck") return t("assignedToTruck");
    return status.replace(/_/g, " ");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">

        {/* Header Block */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <img src={logo} alt="Logo" className="h-8 sm:h-10 w-auto object-contain" />
            <div className="border-l border-slate-200 pl-3 sm:pl-4">
              <span className="text-[10px] sm:text-xs font-semibold text-blue-600 tracking-wider uppercase">{t("plantPortal")}</span>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight sm:text-2xl">
                {t("packingListPlan")}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-xs">
              <button
                onClick={() => i18n.changeLanguage("en")}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  i18n.language === "en"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => i18n.changeLanguage("es")}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  i18n.language === "es"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                ES
              </button>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-inner">
              <Truck className="h-4 w-4" />
              {packingListPlan.status || "N/A"}
            </div>
          </div>
        </div>

        {/* Main Summary Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-w-0">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Scale className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{t("totalWeight")}</span>
            </div>
            <span className="text-lg sm:text-2xl font-black text-slate-800 truncate">
              {summary.totalWeight.toLocaleString()} {t("lbs")}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-w-0">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Layers className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{t("totalBundles")}</span>
            </div>
            <span className="text-lg sm:text-2xl font-black text-slate-800 truncate">
              {t("bundlesCount", { qty: summary.totalBundles })}
            </span>
          </div>

          <div className="bg-white p-4 col-span-2 md:col-span-1 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-w-0">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{t("packingLists")}</span>
            </div>
            <span className="text-lg sm:text-2xl font-black text-slate-800 truncate">
              {t("listsCount", { count: summary.totalPackingLists })}
            </span>
          </div>
        </div>

        {/* Truck Summary Card */}
        {summary.truckSummary && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-white min-w-0">
                <Truck className="h-5 w-5 text-blue-400 shrink-0" />
                <h2 className="text-sm sm:text-base font-semibold tracking-wide truncate">{t("truckSummaryBreakdown")}</h2>
              </div>
              <span className="text-[10px] sm:text-xs font-medium bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 shrink-0">
                {t("totalTrucks", { count: summary.truckSummary.totalTrucks })}
              </span>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {summary.truckSummary.semi53Count !== undefined && summary.truckSummary.semi53Count > 0 && (
                <div className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">{t("semi53Count")}</span>
                  <span className="text-base sm:text-xl font-bold text-slate-800">{summary.truckSummary.semi53Count}</span>
                </div>
              )}
              {summary.truckSummary.hotshot40Count !== undefined && summary.truckSummary.hotshot40Count > 0 && (
                <div className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">{t("hotshot40Count")}</span>
                  <span className="text-base sm:text-xl font-bold text-slate-800">{summary.truckSummary.hotshot40Count}</span>
                </div>
              )}
              {/* Fallback display for dynamic keys in truckSummary that aren't the standard counts */}
              {Object.entries(summary.truckSummary)
                .filter(([key]) => key !== "semi53Count" && key !== "hotshot40Count" && key !== "totalTrucks")
                .map(([key, val]) => (
                  <div key={key} className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      {t(key, { defaultValue: key.replace(/Count$/i, "").replace(/([A-Z])/g, " $1") })}
                    </span>
                    <span className="text-base sm:text-xl font-bold text-slate-800">{val}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Packing List Rows */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              {t("packingListsWithCount", { count: packingLists.length })}
            </h2>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">{t("packingListNo")}</th>
                  <th className="px-6 py-4">{t("truckType")}</th>
                  <th className="px-6 py-4 text-right">{t("weightLbs")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {packingLists.map((pl) => (
                  <tr key={pl._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/packing-list/${pl._id}`}
                        className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{pl.packingListNo}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {formatTruckType(pl.truckType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">{pl.totalWeight.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards Layout */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:hidden">
            {packingLists.map((pl) => (
              <div key={pl._id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <Link
                      to={`/packing-list/${pl._id}`}
                      className="font-mono font-bold text-blue-600 hover:underline text-sm sm:text-base break-all inline-flex items-center gap-1"
                    >
                      <span>{pl.packingListNo}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </Link>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 shrink-0">
                    {formatTruckType(pl.truckType)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-t border-slate-50 text-xs">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px]">{t("totalWeight")}</span>
                  <span className="font-bold text-slate-800 text-sm">{pl.totalWeight.toLocaleString()} {t("lbs")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bundles Table Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              {t("bundlesBreakdownWithCount", { count: bundles.length })}
            </h2>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-center w-16">{t("seq")}</th>
                  <th className="px-4 py-3">{t("bundleNo")}</th>
                  <th className="px-4 py-3">{t("type")}</th>
                  <th className="px-4 py-3 text-right">{t("qty")}</th>
                  <th className="px-4 py-3 text-right">{t("weightLbs")}</th>
                  <th className="px-4 py-3 text-right">{t("maxLength")}</th>
                  <th className="px-4 py-3">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {bundles.map((bundle: Bundle) => {
                  return (
                    <tr key={bundle._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-slate-400">{bundle.loadSequence || "-"}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/bundle/${bundle._id}`}
                          className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1.5"
                        >
                          <span>{bundle.bundleNo}</span>
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 capitalize">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                          {bundle.bundleType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{bundle.totalQty.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {bundle.totalWeight.toLocaleString()} {t("lbs")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {bundle.maxLengthFeet ? `${Number(bundle.maxLengthFeet.toFixed(2))} ${t("ft")}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${bundle.status === "assigned_to_truck"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                          }`}>
                          {formatBundleStatus(bundle.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards Layout */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:hidden">
            {bundles.map((bundle: Bundle) => {
              return (
                <div key={bundle._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{t("seq")} {bundle.loadSequence || "-"}</span>
                      <Link
                        to={`/bundle/${bundle._id}`}
                        className="font-mono font-bold text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                      >
                        <span>{bundle.bundleNo}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${bundle.status === "assigned_to_truck"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-50 text-slate-600 border border-slate-200"
                      }`}>
                      {formatBundleStatus(bundle.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1 text-xs">
                    <div className="flex flex-col">
                      <span className="text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">{t("type")}</span>
                      <span className="font-medium text-slate-800 capitalize">{bundle.bundleType}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">{t("qty")}</span>
                      <span className="font-bold text-slate-800">{bundle.totalQty.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">{t("weight")}</span>
                      <span className="font-bold text-slate-800">
                        {bundle.totalWeight.toLocaleString()} {t("lbs")}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">{t("maxLength")}</span>
                      <span className="font-medium text-slate-800">
                        {bundle.maxLengthFeet ? `${Number(bundle.maxLengthFeet.toFixed(2))} ${t("ft")}` : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
