'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  CalendarCheck,
  Clock,
  Users,
  Phone,
  User,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Calendar,
  ChevronLeft,
} from 'lucide-react';

const timeSlots = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
];

const tableSizes = [
  { value: '2', label: '2 personas', icon: '🪑' },
  { value: '3', label: '3 personas', icon: '🪑🪑' },
  { value: '4', label: '4 personas', icon: '👨‍👩‍👧‍👦' },
  { value: '5', label: '5 personas', icon: '👨‍👩‍👧‍👦🪑' },
  { value: '6', label: '6 personas', icon: '👨‍👩‍👧‍👦👨‍👩‍👧‍👦' },
  { value: '8', label: '8+ personas (mesa grande)', icon: '🎉' },
];

export default function ReservationsSection() {
  const { setActiveSection, addReservation, reservations } = useStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: '',
    notes: '',
    occasion: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.time) newErrors.time = 'La hora es requerida';
    if (!formData.guests) newErrors.guests = 'Selecciona el número de personas';

    // Validate date is not in the past
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'La fecha no puede ser anterior a hoy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const code = 'NITO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setConfirmationCode(code);

    addReservation({
      ...formData,
      confirmationCode: code,
      status: 'confirmada',
      createdAt: new Date().toISOString(),
    });

    setShowSuccess(true);
    setFormData({
      name: '',
      phone: '',
      email: '',
      date: '',
      time: '',
      guests: '',
      notes: '',
      occasion: '',
    });
    setErrors({});
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#FFF8F3]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FE4F04] to-[#FF6B35] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4 -ml-4"
            onClick={() => setActiveSection('landing')}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver al inicio
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <CalendarCheck className="w-8 h-8 inline mr-2" />
            Reservar Mesa
          </h1>
          <p className="text-white/80 text-lg">
            Asegura tu lugar en Nito&apos;s Pizza. Reserva en segundos y disfruta de la mejor experiencia.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reservation Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#FE4F04]" />
                  Datos de la Reservaci&oacute;n
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#FE4F04]" />
                        Nombre completo *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Ej: María García"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={errors.name ? 'border-red-400 focus:border-red-400' : ''}
                      />
                      {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-[#FE4F04]" />
                        Tel&eacute;fono *
                      </Label>
                      <Input
                        id="phone"
                        placeholder="Ej: 951 123 4567"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={errors.phone ? 'border-red-400 focus:border-red-400' : ''}
                      />
                      {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      📧 Correo electr&oacute;nico (opcional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ej: maria@correo.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#FE4F04]" />
                        Fecha *
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        min={today}
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        className={errors.date ? 'border-red-400 focus:border-red-400' : ''}
                      />
                      {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time" className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#FE4F04]" />
                        Hora *
                      </Label>
                      <Select
                        value={formData.time}
                        onValueChange={(value) => handleChange('time', value)}
                      >
                        <SelectTrigger className={errors.time ? 'border-red-400' : ''}>
                          <SelectValue placeholder="Selecciona la hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.time && <p className="text-red-500 text-xs">{errors.time}</p>}
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#FE4F04]" />
                      N&uacute;mero de personas *
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {tableSizes.map((size) => (
                        <button
                          key={size.value}
                          type="button"
                          className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            formData.guests === size.value
                              ? 'border-[#FE4F04] bg-[#FE4F04]/5 text-[#FE4F04]'
                              : 'border-gray-200 hover:border-[#FE4F04]/50 text-gray-600'
                          }`}
                          onClick={() => handleChange('guests', size.value)}
                        >
                          <span className="block text-lg mb-1">{size.icon}</span>
                          {size.label}
                        </button>
                      ))}
                    </div>
                    {errors.guests && <p className="text-red-500 text-xs">{errors.guests}</p>}
                  </div>

                  {/* Occasion */}
                  <div className="space-y-2">
                    <Label>Ocasi&oacute;n especial (opcional)</Label>
                    <Select
                      value={formData.occasion}
                      onValueChange={(value) => handleChange('occasion', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una ocasión" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cumpleanos">🎂 Cumpleaños</SelectItem>
                        <SelectItem value="aniversario">💕 Aniversario</SelectItem>
                        <SelectItem value="negocios">💼 Reunión de negocios</SelectItem>
                        <SelectItem value="familiar">👨‍👩‍👧‍👦 Reunión familiar</SelectItem>
                        <SelectItem value="amigos">🤝 Salida con amigos</SelectItem>
                        <SelectItem value="otro">✨ Otra ocasión</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#FE4F04]" />
                      Notas especiales (opcional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Ej: Necesitamos silla para bebé, alguien es alérgico a..."
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#FE4F04] hover:bg-[#C73D00] text-white font-bold rounded-xl text-lg py-6"
                  >
                    <CalendarCheck className="mr-2 w-5 h-5" />
                    Confirmar Reservaci&oacute;n
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Restaurant Info */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#FE4F04]" />
                  Informaci&oacute;n
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Direcci&oacute;n</p>
                    <p className="text-muted-foreground">Oaxaca de Ju&aacute;rez, M&eacute;xico</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Horario</p>
                    <div className="text-muted-foreground space-y-0.5">
                      <p>Lun - Jue: 12:00 - 22:00</p>
                      <p>Vie - S&aacute;b: 12:00 - 23:00</p>
                      <p>Domingo: 12:00 - 21:00</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Tel&eacute;fono</p>
                    <p className="text-muted-foreground">+52 951 123 4567</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reservations */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Reservaciones Recientes</h3>
                {reservations.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    A&uacute;n no hay reservaciones
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {reservations.slice(0, 5).map((res, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl bg-orange-50/50"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#FE4F04]/10 flex items-center justify-center shrink-0">
                          <CalendarCheck className="w-5 h-5 text-[#FE4F04]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{res.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {res.date} a las {res.time} - {res.guests} personas
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] shrink-0 ${
                            res.status === 'confirmada'
                              ? 'bg-emerald-100 text-emerald-700'
                              : res.status === 'cancelada'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {res.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              &iexcl;Reservaci&oacute;n Confirmada!
            </DialogTitle>
            <DialogDescription className="text-center">
              Tu mesa est&aacute; reservada. Te esperamos en Nito&apos;s Pizza.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-orange-50 rounded-xl p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">C&oacute;digo de confirmaci&oacute;n</p>
            <p className="text-2xl font-extrabold text-[#FE4F04] tracking-wider">{confirmationCode}</p>
            <p className="text-xs text-muted-foreground">
              Presenta este c&oacute;digo al llegar al restaurante
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              className="bg-[#FE4F04] hover:bg-[#C73D00] text-white font-bold rounded-xl"
              onClick={() => {
                setShowSuccess(false);
                setActiveSection('menu');
              }}
            >
              Ver el Men&uacute;
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setShowSuccess(false)}
            >
              Hacer otra reservaci&oacute;n
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
