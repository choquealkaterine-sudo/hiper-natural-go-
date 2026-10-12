/* ==========================================================================
   admin.js — Panel de administrador de HIPER-NATURAL GO / ONLINE
   --------------------------------------------------------------------------
   Permite al propietario del negocio, desde su celular o computadora:
     - Iniciar sesión con su cuenta de administrador (teléfono + contraseña).
     - Ver un resumen rápido del catálogo y los pedidos.
     - Editar precio, stock, descripción y destacado de cada producto.
     - Eliminar productos que ya no se venden.
     - Agregar productos nuevos al catálogo.
     - Ver todos los pedidos/reservas y cambiar su estado.

   Usa las mismas funciones de datos definidas en js/datos.js, así que
   este archivo debe cargarse después de supabaseClient.js y datos.js.
   ========================================================================== */

let productosAdmin = [];
let fotoNuevoProducto = null;   // foto elegida en el formulario "Agregar producto"

/* ==========================================================================
   1. LOGIN / SESIÓN DE ADMINISTRADOR
   ========================================================================== */
async function revisarSesionAdmin() {
  const sesion = obtenerSesion();
  const esAdmin = sesion && sesion.rol === 'admin';

  document.getElementById('seccionLoginAdmin').classList.toggle('oculto', !!esAdmin);
  document.getElementById('seccionPanelAdmin').classList.toggle('oculto', !esAdmin);
  document.getElementById('accionesAdmin').classList.toggle('oculto', !esAdmin);

  // Este botón solo existe en index.html (no en admin.html), por eso se
  // usa "?." para no romper nada si la página no lo tiene.
  const etiquetaHeader = document.getElementById('etiquetaAdminHeader');
  if (etiquetaHeader) etiquetaHeader.textContent = esAdmin ? sesion.nombre.split(' ')[0] : 'Admin';

  if (esAdmin) {
    document.getElementById('nombreAdminSesion').textContent = sesion.nombre;
    await cargarPanelAdmin();
  }
}

async function cargarPanelAdmin() {
  productosAdmin = await obtenerProductos();
  await pintarResumenAdmin();
  pintarProductosAdmin();
}

/* ==========================================================================
   2. RESUMEN RÁPIDO
   ========================================================================== */
async function pintarResumenAdmin() {
  const pedidos = await obtenerTodosPedidos();
  const pendientes = pedidos.filter(p => p.estado !== 'Entregado').length;
  const sinStock = productosAdmin.filter(p => p.stock === 0).length;

  const contenedor = document.getElementById('resumenAdmin');
  contenedor.innerHTML = `
    <div class="tarjeta-resumen">
      <strong>${productosAdmin.length}</strong>
      <span>Productos en catálogo</span>
    </div>
    <div class="tarjeta-resumen">
      <strong>${pedidos.length}</strong>
      <span>Pedidos totales</span>
    </div>
    <div class="tarjeta-resumen">
      <strong>${pendientes}</strong>
      <span>Pedidos por atender</span>
    </div>
    <div class="tarjeta-resumen">
      <strong>${sinStock}</strong>
      <span>Productos agotados</span>
    </div>
  `;
}

/* ==========================================================================
   3. PRODUCTOS: LISTA EDITABLE
   ========================================================================== */
function pintarProductosAdmin() {
  const contenedor = document.getElementById('listaProductosAdmin');
  contenedor.innerHTML = '';

  productosAdmin.forEach(producto => {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta-producto-admin';
    tarjeta.innerHTML = `
      <div class="cabecera-producto-admin">
        <span class="emoji-item">${contenidoImagenProducto(producto)}</span>
        <strong>${producto.nombre}</strong>
      </div>

      <div class="subir-imagen">
        <span class="etiqueta-subir">Foto del producto</span>
        <div class="fila-subir">
          <div class="vista-previa-subida">${contenidoImagenProducto(producto)}</div>
          <div class="botones-subir">
            <label class="boton boton-fantasma boton-pequeno boton-subir">📷 Cambiar foto
              <input type="file" accept="image/*" data-archivo-producto hidden>
            </label>
            ${producto.imagen ? '<button type="button" class="boton-texto" data-quitar-foto>Quitar foto</button>' : ''}
          </div>
        </div>
      </div>

      <label>Categoría
        <input type="text" data-campo="categoria" value="${producto.categoria}">
      </label>

      <div class="fila-doble">
        <label>Precio (Bs.)
          <input type="number" data-campo="precio" value="${producto.precio}" min="0" step="0.5">
        </label>
        <label>Precio oferta (Bs.)
          <input type="number" data-campo="precioOferta" value="${producto.precioOferta ?? ''}" min="0" step="0.5" placeholder="Sin oferta">
        </label>
      </div>

      <label>Stock disponible
        <input type="number" data-campo="stock" value="${producto.stock}" min="0" step="1">
      </label>

      <label>Descripción
        <textarea data-campo="descripcion" rows="2">${producto.descripcion}</textarea>
      </label>

      <label>Forma de consumo
        <textarea data-campo="formaConsumo" rows="2">${producto.formaConsumo}</textarea>
      </label>

      <label class="fila-checkbox">
        <input type="checkbox" data-campo="destacado" ${producto.destacado ? 'checked' : ''}> Producto destacado
      </label>

      <div class="acciones-producto-admin">
        <button class="boton boton-primario boton-pequeno" data-guardar="${producto.id}">Guardar cambios</button>
        <button class="boton boton-fantasma boton-pequeno" data-eliminar="${producto.id}">Eliminar</button>
      </div>
    `;

    // Subir o cambiar la foto desde el celular (galería o cámara).
    tarjeta.querySelector('[data-archivo-producto]').addEventListener('change', async (e) => {
      const archivo = e.target.files[0];
      if (!archivo) return;
      try {
        const foto = await comprimirImagen(archivo);
        await actualizarProducto(producto.id, { imagen: foto });
        productosAdmin = await obtenerProductos();
        pintarProductosAdmin();
        mostrarToast('Foto guardada. Ya se ve en la tienda.');
        refrescarTienda();
      } catch (error) {
        mostrarToast(error.message || 'No se pudo cargar la foto.', 'error');
      }
    });
    tarjeta.querySelector('[data-quitar-foto]')?.addEventListener('click', async () => {
      await actualizarProducto(producto.id, { imagen: null });
      productosAdmin = await obtenerProductos();
      pintarProductosAdmin();
      mostrarToast('Foto quitada. Se mostrará el emoji.');
      refrescarTienda();
    });

    tarjeta.querySelector(`[data-guardar="${producto.id}"]`).addEventListener('click', () => guardarCambiosProducto(producto.id, tarjeta));
    tarjeta.querySelector(`[data-eliminar="${producto.id}"]`).addEventListener('click', () => eliminarProductoAdmin(producto.id));

    contenedor.appendChild(tarjeta);
  });
}

async function guardarCambiosProducto(idProducto, tarjeta) {
  const leerCampo = (campo) => tarjeta.querySelector(`[data-campo="${campo}"]`);

  const cambios = {
    categoria: leerCampo('categoria').value.trim(),
    precio: Number(leerCampo('precio').value),
    precioOferta: leerCampo('precioOferta').value ? Number(leerCampo('precioOferta').value) : null,
    stock: Number(leerCampo('stock').value),
    descripcion: leerCampo('descripcion').value.trim(),
    formaConsumo: leerCampo('formaConsumo').value.trim(),
    destacado: leerCampo('destacado').checked,
  };

  await actualizarProducto(idProducto, cambios);
  productosAdmin = await obtenerProductos();
  await pintarResumenAdmin();
  mostrarToast('Producto actualizado correctamente.');
  refrescarTienda();
}

async function eliminarProductoAdmin(idProducto) {
  await eliminarProducto(idProducto);
  productosAdmin = await obtenerProductos();
  pintarProductosAdmin();
  await pintarResumenAdmin();
  mostrarToast('Producto eliminado del catálogo.');
  refrescarTienda();
}

/* ==========================================================================
   4. PEDIDOS
   ========================================================================== */
async function pintarPedidosAdmin() {
  const contenedor = document.getElementById('listaPedidosAdmin');
  const pedidos = await obtenerTodosPedidos();

  contenedor.innerHTML = '';
  if (pedidos.length === 0) {
    contenedor.innerHTML = '<p class="panel-vacio">Todavía no se registraron pedidos ni reservas.</p>';
    return;
  }

  pedidos.forEach(pedido => {
    const fecha = new Date(pedido.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-pedido';
    tarjeta.innerHTML = `
      <header>
        <strong>${pedido.nombreCliente} · ${fecha}</strong>
        <span class="estado-pedido ${pedido.tipo}">${pedido.tipo === 'reserva' ? 'Reserva' : 'Compra'}</span>
      </header>
      <ul>
        ${pedido.items.map(i => `<li>${i.cantidad} × ${i.nombre}</li>`).join('')}
      </ul>
      <p class="total-pedido">${formatoPrecio(pedido.total)}</p>
      <p class="metodo-pago-pedido">Pago: ${pedido.metodoPago || 'No especificado'}</p>
      <label class="selector-estado">Estado
        <select data-estado="${pedido.id}">
          <option value="Pendiente de entrega" ${pedido.estado === 'Pendiente de entrega' ? 'selected' : ''}>Pendiente de entrega</option>
          <option value="Reservado" ${pedido.estado === 'Reservado' ? 'selected' : ''}>Reservado</option>
          <option value="Entregado" ${pedido.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
        </select>
      </label>
    `;
    tarjeta.querySelector('select').addEventListener('change', async (e) => {
      await actualizarEstadoPedido(pedido.id, e.target.value);
      await pintarResumenAdmin();
      mostrarToast('Estado del pedido actualizado.');
    });
    contenedor.appendChild(tarjeta);
  });
}

/* ==========================================================================
   4b. REFRESCAR LA TIENDA (solo en index.html)
   Después de cambiar un producto o un ajuste, la tienda que está detrás
   del panel se actualiza sola, sin recargar la página.
   ========================================================================== */
async function refrescarTienda() {
  if (typeof recargarCatalogoTienda === 'function') await recargarCatalogoTienda();
  aplicarConfigTienda();
}

/* ==========================================================================
   4c. AJUSTES DEL NEGOCIO (WhatsApp, cuenta de pago, logo, QR, portada)
   ========================================================================== */
function pintarAjustesAdmin() {
  const config = obtenerConfig();
  const contenedor = document.getElementById('vistaAjustes');

  // Cada ajuste de imagen: [clave en la configuración, título, ayuda]
  const imagenes = [
    ['logo', 'Logo de la marca', 'Aparece arriba y en el pie de página.'],
    ['fotoHero', 'Foto de portada', 'Es la foto grande del inicio de la tienda.'],
    ['qr', 'Código QR de pago', 'Lo ve el cliente cuando elige pagar por QR.'],
  ];

  contenedor.innerHTML = `
    <form id="formularioAjustes" class="formulario-producto-admin">
      <h4>Contacto y pagos</h4>
      <label>WhatsApp del negocio (con código de país, sin + ni espacios)
        <input type="tel" id="ajusteWhatsApp" value="${config.whatsapp}" placeholder="Ej: 59168762839" required>
      </label>
      <label>Banco
        <input type="text" id="ajusteBanco" value="${config.banco}">
      </label>
      <label>Número de cuenta
        <input type="text" id="ajusteCuenta" value="${config.cuenta}">
      </label>
      <label>Nombre del titular
        <input type="text" id="ajusteTitular" value="${config.titular}">
      </label>
      <button type="submit" class="boton boton-primario boton-ancho">Guardar contacto y pagos</button>
    </form>

    <div class="formulario-producto-admin ajustes-imagenes">
      <h4>Fotos de la tienda</h4>
      ${imagenes.map(([clave, titulo, ayuda]) => `
        <div class="subir-imagen">
          <span class="etiqueta-subir">${titulo}</span>
          <p class="ayuda-subir">${ayuda}</p>
          <div class="fila-subir">
            <div class="vista-previa-subida">${config[clave] ? `<img src="${config[clave]}" alt="${titulo}" class="imagen-producto-real">` : 'Sin foto'}</div>
            <div class="botones-subir">
              <label class="boton boton-fantasma boton-pequeno boton-subir">📷 Elegir foto
                <input type="file" accept="image/*" data-config-imagen="${clave}" hidden>
              </label>
              ${config[clave] ? `<button type="button" class="boton-texto" data-quitar-config="${clave}">Quitar foto</button>` : ''}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Guardar los datos de texto.
  contenedor.querySelector('#formularioAjustes').addEventListener('submit', (e) => {
    e.preventDefault();
    const whatsapp = document.getElementById('ajusteWhatsApp').value.replace(/\D/g, '');
    if (!whatsapp) { mostrarToast('Escribe un número de WhatsApp válido.', 'error'); return; }
    const guardado = guardarConfig({
      whatsapp,
      banco: document.getElementById('ajusteBanco').value.trim(),
      cuenta: document.getElementById('ajusteCuenta').value.trim(),
      titular: document.getElementById('ajusteTitular').value.trim(),
    });
    if (guardado) {
      aplicarConfigTienda();
      mostrarToast('Ajustes guardados.');
    }
  });

  // Subir las fotos de logo, portada y QR desde el celular.
  contenedor.querySelectorAll('[data-config-imagen]').forEach(entrada => {
    entrada.addEventListener('change', async (e) => {
      const archivo = e.target.files[0];
      if (!archivo) return;
      const clave = entrada.dataset.configImagen;
      try {
        // El logo se guarda más pequeño; la portada y el QR necesitan más detalle.
        const foto = await comprimirImagen(archivo, clave === 'logo' ? 300 : 900);
        if (guardarConfig({ [clave]: foto })) {
          aplicarConfigTienda();
          pintarAjustesAdmin();
          mostrarToast('Foto guardada. Ya se ve en la tienda.');
        }
      } catch (error) {
        mostrarToast(error.message || 'No se pudo cargar la foto.', 'error');
      }
    });
  });

  contenedor.querySelectorAll('[data-quitar-config]').forEach(boton => {
    boton.addEventListener('click', () => {
      guardarConfig({ [boton.dataset.quitarConfig]: '' });
      pintarAjustesAdmin();
      mostrarToast('Foto quitada. Recarga la página para ver el cambio.');
    });
  });
}

/* ==========================================================================
   5. INICIALIZACIÓN Y EVENTOS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  inicializarDatosLocales();
  await revisarSesionAdmin();

  // --- Abrir el panel de administrador desde el ícono del encabezado ---
  // (solo existe en index.html; en admin.html el panel ya está siempre visible)
  document.getElementById('btnPanelAdmin')?.addEventListener('click', () => {
    abrirPanel(document.getElementById('panelAdmin'));
  });

  // --- Login de administrador ---
  document.getElementById('formularioLoginAdmin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const telefono = document.getElementById('adminTelefono').value.trim();
    const contrasena = document.getElementById('adminContrasena').value;
    const resultado = await iniciarSesionAdmin(telefono, contrasena);
    if (resultado.error) {
      mostrarToast(resultado.error, 'error');
      return;
    }
    mostrarToast(`Bienvenido, ${resultado.usuario.nombre}.`);
    await revisarSesionAdmin();
    e.target.reset();
  });

  // --- Cerrar sesión de administrador ---
  document.getElementById('btnSalirAdmin').addEventListener('click', async () => {
    cerrarSesion();
    mostrarToast('Cerraste sesión de administrador.');
    await revisarSesionAdmin();
  });

  // --- Pestañas del panel (Productos / Pedidos / Agregar producto) ---
  document.querySelectorAll('.pestana-admin').forEach(pestana => {
    pestana.addEventListener('click', async () => {
      document.querySelectorAll('.pestana-admin').forEach(p => p.classList.remove('activa'));
      pestana.classList.add('activa');

      const vista = pestana.dataset.vista;
      document.getElementById('vistaProductos').classList.toggle('oculto', vista !== 'productos');
      document.getElementById('vistaPedidos').classList.toggle('oculto', vista !== 'pedidos');
      document.getElementById('vistaNuevo').classList.toggle('oculto', vista !== 'nuevo');
      document.getElementById('vistaAjustes').classList.toggle('oculto', vista !== 'ajustes');

      if (vista === 'pedidos') await pintarPedidosAdmin();
      if (vista === 'ajustes') pintarAjustesAdmin();
    });
  });

  // --- Elegir la foto del producto nuevo ---
  document.getElementById('archivoNuevoProducto').addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    try {
      fotoNuevoProducto = await comprimirImagen(archivo);
      document.getElementById('vistaPreviaNuevo').innerHTML = `<img src="${fotoNuevoProducto}" alt="Vista previa" class="imagen-producto-real">`;
    } catch (error) {
      mostrarToast(error.message || 'No se pudo cargar la foto.', 'error');
    }
  });

  // --- Agregar producto nuevo ---
  document.getElementById('formularioNuevoProducto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoProducto = {
      nombre: document.getElementById('nuevoNombre').value.trim(),
      categoria: document.getElementById('nuevoCategoria').value.trim(),
      precio: Number(document.getElementById('nuevoPrecio').value),
      precioOferta: null,
      stock: Number(document.getElementById('nuevoStock').value),
      emoji: document.getElementById('nuevoEmoji').value.trim() || '🌿',
      imagen: fotoNuevoProducto,
      descripcion: document.getElementById('nuevoDescripcion').value.trim(),
      formaConsumo: document.getElementById('nuevoFormaConsumo').value.trim(),
      destacado: document.getElementById('nuevoDestacado').checked,
    };

    await crearProducto(nuevoProducto);
    productosAdmin = await obtenerProductos();
    pintarProductosAdmin();
    await pintarResumenAdmin();
    mostrarToast('Producto agregado al catálogo.');
    refrescarTienda();
    e.target.reset();
    fotoNuevoProducto = null;
    document.getElementById('vistaPreviaNuevo').textContent = 'Sin foto';

    // Vuelve a la pestaña de productos para ver el resultado.
    document.querySelector('[data-vista="productos"]').click();
  });
});
