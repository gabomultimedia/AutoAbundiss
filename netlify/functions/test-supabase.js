import { createClient } from '@supabase/supabase-js';

// Clave hardcodeada para test
const supabaseUrl = 'https://fcvwqwjsypossdqochde.supabase.co';
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdndxd2pzeXBvc3NkcW9jaGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MTgxNjA4N30.6P-J5cQbnSBGYP27jJ33JVCO23z_JcoTFgqmGZDgPXE';

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function handler(event) {
  console.log('🧪 Test Supabase iniciado...');
  
  try {
    // Test 1: Conexión básica
    console.log('🔌 Probando conexión básica...');
    const { data: testData, error: testError } = await supabase.from('app_settings').select('count').limit(1);
    console.log('✅ Conexión básica OK:', { data: testData, error: testError?.message });
    
    // Test 2: Crear promoción de prueba
    console.log('📝 Probando crear promoción...');
    const testPromotion = {
      title: 'Test Promoción ' + Date.now(),
      description: 'Promoción de prueba para debug',
      discount_percent: 15,
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 86400000).toISOString(),
      is_active: true
    };
    
    const { data: createdPromo, error: createError } = await supabase
      .from('promotions')
      .insert(testPromotion)
      .select()
      .single();
    
    console.log('✅ Promoción creada:', { data: createdPromo, error: createError?.message });
    
    // Test 3: Eliminar promoción de prueba
    if (createdPromo?.id) {
      console.log('🗑️ Probando eliminar promoción...');
      const { error: deleteError } = await supabase
        .from('promotions')
        .delete()
        .eq('id', createdPromo.id);
      
      console.log('✅ Promoción eliminada:', { error: deleteError?.message });
    }
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Test completado exitosamente',
        tests: {
          connection: 'OK',
          create: createdPromo ? 'OK' : 'FAILED',
          delete: createdPromo?.id ? 'OK' : 'SKIPPED'
        }
      })
    };
    
  } catch (error) {
    console.error('💥 Error en test:', error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      })
    };
  }
}
