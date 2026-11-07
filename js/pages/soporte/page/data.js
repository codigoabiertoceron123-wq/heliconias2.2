// soporte - data
// Refactor modular: lógica original preservada.

// Función para verificar si el bucket existe (VERSIÓN CORREGIDA)
async function verificarBucket() {
  try {
    const { data, error } = await supabase.storage.getBucket('soportes');
    if (error) {
      if (error.message.includes('not found')) {
        console.warn('❌ Bucket "soportes" no encontrado');
        return false;
      }
      throw error;
    }
    console.log('✅ Bucket "soportes" verificado');
    return true;
  } catch (error) {
    console.warn('⚠️ No se pudo verificar el bucket:', error.message);
    return false;
  }
}
