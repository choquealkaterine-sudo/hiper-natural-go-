/* ==========================================================================
   app.js — HIPER-NATURAL GO / ONLINE
   --------------------------------------------------------------------------
   Este archivo contiene TODA la lógica del sistema:
     1. Datos de demostración (productos de ejemplo del puesto del mercado).
     2. Funciones de acceso a datos (que revisan USAR_SUPABASE).
     3. Funciones para pintar el catálogo, el carrito y los pedidos.
     4. Manejo de eventos (clics, formularios, filtros, etc.).

   No hace falta tocar este archivo para cambiar entre modo LOCAL y modo
   SUPABASE: eso se hace únicamente en js/supabaseClient.js.
   ========================================================================== */


/* ==========================================================================
   NOTA: los datos de demostración, el acceso a localStorage/Supabase, el
   manejo de sesión y las notificaciones toast ahora viven en js/datos.js,
   para poder compartirlos con el nuevo panel de administrador (admin.html).
   Este archivo debe cargarse siempre después de js/datos.js.
   ========================================================================== */


/* ==========================================================================
   1. ESTADO EN MEMORIA (mientras el usuario navega la página)
   ========================================================================== */
let listaProductos = [];
let carrito = leerStorage('ng_carrito', []);
let categoriaActiva = 'todas';
let textoBusqueda = '';


/* ==========================================================================
   2. RENDERIZADO DEL CATÁLOGO Y LOS DESTACADOS
   (mostrarToast y formatoPrecio ahora viven en datos.js)
   ========================================================================== */
function obtenerCategorias() {
  const categorias = new Set(listaProductos.map(p => p.categoria));
  return ['todas', ...categorias];
}

function pintarChipsCategorias() {
  const contenedor = document.getElementById('chipsCategorias');
  contenedor.innerHTML = '';
  obtenerCategorias().forEach(categoria => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (categoria === categoriaActiva ? ' activo' : '');
    chip.textContent = categoria === 'todas' ? 'Todas' : categoria;
    chip.addEventListener('click', () => {
      categoriaActiva = categoria;
      pintarChipsCategorias();
      pintarCatalogo();
    });
    contenedor.appendChild(chip);
  });
}

function productosFiltrados() {
  return listaProductos.filter(p => {
    const coincideCategoria = categoriaActiva === 'todas' || p.categoria === categoriaActiva;
    const coincideBusqueda = p.nombre.toLowerCase().includes(textoBusqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });
}

function pintarCatalogo() {
  const grilla = document.getElementById('grillaProductos');
  const mensajeVacio = document.getElementById('mensajeSinResultados');
  const productos = productosFiltrados();

  grilla.innerHTML = '';
  mensajeVacio.classList.toggle('oculto', productos.length > 0);

  productos.forEach(producto => {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta-producto';

    const etiquetaStock = producto.stock === 0
      ? '<span class="stock-agotado">Agotado</span>'
      : (producto.stock <= 5 ? `<span class="stock-bajo">Últimas ${producto.stock} unidades</span>` : '');

    const precioHtml = producto.precioOferta
      ? `<span class="precio-producto"><small class="precio-tachado">${formatoPrecio(producto.precio)}</small>${formatoPrecio(producto.precioOferta)}</span>`
      : `<span class="precio-producto">${formatoPrecio(producto.precio)}</span>`;

    tarjeta.innerHTML = `
      <div class="cabecera-tarjeta">
        <span class="categoria-tarjeta">${producto.categoria}</span>
        ${etiquetaStock}
      </div>
      <div class="emoji-producto">${contenidoImagenProducto(producto)}</div>
      <h3 data-id="${producto.id}">${producto.nombre}</h3>
      <p class="descripcion-corta">${producto.descripcion}</p>
      <div class="fila-precio-boton">
        ${precioHtml}
        <button class="boton boton-primario boton-pequeno" data-agregar="${producto.id}" ${producto.stock === 0 ? 'disabled' : ''}>
          Agregar
        </button>
      </div>
    `;

    tarjeta.querySelector('h3').addEventListener('click', () => abrirDetalleProducto(producto.id));
    const botonAgregar = tarjeta.querySelector('[data-agregar]');
    if (producto.stock > 0) {
      botonAgregar.addEventListener('click', () => agregarAlCarrito(producto.id, 1));
    }

    grilla.appendChild(tarjeta);
  });
}

function pintarDestacados() {
  const carril = document.getElementById('carrilDestacados');
  carril.innerHTML = '';
  listaProductos.filter(p => p.destacado).forEach(producto => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-destacado';
    const precioHtml = producto.precioOferta
      ? `<span class="precio-destacado"><span class="precio-tachado">${formatoPrecio(producto.precio)}</span>${formatoPrecio(producto.precioOferta)}</span>`
      : `<span class="precio-destacado">${formatoPrecio(producto.precio)}</span>`;
    tarjeta.innerHTML = `
      <span class="etiqueta-promo">${producto.precioOferta ? 'Oferta' : 'Destacado'}</span>
      <div class="emoji-producto">${contenidoImagenProducto(producto)}</div>
      <h4>${producto.nombre}</h4>
      ${precioHtml}
    `;
    tarjeta.addEventListener('click', () => abrirDetalleProducto(producto.id));
    carril.appendChild(tarjeta);
  });
}


/* ==========================================================================
   6. DETALLE DE PRODUCTO (modal)
   ========================================================================== */
function abrirDetalleProducto(idProducto) {
  const producto = listaProductos.find(p => p.id === idProducto);
  if (!producto) return;

  const contenedor = document.getElementById('detalleProducto');
  contenedor.innerHTML = `
    <div class="emoji-producto">${contenidoImagenProducto(producto)}</div>
    <div class="detalle-cabecera">
      <div>
        <span class="categoria-tarjeta">${producto.categoria}</span>
        <h2>${producto.nombre}</h2>
      </div>
      <span class="detalle-precio">${formatoPrecio(producto.precioOferta || producto.precio)}</span>
    </div>
    <p>${producto.descripcion}</p>
    <table class="tabla-detalle">
      <tr><td>Forma de consumo</td><td>${producto.formaConsumo}</td></tr>
      <tr><td>Disponibilidad</td><td>${producto.stock > 0 ? producto.stock + ' unidades en el puesto' : 'Agotado por ahora'}</td></tr>
    </table>
    <div class="detalle-acciones">
      <div class="selector-cantidad">
        <button type="button" data-restar>−</button>
        <span id="cantidadDetalle">1</span>
        <button type="button" data-sumar>+</button>
      </div>
      <button class="boton boton-primario" id="btnAgregarDesdeDetalle" ${producto.stock === 0 ? 'disabled' : ''}>Agregar al carrito</button>
    </div>
  `;

  let cantidad = 1;
  const etiquetaCantidad = contenedor.querySelector('#cantidadDetalle');
  contenedor.querySelector('[data-restar]').addEventListener('click', () => {
    if (cantidad > 1) { cantidad--; etiquetaCantidad.textContent = cantidad; }
  });
  contenedor.querySelector('[data-sumar]').addEventListener('click', () => {
    if (cantidad < producto.stock) { cantidad++; etiquetaCantidad.textContent = cantidad; }
  });
  contenedor.querySelector('#btnAgregarDesdeDetalle').addEventListener('click', () => {
    agregarAlCarrito(producto.id, cantidad);
    cerrarModal(document.getElementById('modalProducto'));
  });

  abrirModal(document.getElementById('modalProducto'));
}


/* ==========================================================================
   7. CARRITO DE COMPRAS
   ========================================================================== */
function agregarAlCarrito(idProducto, cantidad) {
  const producto = listaProductos.find(p => p.id === idProducto);
  if (!producto || producto.stock === 0) return;

  const itemExistente = carrito.find(i => i.idProducto === idProducto);
  if (itemExistente) {
    itemExistente.cantidad = Math.min(itemExistente.cantidad + cantidad, producto.stock);
  } else {
    carrito.push({ idProducto, cantidad: Math.min(cantidad, producto.stock) });
  }

  guardarStorage('ng_carrito', carrito);
  actualizarContadorCarrito();
  pintarCarrito();
  mostrarToast(`${producto.nombre} se agregó al carrito.`);
}

function actualizarCantidadCarrito(idProducto, delta) {
  const item = carrito.find(i => i.idProducto === idProducto);
  const producto = listaProductos.find(p => p.id === idProducto);
  if (!item || !producto) return;

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito = carrito.filter(i => i.idProducto !== idProducto);
  } else if (item.cantidad > producto.stock) {
    item.cantidad = producto.stock;
  }
  guardarStorage('ng_carrito', carrito);
  actualizarContadorCarrito();
  pintarCarrito();
}

function quitarDelCarrito(idProducto) {
  carrito = carrito.filter(i => i.idProducto !== idProducto);
  guardarStorage('ng_carrito', carrito);
  actualizarContadorCarrito();
  pintarCarrito();
}

function actualizarContadorCarrito() {
  const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
  document.getElementById('contadorCarrito').textContent = totalItems;
}

function calcularTotalCarrito() {
  return carrito.reduce((suma, item) => {
    const producto = listaProductos.find(p => p.id === item.idProducto);
    if (!producto) return suma;
    const precioUnitario = producto.precioOferta || producto.precio;
    return suma + precioUnitario * item.cantidad;
  }, 0);
}

function pintarCarrito() {
  const lista = document.getElementById('listaCarrito');
  lista.innerHTML = '';

  if (carrito.length === 0) {
    lista.innerHTML = '<p class="panel-vacio">Tu carrito está vacío. Agrega productos desde el catálogo.</p>';
  }

  carrito.forEach(item => {
    const producto = listaProductos.find(p => p.id === item.idProducto);
    if (!producto) return;
    const precioUnitario = producto.precioOferta || producto.precio;

    const fila = document.createElement('div');
    fila.className = 'item-carrito';
    fila.innerHTML = `
      <div class="emoji-item">${producto.emoji}</div>
      <div class="info-item-carrito">
        <h4>${producto.nombre}</h4>
        <p>${formatoPrecio(precioUnitario)} c/u</p>
        <div class="controles-cantidad">
          <button data-restar-item>−</button>
          <span>${item.cantidad}</span>
          <button data-sumar-item>+</button>
          <button class="btn-quitar-item" data-quitar-item>Quitar</button>
        </div>
      </div>
    `;
    fila.querySelector('[data-restar-item]').addEventListener('click', () => actualizarCantidadCarrito(producto.id, -1));
    fila.querySelector('[data-sumar-item]').addEventListener('click', () => actualizarCantidadCarrito(producto.id, 1));
    fila.querySelector('[data-quitar-item]').addEventListener('click', () => quitarDelCarrito(producto.id));
    lista.appendChild(fila);
  });

  document.getElementById('totalCarrito').textContent = formatoPrecio(calcularTotalCarrito());
}

async function confirmarPedido() {
  if (carrito.length === 0) {
    mostrarToast('Tu carrito está vacío.', 'error');
    return;
  }

  const sesion = obtenerSesion();
  const tipoPedido = document.querySelector('input[name="tipoPedido"]:checked').value;
  const metodoPago = document.getElementById('metodoPago').value;

  const itemsPedido = carrito.map(item => {
    const producto = listaProductos.find(p => p.id === item.idProducto);
    return {
      idProducto: producto.id,
      nombre: producto.nombre,
      cantidad: item.cantidad,
      precioUnitario: producto.precioOferta || producto.precio,
    };
  });

  const pedido = {
    id: 'ped_' + Date.now(),
    usuarioId: sesion ? sesion.id : 'invitado',
    nombreCliente: sesion ? sesion.nombre : 'Cliente sin cuenta',
    tipo: tipoPedido, // 'compra' o 'reserva'
    metodoPago,
    items: itemsPedido,
    total: calcularTotalCarrito(),
    fecha: new Date().toISOString(),
    estado: tipoPedido === 'reserva' ? 'Reservado' : 'Pendiente de entrega',
  };

  // Descuenta el stock de cada producto vendido/reservado.
  listaProductos = listaProductos.map(producto => {
    const item = carrito.find(i => i.idProducto === producto.id);
    if (item) {
      return { ...producto, stock: Math.max(producto.stock - item.cantidad, 0) };
    }
    return producto;
  });
  await guardarProductos(listaProductos);

  await guardarPedido(pedido);

  carrito = [];
  guardarStorage('ng_carrito', carrito);
  actualizarContadorCarrito();
  pintarCarrito();
  pintarCatalogo();
  pintarDestacados();
  pintarChipsCategorias();

  cerrarPaneles();
  mostrarToast(tipoPedido === 'reserva' ? 'Tu reserva fue registrada con éxito.' : 'Tu compra fue registrada con éxito.');
}


/* ==========================================================================
   8. MIS PEDIDOS
   ========================================================================== */
async function pintarPedidos() {
  const lista = document.getElementById('listaPedidos');
  const sesion = obtenerSesion();
  const pedidos = await obtenerPedidosUsuario(sesion ? sesion.id : 'invitado');

  lista.innerHTML = '';
  if (pedidos.length === 0) {
    lista.innerHTML = '<p class="panel-vacio">Todavía no tienes pedidos ni reservas registradas.</p>';
    return;
  }

  pedidos.forEach(pedido => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-pedido';
    const fecha = new Date(pedido.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
    tarjeta.innerHTML = `
      <header>
        <strong>Pedido del ${fecha}</strong>
        <span class="estado-pedido ${pedido.tipo}">${pedido.tipo === 'reserva' ? 'Reserva' : 'Compra'}</span>
      </header>
      <ul>
        ${pedido.items.map(i => `<li>${i.cantidad} × ${i.nombre}</li>`).join('')}
      </ul>
      <p class="total-pedido">${formatoPrecio(pedido.total)} · ${pedido.estado}</p>
      <p class="metodo-pago-pedido">Pago: ${pedido.metodoPago || 'No especificado'}</p>
    `;
    lista.appendChild(tarjeta);
  });
}


/* ==========================================================================
   9. CUENTA DE USUARIO (registro / inicio de sesión)
   ========================================================================== */
function actualizarEtiquetaCuenta() {
  const sesion = obtenerSesion();
  document.getElementById('etiquetaCuenta').textContent = sesion ? sesion.nombre.split(' ')[0] : 'Ingresar';
}

function manejarClicCuenta() {
  const sesion = obtenerSesion();
  if (sesion) {
    // Se cierra sesión directamente (sin usar confirm() del navegador,
    // para mantener el mismo criterio de no usar diálogos nativos).
    cerrarSesion();
    actualizarEtiquetaCuenta();
    mostrarToast('Cerraste sesión correctamente.');
  } else {
    abrirModal(document.getElementById('modalCuenta'));
  }
}


/* ==========================================================================
   10. PANELES Y MODALES (abrir / cerrar)
   ========================================================================== */
function abrirPanel(panel) {
  document.getElementById('fondoOscuro').classList.add('visible');
  panel.classList.add('visible');
}

function cerrarPaneles() {
  document.getElementById('fondoOscuro').classList.remove('visible');
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('visible'));
}

function abrirModal(modal) {
  modal.classList.add('visible');
}

function cerrarModal(modal) {
  modal.classList.remove('visible');
}


/* ==========================================================================
   11. INICIALIZACIÓN Y EVENTOS
   ========================================================================== */
// Vuelve a cargar y pintar el catálogo. Lo usa el panel de administrador
// (admin.js) para que los cambios se vean en la tienda sin recargar la página.
async function recargarCatalogoTienda() {
  listaProductos = await obtenerProductos();
  document.getElementById('datoTotalProductos').textContent = listaProductos.length;
  pintarChipsCategorias();
  pintarCatalogo();
  pintarDestacados();
  pintarCarrito();
}

document.addEventListener('DOMContentLoaded', async () => {
  inicializarDatosLocales();
  aplicarConfigTienda();   // logo, portada, QR, WhatsApp y datos de pago configurados por el administrador
  listaProductos = await obtenerProductos();

  document.getElementById('datoTotalProductos').textContent = listaProductos.length;

  pintarChipsCategorias();
  pintarCatalogo();
  pintarDestacados();
  pintarCarrito();
  actualizarContadorCarrito();
  actualizarEtiquetaCuenta();

  // --- Búsqueda ---
  document.getElementById('campoBusqueda').addEventListener('input', (e) => {
    textoBusqueda = e.target.value;
    pintarCatalogo();
  });

  // --- Menú móvil ---
  document.getElementById('btnMenuMovil').addEventListener('click', () => {
    document.getElementById('navPrincipal').classList.toggle('visible');
  });

  // --- Abrir carrito / pedidos ---
  document.getElementById('btnCarrito').addEventListener('click', () => abrirPanel(document.getElementById('panelCarrito')));
  document.getElementById('btnMisPedidos').addEventListener('click', async () => {
    await pintarPedidos();
    abrirPanel(document.getElementById('panelPedidos'));
  });
  document.getElementById('fondoOscuro').addEventListener('click', cerrarPaneles);
  document.querySelectorAll('[data-cerrar-panel]').forEach(btn => btn.addEventListener('click', cerrarPaneles));

  // --- Cerrar modales ---
  document.querySelectorAll('[data-cerrar-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => cerrarModal(e.target.closest('.modal')));
  });
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(modal); });
  });

  // --- Mostrar el QR/detalle de pago solo si el método elegido es digital ---
  document.getElementById('metodoPago').addEventListener('change', (e) => {
    const esDigital = e.target.value !== 'Efectivo al recoger';
    document.getElementById('detallePagoDigital').classList.toggle('oculto', !esDigital);
  });

  // --- Confirmar pedido (compra o reserva) ---
  document.getElementById('btnConfirmarPedido').addEventListener('click', confirmarPedido);

  // --- Cuenta: abrir modal o cerrar sesión ---
  document.getElementById('btnCuenta').addEventListener('click', manejarClicCuenta);

  // --- Pestañas del modal de cuenta ---
  document.querySelectorAll('.pestana').forEach(pestana => {
    pestana.addEventListener('click', () => {
      document.querySelectorAll('.pestana').forEach(p => p.classList.remove('activa'));
      pestana.classList.add('activa');
      const destino = pestana.dataset.pestana;
      document.getElementById('formularioIngresar').classList.toggle('oculto', destino !== 'ingresar');
      document.getElementById('formularioRegistrar').classList.toggle('oculto', destino !== 'registrar');
    });
  });

  // --- Formulario: iniciar sesión ---
  document.getElementById('formularioIngresar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const telefono = document.getElementById('ingresarTelefono').value.trim();
    const resultado = await iniciarSesion(telefono);
    if (resultado.error) {
      mostrarToast(resultado.error, 'error');
      return;
    }
    actualizarEtiquetaCuenta();
    cerrarModal(document.getElementById('modalCuenta'));
    mostrarToast(`Bienvenido/a de nuevo, ${resultado.usuario.nombre.split(' ')[0]}.`);
    e.target.reset();
  });

  // --- Formulario: crear cuenta ---
  document.getElementById('formularioRegistrar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('registroNombre').value.trim();
    const telefono = document.getElementById('registroTelefono').value.trim();
    const resultado = await registrarUsuario({ nombre, telefono });
    if (resultado.error) {
      mostrarToast(resultado.error, 'error');
      return;
    }
    actualizarEtiquetaCuenta();
    cerrarModal(document.getElementById('modalCuenta'));
    mostrarToast(`Cuenta creada. ¡Bienvenido/a, ${nombre.split(' ')[0]}!`);
    e.target.reset();
  });

  // --- Formulario de contacto (simulado, sin backend en Fase 1) ---
  document.getElementById('formularioContacto').addEventListener('submit', (e) => {
    e.preventDefault();
    mostrarToast('Tu consulta fue enviada. Te responderemos por WhatsApp a la brevedad.');
    e.target.reset();
  });
});
