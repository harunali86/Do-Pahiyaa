export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { startOfDay, subDays, format, startOfMonth, subMonths } from "date-fns";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminAccess } from "@/lib/auth/authorization";
import { RevenueInsightsClient } from "@/components/admin/RevenueInsightsClient";

type Txn = {
  id: string;
  created_at: string;
  type: string;
  status: string;
  amount: number;
  dealer_id: string | null;
};

function toNumber(value: unknown) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function groupByDay(transactions: Txn[]) {
  const points = [];
  for (let i = 6; i >= 0; i -= 1) {
    const current = startOfDay(subDays(new Date(), i));
    const dayLabel = format(current, "EEE");
    const sameDay = transactions.filter((txn) => {
      const date = new Date(txn.created_at);
      return date >= current && date < new Date(current.getTime() + 86400000);
    });

    points.push({
      label: dayLabel,
      revenue: sameDay.reduce((acc, txn) => acc + toNumber(txn.amount), 0),
      transactions: sameDay.length,
    });
  }
  return points;
}

function groupByMonth(transactions: Txn[]) {
  const points = [];
  for (let i = 11; i >= 0; i -= 1) {
    const monthStart = startOfMonth(subMonths(new Date(), i));
    const monthLabel = format(monthStart, "MMM");
    const nextMonth = startOfMonth(subMonths(new Date(), i - 1));
    const sameMonth = transactions.filter((txn) => {
      const date = new Date(txn.created_at);
      return date >= monthStart && date < nextMonth;
    });

    points.push({
      label: monthLabel,
      revenue: sameMonth.reduce((acc, txn) => acc + toNumber(txn.amount), 0),
      transactions: sameMonth.length,
    });
  }
  return points;
}

function groupByYear(transactions: Txn[]) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, idx) => currentYear - (4 - idx));
  return years.map((year) => {
    const sameYear = transactions.filter((txn) => new Date(txn.created_at).getFullYear() === year);
    return {
      label: String(year),
      revenue: sameYear.reduce((acc, txn) => acc + toNumber(txn.amount), 0),
      transactions: sameYear.length,
    };
  });
}

export default async function AdminRevenuePage() {
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdminAccess(supabase);
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect("/auth/login?next=/admin/revenue");
    }
    redirect("/");
  }

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("transactions")
    .select("id, created_at, type, status, amount, dealer_id")
    .order("created_at", { ascending: false })
    .limit(5000);

  const allTransactions: Txn[] = (data || []).map((txn: any) => ({
    id: txn.id,
    created_at: txn.created_at,
    type: txn.type || "credit_purchase",
    status: txn.status || "pending",
    amount: toNumber(txn.amount),
    dealer_id: txn.dealer_id || null,
  }));

  const successful = allTransactions.filter((txn) => txn.status === "success");
  const pending = allTransactions.filter((txn) => txn.status === "pending");
  const failed = allTransactions.filter((txn) => txn.status === "failed");

  const summary = {
    grossRevenue: successful.reduce((acc, txn) => acc + txn.amount, 0),
    leadRevenue: successful
      .filter((txn) => txn.type === "credit_purchase" || txn.type === "lead_unlock")
      .reduce((acc, txn) => acc + txn.amount, 0),
    subscriptionRevenue: successful
      .filter((txn) => txn.type === "subscription")
      .reduce((acc, txn) => acc + txn.amount, 0),
    auctionRevenue: successful
      .filter((txn) => txn.type === "auction_fee")
      .reduce((acc, txn) => acc + txn.amount, 0),
    successCount: successful.length,
    pendingCount: pending.length,
    failedCount: failed.length,
  };

  return (
    <RevenueInsightsClient
      weeklySeries={groupByDay(successful)}
      monthlySeries={groupByMonth(successful)}
      yearlySeries={groupByYear(successful)}
      summary={summary}
      recentTransactions={allTransactions.slice(0, 40)}
    />
  );
}
