import React, { useState, useEffect } from "react";
import { ScrollText, ShieldAlert, Loader2, Calendar } from "lucide-react";
import Badge from "../../components/common/Badge";
import api from "../../api/client";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/audit-logs?limit=100");
      if (res.data?.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes("DELETE")) return "pink";
    if (action.includes("SALE")) return "lime";
    if (action.includes("CREATE")) return "yellow";
    return "blue";
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="sticker-panel p-5 bg-yellow/20 shadow-funky">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ink uppercase tracking-wider mb-0.5">
          <ScrollText size={16} /> Accountability Trail
        </div>
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
          Operational Audit Logs
        </h2>
        <p className="text-xs text-gray-700">
          Immutable log of administrative operations: product edits, bill
          finalizations, and account changes.
        </p>
      </div>

      {/* Logs Table */}
      <div className="sticker-panel p-5 bg-white shadow-funky">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2
              size={32}
              className="text-pink animate-spin mx-auto mb-2"
            />
            <span className="font-heading font-bold text-base text-ink">
              Loading audit records...
            </span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <ScrollText size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="font-heading font-bold text-lg text-ink">
              No logs recorded yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-3 border-ink bg-panel-bg text-ink uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Administrator</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Entity</th>
                  <th className="py-3 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200 font-semibold">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-yellow/10 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-gray-500 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-ink">
                      {log.performedByName || "Unknown"}
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize text-gray-700">
                        {log.performedByRole}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge color={getActionColor(log.action)} size="xs">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-600">
                      {log.entity}{" "}
                      {log.entityId ? `#${log.entityId.slice(-6)}` : ""}
                    </td>
                    <td className="py-3 px-3 text-[11px] font-mono text-gray-700 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
