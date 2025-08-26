import React, { useState, useEffect } from 'react';
import { Upload, File, Download, Trash2, FolderOpen, FileText, Image, Film, Music } from 'lucide-react';
import { filesAPI } from '../lib/api';
import { useToast } from '../store/useToast';
import type { FileLog } from '../lib/schema';

export default function Files() {
  const [files, setFiles] = useState<FileLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const { addToast } = useToast();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const data = await filesAPI.getAll();
      setFiles(data);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error cargando archivos',
        message: 'No se pudieron cargar los archivos',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, description?: string, tags?: string[]) => {
    try {
      setUploading(true);
      await filesAPI.upload(file, description, tags);
      addToast({
        type: 'success',
        title: 'Archivo subido',
        message: 'El archivo se subió exitosamente',
      });
      loadFiles();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error subiendo archivo',
        message: 'No se pudo subir el archivo',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      try {
        await filesAPI.delete(id);
        addToast({
          type: 'success',
          title: 'Archivo eliminado',
          message: 'El archivo se eliminó exitosamente',
        });
        loadFiles();
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error eliminando archivo',
          message: 'No se pudo eliminar el archivo',
        });
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Film;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.startsWith('text/') || mimeType.includes('document')) return FileText;
    return File;
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'Imagen';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Audio';
    if (mimeType.startsWith('text/') || mimeType.includes('document')) return 'Documento';
    if (mimeType.startsWith('application/')) return 'Aplicación';
    return 'Archivo';
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
        <h1 className="text-3xl font-bold text-foreground">Archivos</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona y organiza los archivos del sistema
        </p>
      </div>

      {/* Upload de archivos */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Subir Archivo
        </h3>
        
        <FileUpload
          onUpload={handleFileUpload}
          uploading={uploading}
        />
      </div>

      {/* Lista de archivos */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Archivos ({files.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Archivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tamaño
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Subido por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {files.map((file) => {
                const Icon = getFileIcon(file.mime_type);
                return (
                  <tr key={file.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Icon className="w-8 h-8 text-primary" />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {file.filename}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {file.file_path}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-accent/20 text-accent-foreground rounded-full">
                        {getFileType(file.mime_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatFileSize(file.file_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {file.uploaded_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(file.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(file.file_path, '_blank')}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id!)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {files.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay archivos
            </h3>
            <p className="text-muted-foreground">
              Sube tu primer archivo para empezar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de upload de archivos
interface FileUploadProps {
  onUpload: (file: File, description?: string, tags?: string[]) => void;
  uploading: boolean;
}

function FileUpload({ onUpload, uploading }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      return;
    }

    onUpload(selectedFile, description || undefined, tags);
    
    // Reset form
    setSelectedFile(null);
    setDescription('');
    setTags([]);
    setNewTag('');
    if (e.target instanceof HTMLFormElement) {
      e.target.reset();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Seleccionar Archivo *
        </label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            required
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un archivo'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              O arrastra y suelta el archivo aquí
            </p>
          </label>
        </div>
      </div>

      {selectedFile && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <File className="w-6 h-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          rows={3}
          placeholder="Descripción del archivo..."
        />
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
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-sm bg-accent/20 text-accent-foreground rounded-full flex items-center gap-2"
              >
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

      <button
        type="submit"
        disabled={!selectedFile || uploading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Subiendo...' : 'Subir Archivo'}
      </button>
    </form>
  );
}
