-- ============================================================================
-- migracion_storage.sql — HIPER-NATURAL GO / ONLINE
-- ----------------------------------------------------------------------------
-- Este proyecto SÍ necesita imágenes (fotos reales de los productos del
-- puesto). Durante la Fase 1, esas imágenes se muestran con un emoji o con
-- imágenes de demostración guardadas localmente, para no depender de
-- Supabase todavía.
--
-- Este archivo se ejecuta más adelante, cuando se quiera guardar y servir
-- las fotos reales de los productos desde Supabase Storage.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Crear el bucket público donde se guardarán las imágenes de productos.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('imagenes-productos', 'imagenes-productos', true)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 2. Políticas de acceso al bucket.
--    - Lectura pública: cualquier visitante debe poder ver las fotos del
--      catálogo, incluso sin haber iniciado sesión.
--    - Escritura restringida: solo un usuario autenticado (más adelante,
--      el propietario del negocio) podrá subir o reemplazar imágenes.
-- ----------------------------------------------------------------------------
create policy "Lectura pública de imágenes de productos"
  on storage.objects for select
  using (bucket_id = 'imagenes-productos');

create policy "Solo usuarios autenticados suben imágenes de productos"
  on storage.objects for insert
  with check (bucket_id = 'imagenes-productos' and auth.role() = 'authenticated');

create policy "Solo usuarios autenticados actualizan imágenes de productos"
  on storage.objects for update
  using (bucket_id = 'imagenes-productos' and auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 3. Una vez subida una imagen al bucket, su URL pública se guarda en la
--    columna "imagen_url" de la tabla "productos" (ver schema.sql), por
--    ejemplo:
--    update productos set imagen_url = 'https://.../imagenes-productos/almendras.jpg'
--    where nombre = 'Almendras naturales';
-- ----------------------------------------------------------------------------
