'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { CalendarDays, Clock, Users, Check, Phone, MapPin } from 'lucide-react'

const FOOTER = `© 2026 Nito's Pizza. Todos los derechos reservados. Hecho con amor en Oaxaca, México. Diseño y Software por SynkData`

interface TableInfo { id: string; number: number; capacity: number; status: string; area: string }

export default function ReservePage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState('2')
  const [selectedTable, setSelectedTable] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables')
      const data = await res.json()
      setTables(data)
    } catch (err) {
      console.error('Error fetching tables:', err)
    } finally {
      setLoading(false)
    }
  }

  const availableTables = tables.filter(t => t.status === 'AVAILABLE' && t.capacity >= parseInt(guests || '0'))

  const timeSlots = []
  for (let h = 12; h <= 21; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`)
    if (h < 21) timeSlots.push(`${h.toString().padStart(2, '0')}:30`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !date || !time || !guests) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email || null,
          date, time,
          guests: parseInt(guests),
          tableId: selectedTable || null,
          notes: notes || null
        })
      })

      if (res.ok) {
        setSubmitted(true)
        toast.success('¡Reservación creada exitosamente!')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al crear reservación')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-nunito">
      {/* Header */}
      <header className="bg-[#111111] text-white py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E31E24] flex items-center justify-center"><span className="text-lg">🍕</span></div>
          <span className="font-bebas text-2xl tracking-wider">NITO&apos;S PIZZA - RESERVAR</span>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-lg mx-auto">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Check size={40} className="text-green-600" />
              </div>
              <h2 className="font-bebas text-3xl mb-2">¡RESERVACIÓN CONFIRMADA!</h2>
              <p className="text-gray-600 mb-6">Te hemos registrado tu reservación. Te contactaremos para confirmar.</p>
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-left space-y-2 mb-6">
                <p><strong>Nombre:</strong> {name}</p>
                <p><strong>Fecha:</strong> {date}</p>
                <p><strong>Hora:</strong> {time}</p>
                <p><strong>Personas:</strong> {guests}</p>
                {notes && <p><strong>Notas:</strong> {notes}</p>}
              </div>
              <div className="flex gap-3 justify-center">
                <a href={`https://wa.me/+5219514618850`} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                    <Phone size={16} className="mr-2" /> Confirmar por WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-bebas text-3xl text-center mb-2">RESERVAR MESA</h2>
              <p className="text-center text-gray-500 mb-8">Reserva tu lugar en Nito&apos;s Pizza</p>

              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-5">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-1"><CalendarDays size={14} /> Fecha</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={minDate} required className="mt-1" />
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-1"><Clock size={14} /> Hora</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar hora" /></SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-1"><Users size={14} /> Número de personas</Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? 'persona' : 'personas'}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Available Tables */}
                {availableTables.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold">Mesa preferida</Label>
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Sin preferencia" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin preferencia</SelectItem>
                        {availableTables.map(t => (
                          <SelectItem key={t.id} value={t.id}>Mesa {t.number} - {t.area} ({t.capacity} personas)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator className="bg-gray-200" />

                <div>
                  <Label className="text-sm font-semibold">Nombre completo *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" required className="mt-1" />
                </div>

                <div>
                  <Label className="text-sm font-semibold">Teléfono *</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="951..." required className="mt-1" />
                </div>

                <div>
                  <Label className="text-sm font-semibold">Email (opcional)</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className="mt-1" />
                </div>

                <div>
                  <Label className="text-sm font-semibold">Notas especiales</Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: Cumpleaños, alergias, etc." className="mt-1 resize-none h-20" />
                </div>

                <Button type="submit" disabled={submitting} className="w-full bg-[#E31E24] hover:bg-[#c4191f] text-white font-bold py-3 rounded-xl">
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Reservando...
                    </span>
                  ) : (
                    'Reservar Mesa'
                  )}
                </Button>
              </form>
            </motion.div>
          )}

          {/* Business Info */}
          <div className="mt-8 text-center space-y-2 text-sm text-gray-500">
            <p className="flex items-center justify-center gap-1"><MapPin size={14} /> Carretera Cristóbal Colón km 30.1, Tlacolula, Oaxaca</p>
            <p className="flex items-center justify-center gap-1"><Phone size={14} /> (951) 725-0827</p>
            <p className="flex items-center justify-center gap-1"><Clock size={14} /> Lunes – Domingo 12:00 PM – 10:00 PM</p>
          </div>
        </div>
      </main>

      <footer className="py-4 px-6 text-center border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {FOOTER} (<a href="https://synkdata.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">synkdata.online</a>)
        </p>
      </footer>
    </div>
  )
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px ${className || 'bg-border'}`} />
}
