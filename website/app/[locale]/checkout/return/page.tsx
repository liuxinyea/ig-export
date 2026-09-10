"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function CheckoutReturn() {
  const t = useTranslations("billing");
  const [status, setStatus] = useState("checking");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    // Dodo may append customer data/keys. Do not persist or forward those values.
    window.history.replaceState(null, "", window.location.pathname);
    const controller = new AbortController();
    fetch("/api/payments/status", { cache: "no-store", signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setStatus(data.status === "succeeded" ? "succeeded" : ["failed", "cancelled"].includes(data.status) ? "failed" : "pending"))
      .catch(() => { if (!controller.signal.aborted) setStatus("unknown"); });
    return () => controller.abort();
  }, [attempt]);
  return <div className="max-w-2xl mx-auto px-5 py-24">
    <h1 className="text-3xl font-bold">{t(`return_${status}`)}</h1>
    <p className="mt-5 text-gray-600">{t(status === "succeeded" ? "delivery" : "statusNote")}</p>
    <ol className="mt-8 list-decimal pl-6 space-y-3 text-gray-700">
      <li>{t("stepEmail")}</li><li>{t("stepOpen")}</li><li>{t("stepActivate")}</li>
    </ol>
    <p className="mt-5 text-sm text-gray-500">{t("emailDelay")}</p>
    <div className="mt-8 flex gap-5 items-center">
      <button disabled={status === "checking"} onClick={() => { setStatus("checking"); setAttempt((n) => n + 1); }} className="rounded-lg bg-blue-600 text-white px-5 py-3 disabled:opacity-50">{t("recheck")}</button>
      <Link href="/pricing" className="text-blue-700">{t("backPricing")}</Link>
    </div>
  </div>;
}
