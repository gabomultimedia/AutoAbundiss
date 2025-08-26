import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Tag, Eye, EyeOff } from 'lucide-react';
import { kbAPI } from '../lib/api';
import { useToast } from '../store/useToast';
import type { KbEntry } from '../lib/schema';

export default function Knowledge() {
  const [entries, setEntries] = useState<KbEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KbEntry | null>(null);
  
  const { addToast } = useToast();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const data = await kbAPI.getAll();
      setEntries(data);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error cargando base de conocimiento',
        message: 'No se pudieron cargar las entradas',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (entryData: Omit<KbEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await kbAPI.create(entryData);
      addToast({
        type: 'success',
        title: 'Entrada creada',
        message: 'La entrada se creó exitosamente',
      });
      setShowForm(false);
      loadEntries();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error creando entrada',
        message: 'No se pudo crear la entrada',
      });
    }
  };

  const handleUpdate = async (id: string, entryData: Partial<KbEntry>) => {
    try {
      await kbAPI.update(id, entryData);
      addToast({
        type: 'success',
        title: 'Entrada actualizada',
        message: 'La entrada se actualizó exitosamente',
      });
      setEditingEntry(null);
      loadEntries();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error actualizando entrada',
        message: 'No se pudo actualizar la entrada',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
      try {
        await kbAPI.delete(id);
        addToast({
          type: 'success',
          title: 'Entrada eliminada',
          message: 'La entrada se eliminó exitosamente',
        });
        loadEntries();
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error eliminando entrada',
          message: 'No se pudo eliminar la entrada',
        });
      }
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
          <h1 className="text-3xl font-bold text-foreground">Base de Conocimiento</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona la información y recursos del sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Entrada
        </button>
      </div>

      {/* Lista de entradas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  entry.is_active 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {entry.is_active ? 'Activa' : 'Inactiva'}
                </span>
                {entry.priority > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full">
                    Prioridad {entry.priority}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingEntry(entry)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(entry.id!)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              {entry.title}
            </h3>
            
            <div className="prose prose-invert max-w-none mb-4">
              <div 
                className="text-muted-foreground text-sm line-clamp-3"
                dangerouslySetInnerHTML={{ 
                  __html: entry.content.replace(/\n/g, '<br>') 
                }} 
              />
            </div>

            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium bg-accent/20 text-accent-foreground rounded-full flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Creada: {new Date(entry.created_at).toLocaleDateString('es-ES')}
              {entry.updated_at !== entry.created_at && (
                <span className="ml-4">
                  Actualizada: {new Date(entry.updated_at).toLocaleDateString('es-ES')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay entradas en la base de conocimiento
          </h3>
          <p className="text-muted-foreground">
            Crea tu primera entrada para empezar
          </p>
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <KbEntryForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}

      {editingEntry && (
        <KbEntryForm
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSubmit={(data) => handleUpdate(editingEntry.id!, data)}
        />
      )}
    </div>
  );
}

// Componente del formulario de entrada KB
interface KbEntryFormProps {
  entry?: KbEntry;
  onClose: () => void;
  onSubmit: (data: Omit<KbEntry, 'id' | 'created_at' | 'updated_at'>) => void;
}

function KbEntryForm({ entry, onClose, onSubmit }: KbEntryFormProps) {
  const [formData, setFormData] = useState({
    title: entry?.title || '',
    content: entry?.content || '',
    tags: entry?.tags || [],
    is_active: entry?.is_active ?? true,
    priority: entry?.priority || 0,
  });
  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      return;
    }

    onSubmit(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {entry ? 'Editar Entrada' : 'Nueva Entrada'}
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                Contenido *
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Ocultar vista previa' : 'Mostrar vista previa'}
              </button>
            </div>
            
            {showPreview ? (
              <div className="w-full px-3 py-2 bg-muted border border-border rounded-lg min-h-[200px] prose prose-invert max-w-none">
                <div 
                  className="text-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: formData.content.replace(/\n/g, '<br>') 
                  }} 
                />
              </div>
            ) : (
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={10}
                placeholder="Escribe el contenido en Markdown..."
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Etiquetas
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Agregar etiqueta..."
                className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg transition-colors"
              >
                Agregar
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-sm bg-accent/20 text-accent-foreground rounded-full flex items-center gap-2"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-accent-foreground hover:text-accent-foreground/80 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={0}>Normal</option>
                <option value={1}>Baja</option>
                <option value={2}>Media</option>
                <option value={3}>Alta</option>
                <option value={4}>Crítica</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="is_active" className="text-sm text-foreground">
                Entrada activa
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {entry ? 'Actualizar' : 'Crear'}
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
