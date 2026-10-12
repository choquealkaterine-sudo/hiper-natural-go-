-- ============================================================================
-- migracion_rls.sql — HIPER-NATURAL GO / ONLINE
-- ----------------------------------------------------------------------------
-- Este archivo NO se ejecuta durante la Fase 1 ni apenas se integre Supabase.
-- Se ejecuta más adelante, cuando el proyecto incorpore autenticación real
-- de usuarios (Supabase Auth), para que cada cliente solo pueda ver y
-- modificar su propia información.
--
-- Row Level Security (RLS) = "seguridad a nivel de fila": son reglas que
-- Supabase revisa automáticamente antes de dejar leer o escribir una fila.
-- auth.uid() devuelve el id del usuario que está actualmente autenticado.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PERFILES
-- Cada persona puede ver y editar únicamente su propio perfil.
-- ----------------------------------------------------------------------------
alter table perfiles enable row level security;

create policy "Los usuarios ven su propio perfil"
  on perfiles for select
  using (auth.uid() = id);

create policy "Los usuarios actualizan su propio perfil"
  on perfiles for update
  using (auth.uid() = id);

create policy "Un usuario autenticado puede crear su propio perfil"
  on perfiles for insert
  with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- PRODUCTOS
-- El catálogo es público para lectura (cualquiera puede ver los productos),
-- pero solo el propietario del negocio (perfiles.rol = 'admin') puede
-- crear, editar o eliminar productos desde el panel de administrador.
-- ----------------------------------------------------------------------------
alter table productos enable row level security;

create policy "Cualquiera puede ver el catálogo"
  on productos for select
  using (true);

create policy "Solo el administrador agrega productos"
  on productos for insert
  with check (
    exists (select 1 from perfiles where perfiles.id = auth.uid() and perfiles.rol = 'admin')
  );

create policy "Solo el administrador edita productos"
  on productos for update
  using (
    exists (select 1 from perfiles where perfiles.id = auth.uid() and perfiles.rol = 'admin')
  );

create policy "Solo el administrador elimina productos"
  on productos for delete
  using (
    exists (select 1 from perfiles where perfiles.id = auth.uid() and perfiles.rol = 'admin')
  );

-- ----------------------------------------------------------------------------
-- PEDIDOS
-- Cada cliente ve y crea únicamente sus propios pedidos/reservas. El
-- administrador puede ver y actualizar (cambiar el estado de) todos los
-- pedidos del sistema, para poder atenderlos desde su panel.
-- ----------------------------------------------------------------------------
alter table pedidos enable row level security;

create policy "Los usuarios ven sus propios pedidos"
  on pedidos for select
  using (auth.uid() = usuario_id);

create policy "Los usuarios crean sus propios pedidos"
  on pedidos for insert
  with check (auth.uid() = usuario_id);

create policy "El administrador ve todos los pedidos"
  on pedidos for select
  using (
    exists (select 1 from perfiles where perfiles.id = auth.uid() and perfiles.rol = 'admin')
  );

create policy "El administrador actualiza el estado de cualquier pedido"
  on pedidos for update
  using (
    exists (select 1 from perfiles where perfiles.id = auth.uid() and perfiles.rol = 'admin')
  );

-- ----------------------------------------------------------------------------
-- ITEMS_PEDIDO
-- Solo puede verse el detalle de un pedido si ese pedido pertenece al
-- usuario autenticado.
-- ----------------------------------------------------------------------------
alter table items_pedido enable row level security;

create policy "Los usuarios ven el detalle de sus propios pedidos"
  on items_pedido for select
  using (
    exists (
      select 1 from pedidos
      where pedidos.id = items_pedido.pedido_id
      and pedidos.usuario_id = auth.uid()
    )
  );

create policy "Los usuarios agregan detalle a sus propios pedidos"
  on items_pedido for insert
  with check (
    exists (
      select 1 from pedidos
      where pedidos.id = items_pedido.pedido_id
      and pedidos.usuario_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- CARRITO
-- Cada usuario administra únicamente su propio carrito guardado.
-- ----------------------------------------------------------------------------
alter table carrito enable row level security;

create policy "Los usuarios administran su propio carrito"
  on carrito for all
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);
