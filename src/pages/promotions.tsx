import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Tag } from 'lucide-react';
import { promotionsAPI } from '../lib/api';
import { useToast } from '../store/useToast';
import type { Promotion } from '../lib/schema';

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  
  const { addToast } = useToast();

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setIsLoading(true);
      const data = await promotionsAPI.getAll();
      setPromotions(data);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error cargando promociones',
        message: 'No se pudieron cargar las promociones',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (promotionData: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await promotionsAPI.create(promotionData);
      addToast({
        type: 'success',
        title: 'Promoción creada',
        message: 'La promoción se creó exitosamente',
      });
      setShowForm(false);
      loadPromotions();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error creando promoción',
        message: 'No se pudo crear la promoción',
      });
    }
  };

  const handleUpdate = async (id: string, promotionData: Partial<Promotion>) => {
    try {
      await promotionsAPI.update(id, promotionData);
      addToast({
        type: 'success',
        title: 'Promoción actualizada',
        message: 'La promoción se actualizó exitosamente',
      });
      setEditingPromotion(null);
      loadPromotions();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error actualizando promoción',
        message: 'No se pudo actualizar la promoción',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      try {
        await promotionsAPI.delete(id);
        addToast({
          type: 'success',
          title: 'Promoción eliminada',
          message: 'La promoción se eliminó exitosamente',
        });
        loadPromotions();
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error eliminando promoción',
          message: 'No se pudo eliminar la promoción',
        });
      }
    }
  };

  const getStatusColor = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.starts_at);
    const endDate = new Date(promotion.ends_at);
    
    if (!promotion.is_active) return 'bg-gray-500/20 text-gray-300';
    if (now < startDate) return 'bg-yellow-500/20 text-yellow-300';
    if (now > endDate) return 'bg-red-500/20 text-red-300';
    return 'bg-green-500/20 text-green-300';
  };

  const getStatusText = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.starts_at);
    const endDate = new Date(promotion.ends_at);
    
    if (!promotion.is_active) return 'Inactiva';
    if (now < startDate) return 'Próximamente';
    if (now > endDate) return 'Expirada';
    return 'Activa';
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
          <h1 className="text-3xl font-bold text-foreground">Promociones</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las promociones y ofertas del sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Promoción
        </button>
      </div>

      {/* Lista de promociones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promotion) => (
          <div key={promotion.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(promotion)}`}>
                  {getStatusText(promotion)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingPromotion(promotion)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(promotion.id!)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              {promotion.title}
            </h3>
            
            {promotion.description && (
              <p className="text-muted-foreground text-sm mb-4">
                {promotion.description}
              </p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Inicio:</span>
                <span className="text-foreground">
                  {new Date(promotion.starts_at).toLocaleDateString('es-ES')}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Fin:</span>
                <span className="text-foreground">
                  {new Date(promotion.ends_at).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              {promotion.discount_percent && (
                <div className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                  {promotion.discount_percent}% descuento
                </div>
              )}
              {promotion.discount_amount && (
                <div className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                  ${promotion.discount_amount} descuento
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {promotions.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay promociones
          </h3>
          <p className="text-muted-foreground">
            Crea tu primera promoción para empezar
          </p>
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <PromotionForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}

      {editingPromotion && (
        <PromotionForm
          promotion={editingPromotion}
          onClose={() => setEditingPromotion(null)}
          onSubmit={(data) => handleUpdate(editingPromotion.id!, data)}
        />
      )}
    </div>
  );
}

// Componente del formulario de promoción
interface PromotionFormProps {
  promotion?: Promotion;
  onClose: () => void;
  onSubmit: (data: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>) => void;
}

function PromotionForm({ promotion, onClose, onSubmit }: PromotionFormProps) {
  const [formData, setFormData] = useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    discount_percent: promotion?.discount_percent !== undefined ? promotion.discount_percent : undefined,
    discount_amount: promotion?.discount_amount !== undefined ? promotion.discount_amount : undefined,
    starts_at: promotion?.starts_at ? promotion.starts_at.split('T')[0] : '',
    ends_at: promotion?.ends_at ? promotion.ends_at.split('T')[0] : '',
    is_active: promotion?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.starts_at || !formData.ends_at) {
      return;
    }

    // Asegurar que solo se envíe un tipo de descuento
    const submitData = {
      ...formData,
      starts_at: new Date(formData.starts_at).toISOString(),
      ends_at: new Date(formData.ends_at).toISOString(),
    };

    // Si no hay descuento seleccionado, usar porcentaje por defecto
    if (submitData.discount_percent === undefined && submitData.discount_amount === undefined) {
      submitData.discount_percent = 0;
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {promotion ? 'Editar Promoción' : 'Nueva Promoción'}
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
            <label className="block text-sm font-medium text-foreground mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tipo de Descuento
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="discount_percent"
                  name="discount_type"
                  checked={formData.discount_percent !== undefined}
                  onChange={() => setFormData(prev => ({ 
                    ...prev, 
                    discount_percent: 0,
                    discount_amount: undefined 
                  }))}
                  className="text-primary focus:ring-primary"
                />
                <label htmlFor="discount_percent" className="text-sm text-foreground">
                  Porcentaje (%)
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="discount_amount"
                  name="discount_type"
                  checked={formData.discount_amount !== undefined}
                  onChange={() => setFormData(prev => ({ 
                    ...prev, 
                    discount_amount: 0,
                    discount_percent: undefined 
                  }))}
                  className="text-primary focus:ring-primary"
                />
                <label htmlFor="discount_amount" className="text-sm text-foreground">
                  Monto fijo ($)
                </label>
              </div>
            </div>
          </div>

          {formData.discount_percent !== undefined && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descuento (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount_percent || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  discount_percent: e.target.value ? parseInt(e.target.value) : 0 
                }))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          )}

          {formData.discount_amount !== undefined && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descuento ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_amount || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  discount_amount: e.target.value ? parseFloat(e.target.value) : 0 
                }))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha inicio *
              </label>
              <input
                type="date"
                value={formData.starts_at}
                onChange={(e) => setFormData(prev => ({ ...prev, starts_at: e.target.value }))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha fin *
              </label>
              <input
                type="date"
                value={formData.ends_at}
                onChange={(e) => setFormData(prev => ({ ...prev, ends_at: e.target.value }))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm text-foreground">
              Promoción activa
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {promotion ? 'Actualizar' : 'Crear'}
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
