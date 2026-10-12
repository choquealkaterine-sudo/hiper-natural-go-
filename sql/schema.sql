-- ============================================================================
-- schema.sql — HIPER-NATURAL GO / ONLINE
-- ----------------------------------------------------------------------------
-- Este archivo se ejecuta en el "SQL Editor" de Supabase SOLO en la Fase 2,
-- cuando el flujo local (Fase 1) ya haya sido probado y aprobado.
-- No se ejecuta automáticamente desde el sistema.
--
-- Incluye únicamente las tablas necesarias para el funcionamiento del
-- catálogo, el carrito, los pedidos/reservas y los perfiles de usuario.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabla: perfiles
-- Guarda los datos públicos de cada usuario registrado. Está pensada para
-- vincularse en el futuro con el sistema de autenticación de Supabase
-- (auth.users), por eso "id" usa el mismo id que la cuenta de autenticación.
-- ----------------------------------------------------------------------------
create table if not exists perfiles (
  id uuid primary key default gen_random_uuid(),
  -- En la Fase 2 con autenticación, este id debería coincidir con auth.uid()
  nombre text not null,
  telefono text not null unique,
  -- 'cliente': compra/reserva productos. 'admin': administra el catálogo
  -- y los pedidos desde el panel de administrador (admin.html).
  rol text not null default 'cliente' check (rol in ('cliente', 'admin')),
  fecha_inicio_sesion timestamp with time zone default now()
);

-- ----------------------------------------------------------------------------
-- Tabla: productos
-- Catálogo de productos naturales del puesto del Mercado Juan Pablo II.
-- ----------------------------------------------------------------------------
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null,
  descripcion text,
  forma_consumo text,
  precio numeric(10,2) not null check (precio >= 0),
  precio_oferta numeric(10,2) check (precio_oferta is null or precio_oferta >= 0),
  stock integer not null default 0 check (stock >= 0),
  emoji text,               -- se usa como imagen simple mientras no haya fotos reales
  imagen_url text,          -- se completa cuando se active Supabase Storage
  destacado boolean default false,
  creado_en timestamp with time zone default now()
);

-- ----------------------------------------------------------------------------
-- Tabla: pedidos
-- Representa tanto compras como reservas hechas por un cliente.
-- usuario_id queda preparado desde ahora para el futuro sistema de cuentas.
-- ----------------------------------------------------------------------------
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references perfiles(id), -- puede quedar nulo para compras de invitado
  tipo text not null check (tipo in ('compra', 'reserva')),
  metodo_pago text not null default 'Efectivo al recoger',
  estado text not null default 'Pendiente de entrega',
  total numeric(10,2) not null check (total >= 0),
  creado_en timestamp with time zone default now()
);

-- ----------------------------------------------------------------------------
-- Tabla: items_pedido
-- Detalle de productos incluidos en cada pedido (relación muchos a muchos
-- entre pedidos y productos, con la cantidad y el precio pactado).
-- ----------------------------------------------------------------------------
create table if not exists items_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  producto_id uuid not null references productos(id),
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null check (precio_unitario >= 0)
);

-- ----------------------------------------------------------------------------
-- Tabla: carrito
-- Carrito persistente por usuario (opcional; en Fase 1 el carrito vive
-- únicamente en localStorage del navegador).
-- ----------------------------------------------------------------------------
create table if not exists carrito (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references perfiles(id),
  producto_id uuid not null references productos(id),
  cantidad integer not null check (cantidad > 0),
  actualizado_en timestamp with time zone default now()
);

-- ----------------------------------------------------------------------------
-- Índices básicos de apoyo a las consultas más frecuentes del sistema.
-- ----------------------------------------------------------------------------
create index if not exists idx_productos_categoria on productos (categoria);
create index if not exists idx_pedidos_usuario on pedidos (usuario_id);
create index if not exists idx_items_pedido_pedido on items_pedido (pedido_id);
create index if not exists idx_carrito_usuario on carrito (usuario_id);
