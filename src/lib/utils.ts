import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

export function getTimeElapsed(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  return `${Math.floor(diff / 3600)}h`
}

export function getOrderTypeLabel(type: string): string {
  const labels: Record<string, string> = { LOCAL: "Local", DELIVERY: "Domicilio", TAKEOUT: "Para Llevar" }
  return labels[type] || type
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendiente", CONFIRMED: "Confirmado", PREPARING: "Preparando",
    READY: "Listo", DELIVERED: "Entregado", CANCELLED: "Cancelado",
    CANCEL_REQUESTED: "Cancel. Solicitada"
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
    PREPARING: "bg-indigo-100 text-indigo-800 border-indigo-300",
    READY: "bg-green-100 text-green-800 border-green-300",
    DELIVERED: "bg-gray-100 text-gray-800 border-gray-300",
    CANCELLED: "bg-red-100 text-red-800 border-red-300",
    CANCEL_REQUESTED: "bg-orange-100 text-orange-800 border-orange-300"
  }
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300"
}

export function getTableStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: "bg-green-50 border-green-300 text-green-700",
    OCCUPIED: "bg-red-50 border-red-300 text-red-700",
    RESERVED: "bg-yellow-50 border-yellow-300 text-yellow-700",
    MAINTENANCE: "bg-gray-50 border-gray-300 text-gray-700"
  }
  return colors[status] || "bg-gray-50 border-gray-300 text-gray-700"
}
