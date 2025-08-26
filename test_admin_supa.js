// Test simple para admin-supa
// Ejecutar en la consola del navegador

async function testAdminSupa() {
  try {
    console.log('🧪 Probando admin-supa...');
    
    // Test 1: Crear promoción
    const createResponse = await fetch('/.netlify/functions/admin-supa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_promotion',
        data: {
          title: 'Test Promoción',
          description: 'Promoción de prueba',
          discount_percent: 10,
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 86400000).toISOString(),
          is_active: true
        }
      })
    });
    
    console.log('📝 Create Response:', createResponse.status, createResponse.statusText);
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Create Data:', createData);
    } else {
      const errorText = await createResponse.text();
      console.error('❌ Create Error:', errorText);
    }
    
    // Test 2: Obtener promociones (usando Supabase directamente)
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      'https://fcvwqwjsypossdqochde.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdndxd2pzeXBvc3NkcW9jaGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDAwODcsImV4cCI6MjA3MTgxNjA4N30.FK40wJgJyHDnte-JLVdlvDLRsIIs3lReKkZLSpNYSgk'
    );
    
    const { data: promotions, error } = await supabase
      .from('promotions')
      .select('*')
      .limit(5);
    
    console.log('📊 Promociones existentes:', { promotions, error });
    
  } catch (error) {
    console.error('💥 Error en test:', error);
  }
}

// Ejecutar el test
testAdminSupa();
