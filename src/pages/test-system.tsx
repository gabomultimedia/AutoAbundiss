import { useState } from 'react';
import { Play, MessageSquare, DollarSign, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../store/useToast';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function TestSystem() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testMessage, setTestMessage] = useState('Hola, me gustaría saber más sobre sus servicios de desarrollo web');
  const [testChatId, setTestChatId] = useState('test_lead_123');
  
  const { addToast } = useToast();

  const runTest = async (testType: string) => {
    setIsRunning(true);
    setResults(prev => [...prev, {
      test: testType,
      status: 'pending',
      message: 'Ejecutando prueba...'
    }]);

    try {
      console.log(`🧪 Ejecutando prueba: ${testType}`);
      
      const response = await fetch('/.netlify/functions/test-kommo-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType,
          message: testMessage,
          chat_id: testChatId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(prev => prev.map(r => 
          r.test === testType 
            ? { ...r, status: 'success', message: 'Prueba exitosa', details: data }
            : r
        ));
        
        addToast({
          type: 'success',
          title: `Prueba ${testType} exitosa`,
          message: 'El sistema funcionó correctamente'
        });
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error) {
      console.error(`❌ Error en prueba ${testType}:`, error);
      
      setResults(prev => prev.map(r => 
        r.test === testType 
          ? { ...r, status: 'error', message: `Error: ${error instanceof Error ? error.message : 'Desconocido'}` }
          : r
      ));
      
      addToast({
        type: 'error',
        title: `Error en prueba ${testType}`,
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    const tests = [
      'conversacion',
      'cotiza', 
      'agenda',
      'molesto'
    ];

    for (const test of tests) {
      await runTest(test);
      // Pequeña pausa entre pruebas
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-blue-500 bg-blue-50';
      case 'success': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pruebas del Sistema</h1>
        <p className="text-muted-foreground mt-2">
          Verifica que todo el pipeline de Kommo + IA funcione correctamente
        </p>
      </div>

      {/* Configuración de pruebas */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Configuración de Pruebas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Mensaje de Prueba
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="Escribe un mensaje para probar..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Chat ID de Prueba
            </label>
            <input
              type="text"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="ID del chat para pruebas"
            />
          </div>
        </div>
      </div>

      {/* Botones de prueba */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Ejecutar Pruebas</h3>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => runTest('conversacion')}
            disabled={isRunning}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Prueba Conversación
          </button>

          <button
            onClick={() => runTest('cotiza')}
            disabled={isRunning}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Prueba Cotización
          </button>

          <button
            onClick={() => runTest('agenda')}
            disabled={isRunning}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Prueba Agenda
          </button>

          <button
            onClick={() => runTest('molesto')}
            disabled={isRunning}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Prueba Cliente Molesto
          </button>

          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 mr-2" />
            Ejecutar Todas
          </button>

          <button
            onClick={clearResults}
            className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md shadow-sm text-foreground bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-border"
          >
            Limpiar Resultados
          </button>
        </div>
      </div>

      {/* Resultados de las pruebas */}
      {results.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Resultados de las Pruebas</h3>
          
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <span className="font-medium text-foreground">
                      {result.test.charAt(0).toUpperCase() + result.test.slice(1)}
                    </span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    result.status === 'success' ? 'bg-green-100 text-green-800' :
                    result.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {result.status === 'pending' ? 'Ejecutando...' :
                     result.status === 'success' ? 'Exitoso' : 'Error'}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mt-2">
                  {result.message}
                </p>

                {result.details && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary">
                      Ver detalles
                    </summary>
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <pre className="text-xs text-foreground overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información del sistema */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Información del Sistema</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-foreground mb-2">Funciones Implementadas:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>✅ Webhook de Kommo</li>
              <li>✅ Clasificador de intenciones (Deepseek)</li>
              <li>✅ Generador de respuestas (Deepseek)</li>
              <li>✅ Generador de cotizaciones (Deepseek)</li>
              <li>✅ Integración con Google Calendar</li>
              <li>✅ Base de datos Supabase</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-2">Flujo de Prueba:</h4>
            <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
              <li>Mensaje simulado → msg_buffer</li>
              <li>Clasificación de intención</li>
              <li>Generación de respuesta IA</li>
              <li>Guardado en conversaciones</li>
              <li>Limpieza del buffer</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
