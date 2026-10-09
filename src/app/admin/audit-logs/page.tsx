import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import { Shield, Clock, User, CheckCircle2, XCircle } from "lucide-react";

export default async function AuditLogsPage() {
  const session = await getCurrentSession();
  if (!session || !isSuperAdmin(session)) {
    redirect("/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
    take: 50,
    orderBy: { timestamp: "desc" },
    include: {
      user: { select: { fullName: true, username: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B2545]">
          <Shield className="w-4 h-4" />
          <span>Tamper-Resistant Security Logs</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mt-1">
          System Audit Trail
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Real-time institutional logging of administrative operations, attendance submissions, modifications, and logins.
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B2545] text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {log.user?.fullName || "System / Anonymous"}
                    {log.user?.username && (
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        ({log.user.username})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900">{log.resource}</span>
                    {log.resourceId && (
                      <span className="text-[10px] text-slate-400 font-mono ml-1">
                        #{log.resourceId.slice(-6)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {log.status === "SUCCESS" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SUCCESS</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <XCircle className="w-3 h-3" />
                        <span>FAILURE</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-500 font-mono max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No audit events recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
