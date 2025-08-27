import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, ExternalLink, Trash2 } from 'lucide-react';
import { calendarAPI } from '../lib/api';
import { useToast } from '../store/useToast';
import type { GcalEvent } from '../lib/schema';

export default function Calendar() {
  const [events, setEvents] = useState<GcalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const { addToast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await calendarAPI.getEvents();
      setEvents(data);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error cargando eventos',
        message: 'No se pudieron cargar los eventos del calendario',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: {
    title: string;
    startISO: string;
    endISO: string;
    notes?: string;
  }) => {
    try {
      await calendarAPI.createEvent(eventData);
      addToast({
        type: 'success',
        title: 'Evento creado',
        message: 'El evento se creó exitosamente en Google Calendar',
      });
      setShowForm(false);
      loadEvents();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error creando evento',
        message: 'No se pudo crear el evento',
      });
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el evento "${eventTitle}"?`)) {
      return;
    }
    try {
      await calendarAPI.deleteEvent(eventId);
      addToast({
        type: 'success',
        title: 'Evento eliminado',
        message: `El evento "${eventTitle}" ha sido eliminado.`,
      });
      loadEvents();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error eliminando evento',
        message: `No se pudo eliminar el evento "${eventTitle}".`,
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEventStatus = (event: GcalEvent) => {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'ongoing';
    return 'past';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-300';
      case 'ongoing': return 'bg-green-500/20 text-green-300';
      case 'past': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Próximo';
      case 'ongoing': return 'En curso';
      case 'past': return 'Finalizado';
      default: return 'Desconocido';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendario</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona eventos y citas del sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Evento
        </button>
      </div>

      {/* Vista de eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event) => {
          const status = getEventStatus(event);
          return (
            <div key={event.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </span>
                </div>
                
                {event.html_link && (
                  <a
                    href={event.html_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                    title="Abrir en Google Calendar"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                                     onClick={() => {
                     const title = event.title || 'Sin título';
                     handleDeleteEvent(event.id, title as string);
                   }}
                  className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                  title="Eliminar evento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">
                {event.title}
              </h3>
              
              {event.description && (
                <p className="text-muted-foreground text-sm mb-4">
                  {event.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Inicio:</span>
                  <span className="text-foreground">
                    {formatTime(event.start_time)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Fin:</span>
                  <span className="text-foreground">
                    {formatTime(event.end_time)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {formatDate(event.start_time)}
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay eventos programados
          </h3>
          <p className="text-muted-foreground">
            Crea tu primer evento para empezar
          </p>
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <EventForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateEvent}
        />
      )}
    </div>
  );
}

// Componente del formulario de evento
interface EventFormProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    startISO: string;
    endISO: string;
    notes?: string;
  }) => void;
}

function EventForm({ onClose, onSubmit }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      return;
    }

    const startISO = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
    const endISO = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

    onSubmit({
      title: formData.title,
      startISO,
      endISO,
      notes: formData.notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Nuevo Evento
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha inicio *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Hora inicio
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha fin *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Hora fin
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="Descripción del evento..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Crear Evento
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
