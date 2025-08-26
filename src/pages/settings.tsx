import React, { useState, useEffect } from 'react';
import { Settings, Palette, Upload, Save, Eye, EyeOff } from 'lucide-react';
import { settingsAPI } from '../lib/api';
import { useToast } from '../store/useToast';
import { BrandLogo } from '../components/BrandLogo';

export default function Settings() {
  const [settings, setSettings] = useState({
    appName: 'Abundiss Console',
    logoUrl: '',
    brandColors: {
      primary: '#0ea5e9',
      accent: '#8b5cf6',
      background: '#0b0d12',
      foreground: '#e6e7eb',
      muted: '#334155',
      border: '#475569',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const { addToast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const appName = await settingsAPI.get('app_name') || 'Abundiss Console';
      const logoUrl = await settingsAPI.get('logo_url') || '';
      const brandColors = await settingsAPI.get('brand_colors') || {
        primary: '#0ea5e9',
        accent: '#8b5cf6',
        background: '#0b0d12',
        foreground: '#e6e7eb',
        muted: '#334155',
        border: '#475569',
      };

      setSettings({ appName, logoUrl, brandColors });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error cargando configuración',
        message: 'No se pudieron cargar las configuraciones',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await settingsAPI.update('app_name', settings.appName);
      await settingsAPI.update('logo_url', settings.logoUrl);
      await settingsAPI.update('brand_colors', settings.brandColors);
      
      addToast({
        type: 'success',
        title: 'Configuración guardada',
        message: 'Los cambios se aplicaron exitosamente',
      });
      
      // Recargar la página para aplicar los cambios
      window.location.reload();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error guardando configuración',
        message: 'No se pudieron guardar los cambios',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      brandColors: {
        ...prev.brandColors,
        [key]: value,
      },
    }));
  };

  const handleLogoUpload = async (file: File) => {
    try {
      // En un entorno real, aquí se subiría el archivo a Supabase Storage
      // Por ahora, simulamos la URL
      const logoUrl = URL.createObjectURL(file);
      setSettings(prev => ({ ...prev, logoUrl }));
      
      addToast({
        type: 'success',
        title: 'Logo actualizado',
        message: 'El logo se actualizó exitosamente',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error actualizando logo',
        message: 'No se pudo actualizar el logo',
      });
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Personaliza la apariencia y configuración del sistema
        </p>
      </div>

      {/* Configuración general */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuración General
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre de la Aplicación
            </label>
            <input
              type="text"
              value={settings.appName}
              onChange={(e) => setSettings(prev => ({ ...prev, appName: e.target.value }))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted border border-border rounded-lg flex items-center justify-center">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <BrandLogo size="sm" />
                )}
              </div>
              
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Cambiar Logo
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos soportados: PNG, JPG, SVG (máx. 2MB)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colores del branding */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Colores del Branding
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(settings.brandColors).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-foreground mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vista previa */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Vista Previa
          </h3>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Ocultar vista previa' : 'Mostrar vista previa'}
          </button>
        </div>
        
        {showPreview && (
          <div className="space-y-4">
            {/* Header preview */}
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <BrandLogo size="md" />
                <div className="text-foreground">
                  <h4 className="font-semibold">{settings.appName}</h4>
                  <p className="text-sm text-muted-foreground">Vista previa del branding</p>
                </div>
              </div>
            </div>

            {/* Button previews */}
            <div className="flex flex-wrap gap-4">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors">
                Botón Primario
              </button>
              <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg transition-colors">
                Botón Accent
              </button>
              <button className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg transition-colors">
                Botón Secundario
              </button>
            </div>

            {/* Color palette */}
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(settings.brandColors).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div
                    className="w-16 h-16 mx-auto rounded-lg border border-border mb-2"
                    style={{ backgroundColor: value }}
                  />
                  <p className="text-xs text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xs font-mono text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-4">
        <button
          onClick={loadSettings}
          className="px-4 py-2 text-foreground hover:text-foreground/80 transition-colors"
        >
          Restaurar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
