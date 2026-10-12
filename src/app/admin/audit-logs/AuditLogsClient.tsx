"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Globe,
  Laptop,
  Smartphone,
  Tablet,
  Search,
  Filter,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Terminal,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  description: string;
  actorName: string;
  actorUsername: string;
  resource: string;
  resourceId?: string | null;
  status: string;
  ipAddress: string;
  userAgent: string;
  deviceType: "Mobile" | "Tablet" | "Desktop" | "Bot" | "Unknown";
  deviceSummary: string;
  timestamp: string;
  formattedTime: string;
  details: any;
}

export default function AuditLogsClient({
  initialLogs,
}: {
  initialLogs: AuditLogItem[];
}) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const distinctActions = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.action))).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !searchQuery.trim() ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actorUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.includes(searchQuery) ||
        log.deviceSummary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction = selectedAction === "ALL" || log.action === selectedAction;
      const matchesStatus = selectedStatus === "ALL" || log.status === selectedStatus;

      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [logs, searchQuery, selectedAction, selectedStatus]);

  const renderDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "Mobile":
        return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
      case "Tablet":
        return <Tablet className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition shadow-xs flex-shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B2545]">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Immutable Institutional Audit Logs</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              System Audit Trail
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Real-time chronological recording of all operations with IP addresses, device signatures, and exact actions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700">
            Total Logged: <strong>{logs.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, actor, IP address, device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Actions</option>
              {distinctActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILURE">FAILURE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-40">Timestamp</th>
                <th className="py-3 px-4">Action &amp; Description</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Device &amp; Browser</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{log.formattedTime}</div>
                      </td>

                      {/* Action & Exact Description */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {log.action}
                          </span>
                          <span className="text-slate-500 text-[10px]">•</span>
                          <span className="text-xs font-bold text-slate-900">
                            {log.description}
                          </span>
                        </div>
                        {log.resource && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Target: {log.resource} {log.resourceId ? `#${log.resourceId.slice(-6)}` : ""}
                          </div>
                        )}
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{log.actorName}</div>
                        <div className="text-[11px] font-mono text-purple-700">
                          {log.actorUsername}
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-xl text-slate-700 border border-slate-200">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{log.ipAddress}</span>
                        </span>
                      </td>

                      {/* Device & Browser */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-xs text-slate-800">
                          {renderDeviceIcon(log.deviceType)}
                          <span>{log.deviceSummary}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        {log.status === "SUCCESS" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            SUCCESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            FAILURE
                          </span>
                        )}
                      </td>

                      {/* Details toggle */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-600 transition"
                        >
                          <span>{isExpanded ? "Hide" : "Inspect"}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No audit log records match the chosen search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
