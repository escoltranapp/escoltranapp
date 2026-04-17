"use client"

import dynamic from "next/dynamic"

const ActivitiesModule = dynamic(
  () => import("@/components/activities/ActivitiesModule"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col h-screen bg-[#0A0A0A] p-12 overflow-hidden">
        <div className="w-full h-24 bg-white/5 animate-pulse rounded-3xl mb-12" />
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white/[0.03] animate-pulse rounded-3xl" />
          ))}
        </div>
        <div className="flex-1 bg-white/[0.02] animate-pulse rounded-[48px]" />
      </div>
    ),
  }
)

export default function ActivitiesPage() {
  return <ActivitiesModule />
}
