import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetFreightBidQuery } from "@/redux/api/freightApi";
import { Building, Briefcase, Truck, Package, MapPin, Tag, Scale, Maximize2, Layers, FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function CarrierRequestOverview() {
  const { token } = useParams<{ token: string }>();
  const { data: details } = useGetFreightBidQuery(token || "", {
    skip: !token,
  });
  const [expandedPlId, setExpandedPlId] = useState<string | null>(null);

  const togglePl = (id: string) => {
    setExpandedPlId(expandedPlId === id ? null : id);
  };

  if (!details) return null;

  const formatTruckType = (type: string) => {
    switch (type) {
      case "SEMI_53":
        return "Semi 53' Flatbed";
      case "HOTSHOT_40":
        return "Hotshot 40'";
      default:
        return type.replace(/_/g, " ");
    }
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col gap-6">
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Shipment Details</h3>
          <div className="flex flex-col gap-5">
            {/* Carrier */}
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Carrier</p>
                <p className="text-sm font-semibold text-slate-800">{details.carrierName}</p>
              </div>
            </div>

            {/* Project */}
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Project</p>
                <p className="text-sm font-semibold text-slate-800">{details.projectName}</p>
              </div>
            </div>

            {/* Job ID & Delivery Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Job ID</p>
                  <p className="text-sm font-semibold text-slate-800">{details.jobId}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Delivery #</p>
                  <p className="text-sm font-semibold text-slate-800 text-nowrap truncate">{details.deliveryNumber}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Description</p>
                <p className="text-sm font-semibold text-slate-800">{details.description}</p>
              </div>
            </div>

            {/* Load Weight & Package Count */}
            {(details.loadWeight !== undefined || details.packageCount !== undefined) && (
              <div className="grid grid-cols-2 gap-4">
                {details.loadWeight !== undefined && (
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Scale className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Weight</p>
                      <p className="text-sm font-semibold text-slate-800">{details.loadWeight.toLocaleString()} lbs</p>
                    </div>
                  </div>
                )}

                {details.packageCount !== undefined && (
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Packages</p>
                      <p className="text-sm font-semibold text-slate-800">{details.packageCount} bundle(s)</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dimensions & Material Type */}
            {(details.dimensions || details.materialType) && (
              <div className="flex flex-col gap-4">
                {details.dimensions && (
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Maximize2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Dimensions (LxWxH)</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {details.dimensions.lengthFeet}' x {details.dimensions.widthFeet}' x {details.dimensions.heightFeet}'
                      </p>
                    </div>
                  </div>
                )}

                {details.materialType && (
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Material Type</p>
                      <p className="text-sm font-semibold text-slate-800 capitalize">{details.materialType}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Route Section */}
            <div className="pt-4 border-t border-slate-55 flex flex-col gap-4 relative">
              {/* Dotted vertical connector */}
              <div className="absolute left-[25px] top-[40px] bottom-[30px] border-l-2 border-dashed border-slate-200" />

              <div className="flex gap-3 items-start relative z-10">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pickup</p>
                  <p className="text-sm font-semibold text-slate-800">{details.pickupLocation}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start relative z-10">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Delivery</p>
                  <p className="text-sm font-semibold text-slate-800">{details.deliveryLocation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Packing Lists Section */}
        {details.packingLists && details.packingLists.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-blue-500" />
              Packing Lists ({details.packingLists.length})
            </h4>
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1 ">
              {details.packingLists.map((pl) => {
                const isExpanded = expandedPlId === pl._id;
                const relatedBundles = details.bundles?.filter(
                  (b) => b.packingListId === pl._id || b.packingListId === pl.packingListNo
                ) || [];

                return (
                  <div
                    key={pl._id}
                    className="flex flex-col bg-slate-50/50 rounded-xl border border-slate-150 overflow-hidden transition-all duration-200"
                  >
                    {/* Header Row (Clickable Accordion Trigger) */}
                    <div
                      onClick={() => togglePl(pl._id)}
                      className="flex justify-between items-center px-3 py-2.5 hover:bg-slate-100/50 cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                        )}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-750 shrink-0">
                          {formatTruckType(pl.truckType)}
                        </span>
                        {pl._id ? (
                          <a
                            href={`/packing-list/${pl._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline font-mono truncate"
                            title="View Packing List Details"
                          >
                            {pl.packingListNo}
                          </a>
                        ) : details.packingListPlan?._id ? (
                          <a
                            href={`/packing-list-plan/${details.packingListPlan._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline font-mono truncate"
                            title="View Packing List Plan Details"
                          >
                            {pl.packingListNo}
                          </a>
                        ) : (
                          <span className="text-sm font-bold text-slate-800 font-mono truncate">
                            {pl.packingListNo}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-bold shrink-0">
                        {pl.totalWeight.toLocaleString()} lbs
                      </span>
                    </div>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-white/50 flex flex-col gap-2">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
                          <Package className="h-3 w-3 text-slate-400" />
                          Bundles ({relatedBundles.length})
                        </div>
                        {relatedBundles.length > 0 ? (
                          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 pb-2">
                            {relatedBundles.map((bundle) => (
                              <div
                                key={bundle._id}
                                className="bg-white p-2.5 rounded-lg border border-slate-150 shadow-xs text-xs flex flex-col gap-1 hover:border-blue-200 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-mono font-bold text-slate-800">
                                    {bundle.bundleNo}
                                  </span>
                                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide border border-slate-200">
                                    {bundle.bundleType}
                                  </span>
                                </div>
                                <div className="flex justify-between text-slate-500 text-[10px] font-medium pt-0.5">
                                  <span>
                                    Qty: <strong className="text-slate-700">{bundle.totalQty}</strong>
                                  </span>
                                  <span>
                                    Weight:{" "}
                                    <strong className="text-slate-700">
                                      {bundle.totalWeight.toLocaleString()} lbs
                                    </strong>
                                  </span>
                                  {bundle.maxLengthFeet !== undefined && (
                                    <span>
                                      Length:{" "}
                                      <strong className="text-slate-700">
                                        {bundle.maxLengthFeet.toFixed(1)} ft
                                      </strong>
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic pl-1">
                            No bundles assigned to this packing list.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
