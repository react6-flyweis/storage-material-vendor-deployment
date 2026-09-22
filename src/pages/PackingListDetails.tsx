import { useState, Fragment } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetPackingListDetailsQuery, type PackingListBundle } from "@/redux/api/packingListApi";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  Package,
  Layers,
  Scale,
  Truck,
  FileText,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Maximize2,
  CheckCircle2,
  Info,
} from "lucide-react";
import InvalidRequestView from "@/components/InvalidRequestView";
import logo from "@/assets/logo.svg";

export default function PackingListDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useGetPackingListDetailsQuery(id || "", {
    skip: !id,
  });
  const { t, i18n } = useTranslation();
  const [expandedBundleIds, setExpandedBundleIds] = useState<Record<string, boolean>>({});

  const toggleBundle = (bundleId: string) => {
    setExpandedBundleIds((prev) => ({
      ...prev,
      [bundleId]: !prev[bundleId],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-slate-600 font-medium">{t("fetchingPackingList")}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <InvalidRequestView
        onRetry={() => refetch()}
        title={t("packingListNotFound")}
        description={t("packingListNotFoundDesc")}
      />
    );
  }

  const { packingList, truckInfo, bundles = [], loadLayout } = data;

  const maxWeight = truckInfo?.maxTruckWeight || packingList.maxTruckWeight || 0;
  const currentWeight = packingList.totalWeight || truckInfo?.totalWeight || 0;
  const weightUtilizationPct = maxWeight > 0 ? Math.min(100, Math.round((currentWeight / maxWeight) * 100)) : 0;

  const formatTruckType = (type: string) => {
    switch (type) {
      case "SEMI_53":
        return t("semi53Flatbed");
      case "HOTSHOT_40":
        return t("hotshot40");
      default:
        return type ? type.replace(/_/g, " ") : "N/A";
    }
  };

  // Map bundle IDs to bundle entities for quick lookup
  const bundleMap = new Map<string, PackingListBundle>();
  bundles.forEach((b) => bundleMap.set(b._id, b));

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">
        
        {/* Navigation & Header Block */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <img src={logo} alt="Logo" className="h-8 sm:h-10 w-auto object-contain" />
              <div className="border-l border-slate-200 pl-3 sm:pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-semibold text-blue-600 tracking-wider uppercase">
                    {t("plantPortal")}
                  </span>
                  {packingList.packingListPlanId && (
                    <Link
                      to={`/packing-list-plan/${packingList.packingListPlanId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      <span>{t("viewPlan")}</span>
                    </Link>
                  )}
                </div>
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
                  <FileText className="h-6 w-6 text-blue-600 hidden sm:inline" />
                  <span>{packingList.packingListNo}</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-400 font-normal">
                    ({packingList.truckNo || truckInfo?.truckLabel || formatTruckType(packingList.truckType)})
                  </span>
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

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                <span>{packingList.status || "Confirmed"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings Section (if present) */}
        {packingList.warnings && packingList.warnings.length > 0 && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5 w-full">
                <h3 className="text-sm font-bold text-amber-900">{t("warnings")}</h3>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-amber-800 font-medium">
                  {packingList.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {/* Total Weight Card with Utilization */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Scale className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{t("totalWeight")}</span>
              </div>
              <span className="text-lg sm:text-2xl font-black text-slate-800 truncate block">
                {currentWeight.toLocaleString()} {t("lbs")}
              </span>
            </div>
            {maxWeight > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                  <span>{weightUtilizationPct}% {t("maxCapacity")}</span>
                  <span>{maxWeight.toLocaleString()} {t("lbs")}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      weightUtilizationPct > 95
                        ? "bg-rose-500"
                        : weightUtilizationPct > 80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${weightUtilizationPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Total Bundles Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Layers className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{t("totalBundles")}</span>
            </div>
            <span className="text-lg sm:text-2xl font-black text-slate-800">
              {packingList.totalBundles}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-2">
              {bundles.length} {t("bundlesCount", { qty: bundles.length })}
            </span>
          </div>

          {/* Total Items Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Package className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{t("qty")}</span>
            </div>
            <span className="text-lg sm:text-2xl font-black text-slate-800">
              {packingList.totalItems ?? bundles.reduce((acc, b) => acc + (b.totalQty || 0), 0)}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-2">
              {t("itemsCount", { qty: packingList.totalItems ?? bundles.reduce((acc, b) => acc + (b.totalQty || 0), 0) })}
            </span>
          </div>

          {/* Max Length Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Maximize2 className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{t("maxLength")}</span>
            </div>
            <span className="text-lg sm:text-2xl font-black text-slate-800 truncate block">
              {packingList.maxLengthFeet ? `${Number(packingList.maxLengthFeet.toFixed(2))} ${t("ft")}` : "-"}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-2 truncate">
              {truckInfo?.maxTruckLengthFeet || packingList.maxTruckLengthFeet
                ? `${t("lengthLimit")}: ${truckInfo?.maxTruckLengthFeet || packingList.maxTruckLengthFeet} ${t("ft")}`
                : formatTruckType(packingList.truckType)}
            </span>
          </div>
        </div>

        {/* Truck & Capacity Specifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-white min-w-0">
              <Truck className="h-5 w-5 text-blue-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-semibold tracking-wide truncate">{t("truckInfo")}</h2>
            </div>
            <span className="text-[10px] sm:text-xs font-medium bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 shrink-0 font-mono">
              {packingList.truckNo || "TRUCK"}
            </span>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                {t("truckType")}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-800 block">
                {truckInfo?.truckLabel || formatTruckType(packingList.truckType)}
              </span>
            </div>

            <div className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                {t("maxCapacity")}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-800 block">
                {maxWeight ? `${maxWeight.toLocaleString()} ${t("lbs")}` : "N/A"}
              </span>
            </div>

            <div className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                {t("lengthLimit")}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-800 block">
                {truckInfo?.maxTruckLengthFeet || packingList.maxTruckLengthFeet
                  ? `${truckInfo?.maxTruckLengthFeet || packingList.maxTruckLengthFeet} ${t("ft")}`
                  : "N/A"}
              </span>
            </div>

            <div className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                {t("weightUtilization")}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-800 block">
                {weightUtilizationPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Load Layout & Stacking Layers (if available) */}
        {loadLayout && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                <h2 className="text-sm sm:text-base font-bold text-slate-800">{t("loadLayout")}</h2>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {loadLayout.loadingNotes && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-150 text-xs sm:text-sm text-slate-700">
                  <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">{t("loadingNotes")}: </span>
                    <span>{loadLayout.loadingNotes}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {/* Top Layer */}
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      {t("topLayer")}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {loadLayout.topLayerBundleIds?.length || 0} bundles
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {loadLayout.topLayerBundleIds && loadLayout.topLayerBundleIds.length > 0 ? (
                      loadLayout.topLayerBundleIds.map((bId) => {
                        const bundle = bundleMap.get(bId);
                        return (
                          <Link
                            key={bId}
                            to={`/bundle/${bId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-white text-blue-700 border border-blue-200 shadow-xs hover:bg-blue-50 transition-colors"
                          >
                            <span>{bundle ? bundle.bundleNo : bId.slice(-6)}</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </Link>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">None</span>
                    )}
                  </div>
                </div>

                {/* Middle Layer */}
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      {t("middleLayer")}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {loadLayout.middleLayerBundleIds?.length || 0} bundles
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {loadLayout.middleLayerBundleIds && loadLayout.middleLayerBundleIds.length > 0 ? (
                      loadLayout.middleLayerBundleIds.map((bId) => {
                        const bundle = bundleMap.get(bId);
                        return (
                          <Link
                            key={bId}
                            to={`/bundle/${bId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-white text-blue-700 border border-blue-200 shadow-xs hover:bg-blue-50 transition-colors"
                          >
                            <span>{bundle ? bundle.bundleNo : bId.slice(-6)}</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </Link>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">None</span>
                    )}
                  </div>
                </div>

                {/* Bottom Layer */}
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      {t("bottomLayer")}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {loadLayout.bottomLayerBundleIds?.length || 0} bundles
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {loadLayout.bottomLayerBundleIds && loadLayout.bottomLayerBundleIds.length > 0 ? (
                      loadLayout.bottomLayerBundleIds.map((bId) => {
                        const bundle = bundleMap.get(bId);
                        return (
                          <Link
                            key={bId}
                            to={`/bundle/${bId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-white text-blue-700 border border-blue-200 shadow-xs hover:bg-blue-50 transition-colors"
                          >
                            <span>{bundle ? bundle.bundleNo : bId.slice(-6)}</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </Link>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bundles Breakdown Table Section */}
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
                  <th className="px-4 py-3 text-center w-14">{t("seq")}</th>
                  <th className="px-4 py-3">{t("bundleNo")}</th>
                  <th className="px-4 py-3">{t("type")}</th>
                  <th className="px-4 py-3 text-right">{t("qty")}</th>
                  <th className="px-4 py-3 text-right">{t("weightLbs")}</th>
                  <th className="px-4 py-3 text-right">{t("maxLength")}</th>
                  <th className="px-4 py-3 text-center">{t("stackingInfo")}</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {bundles.map((bundle: PackingListBundle) => {
                  const isExpanded = !!expandedBundleIds[bundle._id];
                  const hasItems = bundle.items && bundle.items.length > 0;

                  return (
                    <Fragment key={bundle._id}>
                      <tr className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 text-center font-bold text-slate-400">
                          {bundle.loadSequence || "-"}
                        </td>
                        <td className="px-4 py-3.5">
                          <Link
                            to={`/bundle/${bundle._id}`}
                            className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1.5"
                          >
                            <span>{bundle.bundleNo}</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 capitalize">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {bundle.bundleType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium">{bundle.totalQty.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right font-semibold">
                          {bundle.totalWeight.toLocaleString()} {t("lbs")}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {bundle.maxLengthFeet ? `${Number(bundle.maxLengthFeet.toFixed(2))} ${t("ft")}` : "-"}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {bundle.stacking?.stackLevel && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
                              {bundle.stacking.stackLevel}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {hasItems && (
                            <button
                              type="button"
                              onClick={() => toggleBundle(bundle._id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 cursor-pointer"
                            >
                              <span>{bundle.items?.length} items</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && hasItems && (
                        <tr className="bg-slate-50/60 border-b border-slate-100">
                          <td colSpan={8} className="px-6 py-3">
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Bundle Items ({bundle.items?.length})
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {bundle.items?.map((item, idx) => (
                                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex flex-col gap-0.5">
                                    <div className="flex justify-between font-semibold text-slate-800">
                                      <span className="truncate">{item.description || item.partCode || "Item"}</span>
                                      <span className="shrink-0">{item.qty} pcs</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                      <span>Weight: {item.totalWeight || item.weight || 0} lbs</span>
                                      {item.lengthFeet ? <span>Length: {item.lengthFeet} ft</span> : null}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards Layout */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:hidden">
            {bundles.map((bundle: PackingListBundle) => {
              const isExpanded = !!expandedBundleIds[bundle._id];
              const hasItems = bundle.items && bundle.items.length > 0;

              return (
                <div key={bundle._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {t("seq")} {bundle.loadSequence || "-"}
                      </span>
                      <Link
                        to={`/bundle/${bundle._id}`}
                        className="font-mono font-bold text-blue-600 hover:underline inline-flex items-center gap-1 text-sm"
                      >
                        <span>{bundle.bundleNo}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200 capitalize">
                      {bundle.bundleType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1 text-xs">
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
                    <div className="flex flex-col">
                      <span className="text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">{t("stackingInfo")}</span>
                      <span className="font-medium text-slate-800 uppercase text-[10px]">
                        {bundle.stacking?.stackLevel || "-"}
                      </span>
                    </div>
                  </div>

                  {hasItems && (
                    <div className="pt-2 border-t border-slate-50 flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggleBundle(bundle._id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"
                      >
                        <span>{bundle.items?.length} items</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Expanded Items Drawer (Mobile) */}
                  {isExpanded && hasItems && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      {bundle.items?.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-150 text-xs space-y-1">
                          <div className="flex justify-between font-semibold text-slate-800">
                            <span>{item.description || item.partCode || "Item"}</span>
                            <span>{item.qty} pcs</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Weight: {item.totalWeight || item.weight || 0} lbs</span>
                            {item.lengthFeet ? <span>Length: {item.lengthFeet} ft</span> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
