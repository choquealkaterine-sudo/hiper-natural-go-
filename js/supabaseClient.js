/* ==========================================================================
   supabaseClient.js
   --------------------------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para pasar del modo LOCAL
   (datos de demostración guardados en el navegador) al modo SUPABASE
   (base de datos real en la nube).

   FASE 1 (proyecto local, sin base de datos):
     - Dejar USAR_SUPABASE en false.
     - No es necesario completar SUPABASE_URL ni SUPABASE_ANON_KEY.
     - El sistema funciona igual, usando localStorage.

   FASE 2 (cuando se integre Supabase):
     1. Crear el proyecto en https://supabase.com
     2. Ejecutar el archivo sql/schema.sql en el "SQL Editor" de Supabase.
     3. Copiar la "Project URL" y la "anon public key" desde
        Configuración del proyecto > API, y pegarlas abajo.
     4. Cambiar USAR_SUPABASE a true.
     5. (Cuando corresponda) ejecutar sql/migracion_rls.sql y
        sql/migracion_storage.sql.

   El resto del código (js/app.js) NUNCA debe modificarse para hacer este
   cambio: allí las funciones ya están preparadas para revisar el valor
   de USAR_SUPABASE y decidir si trabajan con localStorage o con Supabase.
   ========================================================================== */

// --------------------------------------------------------------------------
// INTERRUPTOR PRINCIPAL DEL SISTEMA
// false = modo local (localStorage) | true = modo Supabase (base de datos real)
// --------------------------------------------------------------------------
const USAR_SUPABASE = false;

// --------------------------------------------------------------------------
// CREDENCIALES DE SUPABASE (completar únicamente en la Fase 2)
// --------------------------------------------------------------------------
const SUPABASE_URL = 'https://wezimilalieseldcmbqd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlemltaWxhbGllc2VsZGNtYnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MjA5NzIsImV4cCI6MjEwNzM5Njk3Mn0.OqjwR6lwQuA5m_h5CIaJ1vuT3Ie9ULwXKFMo-xBwdKg';

// --------------------------------------------------------------------------
// Cliente de Supabase.
// Solo se crea si USAR_SUPABASE es true y la librería de Supabase está
// cargada en la página (se agrega el <script> del SDK únicamente cuando
// se active esta fase, para no depender de internet durante la Fase 1).
// --------------------------------------------------------------------------
let clienteSupabase = null;

if (USAR_SUPABASE) {
  if (typeof window.supabase === 'undefined') {
    console.error(
      'USAR_SUPABASE está en true pero no se encontró el SDK de Supabase. ' +
      'Agrega el script del SDK en index.html antes de activar esta fase.'
    );
  } else {
    clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}

// Nombres de las "tablas" que usa el sistema. Se usan tanto para las
// llamadas a Supabase (Fase 2) como para las claves de localStorage (Fase 1),
// así el resto del código no necesita cambiar de nombres entre modos.
const TABLAS = {
  productos: 'productos',
  perfiles: 'perfiles',
  pedidos: 'pedidos',
  itemsPedido: 'items_pedido',
  carrito: 'carrito',
};
