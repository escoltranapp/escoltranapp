"use client"

import { useDroppable } from "@dnd-kit/core"

interface KanbanColumnProps {
  id: string
  deals: any[]
  children: React.ReactNode
}

export function KanbanColumn({ id, children }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  })

  return (
    <div 
      ref={setNodeRef} 
      className="flex-1 flex flex-col gap-3 min-h-[500px]"
    >
      {children}
    </div>
  )
}
