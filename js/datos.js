/* ==========================================================================
   datos.js — HIPER-NATURAL GO / ONLINE
   --------------------------------------------------------------------------
   Este archivo se agrega para poder compartir los mismos datos y las mismas
   funciones entre la tienda (index.html + app.js) y el nuevo panel de
   administrador (admin.html + admin.js), sin duplicar código.

   Debe cargarse SIEMPRE después de js/supabaseClient.js y ANTES de
   js/app.js o js/admin.js, tanto en index.html como en admin.html.

   Contiene:
     - Los productos de demostración del puesto del mercado.
     - Las funciones que leen/escriben en localStorage (Fase 1) y que en la
       Fase 2 se conectarán a Supabase (revisando USAR_SUPABASE).
     - El manejo de sesión (cliente y administrador).
     - Las notificaciones tipo toast (se usan en ambas páginas).
   ========================================================================== */
/* ==========================================================================
   1. CATÁLOGO DE PRODUCTOS (línea Natural Go)
   Los precios y el stock son valores de ejemplo: edítalos desde el panel
   de administrador (botón "Admin" en index.html) con los precios y el
   stock reales de cada producto.
   ========================================================================== */
const PRODUCTOS_DEMO = [
  { id: 'p01', nombre: 'H2GO Agua Alcalina', categoria: 'Bebidas funcionales', precio: 15, precioOferta: null, stock: 30, emoji: '💧', imagen: 'img/productos/h2go-agua-alcalina.png', destacado: true,
    descripcion: 'Agua alcalina embotellada de la línea GO, presentación individual.',
    formaConsumo: 'Consumir fría, directamente de la botella.' },

  { id: 'p02', nombre: 'Aloe Vera en sobres sabor Piña', categoria: 'Mezclas en polvo', precio: 55, precioOferta: null, stock: 20, emoji: '🍍', imagen: 'img/productos/aloe-vera-sobres.png', destacado: true,
    descripcion: 'Mezcla en polvo de aloe vera sabor piña, en caja de 300 g con 30 sobres de 10 g cada uno.',
    formaConsumo: 'Disolver el contenido de un sobre en agua y mezclar bien antes de tomar.' },

  { id: 'p03', nombre: 'Aloe GO', categoria: 'Bebidas funcionales', precio: 45, precioOferta: null, stock: 18, emoji: '🌿', imagen: 'img/productos/aloe-botella.png', destacado: false,
    descripcion: 'Bebida de aloe vera de la línea GO, presentación en botella de 500 ml.',
    formaConsumo: 'Agitar antes de abrir y consumir frío.' },

  { id: 'p04', nombre: 'Café Arándanos y Ganoderma', categoria: 'Café funcional', precio: 60, precioOferta: null, stock: 15, emoji: '☕', imagen: 'img/productos/cafe-arandanos-ganoderma.png', destacado: true,
    descripcion: 'Café instantáneo saborizado con arándanos y ganoderma, en caja de 120 g con 20 sobres de 6 g cada uno.',
    formaConsumo: 'Disolver un sobre en agua caliente y mezclar bien.' },

  { id: 'p05', nombre: 'Café Ganoderma', categoria: 'Café funcional', precio: 60, precioOferta: null, stock: 15, emoji: '☕', imagen: 'img/productos/cafe-ganoderma.png', destacado: false,
    descripcion: 'Café instantáneo con extracto de ganoderma, en caja de 120 g con 20 sobres de 6 g cada uno.',
    formaConsumo: 'Disolver un sobre en agua caliente y mezclar bien.' },

  { id: 'p06', nombre: 'Cartílago de Tiburón', categoria: 'Suplementos en cápsulas', precio: 90, precioOferta: null, stock: 10, emoji: '💊', imagen: 'img/productos/cartilago-tiburon.png', destacado: false,
    descripcion: 'Suplemento alimenticio deshidratado en polvo, encapsulado. Frasco con 120 cápsulas, peso neto 40 g.',
    formaConsumo: 'Tomar según las indicaciones del envase, con abundante agua.' },

  { id: 'p07', nombre: 'Clorofila GO', categoria: 'Bebidas funcionales', precio: 45, precioOferta: null, stock: 18, emoji: '🍃', imagen: 'img/productos/clorofila-botella.png', destacado: true,
    descripcion: 'Bebida de clorofila de la línea GO, presentación en botella de 500 ml.',
    formaConsumo: 'Agitar antes de abrir y consumir frío.' },

  { id: 'p08', nombre: 'Clorofila en sobres sabor Manzana', categoria: 'Mezclas en polvo', precio: 55, precioOferta: null, stock: 20, emoji: '🍏', imagen: 'img/productos/clorofila-sobres.png', destacado: false,
    descripcion: 'Mezcla en polvo de clorofila sabor manzana, en caja de 300 g con 30 sobres de 10 g cada uno.',
    formaConsumo: 'Disolver el contenido de un sobre en agua y mezclar bien antes de tomar.' },

  { id: 'p09', nombre: 'Colágeno Hidrolizado', categoria: 'Suplementos en cápsulas', precio: 95, precioOferta: null, stock: 12, emoji: '💊', imagen: 'img/productos/colageno-hidrolizado.png', destacado: true,
    descripcion: 'Suplemento alimenticio deshidratado en polvo, encapsulado. Frasco con 120 cápsulas, peso neto 40 g.',
    formaConsumo: 'Tomar según las indicaciones del envase, con abundante agua.' },

  { id: 'p10', nombre: 'Fiber Max', categoria: 'Bebidas funcionales', precio: 50, precioOferta: null, stock: 15, emoji: '🌾', imagen: 'img/productos/fiber-max-botella.png', destacado: false,
    descripcion: 'Bebida con fibra de la línea GO, presentación en botella de 500 ml.',
    formaConsumo: 'Agitar antes de abrir y consumir frío.' },

  { id: 'p11', nombre: 'Fiber Max Plus', categoria: 'Mezclas en polvo', precio: 60, precioOferta: null, stock: 15, emoji: '🌾', imagen: 'img/productos/fiber-max-plus.png', destacado: false,
    descripcion: 'Mezcla en polvo con fibra, en caja de 300 g con 30 sobres de 10 g cada uno.',
    formaConsumo: 'Disolver el contenido de un sobre en agua y mezclar bien antes de tomar.' },

  { id: 'p12', nombre: 'FitGo sabor Limón', categoria: 'Mezclas en polvo', precio: 60, precioOferta: null, stock: 15, emoji: '🍋', imagen: 'img/productos/fitgo.png', destacado: true,
    descripcion: 'Mezcla en polvo sabor limón de la línea FitGo, en caja de 300 g con 30 sobres de 10 g cada uno.',
    formaConsumo: 'Disolver el contenido de un sobre en agua y mezclar bien antes de tomar.' },

  { id: 'p13', nombre: 'GanoGO Café 3 en 1', categoria: 'Café funcional', precio: 85, precioOferta: null, stock: 10, emoji: '☕', imagen: 'img/productos/ganogo-3en1.png', destacado: true,
    descripcion: 'Café instantáneo 3 en 1, en caja de 600 g con 20 sobres de 30 g cada uno.',
    formaConsumo: 'Disolver un sobre en agua caliente y mezclar bien.' },

  { id: 'p14', nombre: 'Garcinia Gambogia', categoria: 'Suplementos en cápsulas', precio: 90, precioOferta: null, stock: 10, emoji: '💊', imagen: 'img/productos/garcinia-gambogia.png', destacado: false,
    descripcion: 'Suplemento alimenticio deshidratado en polvo, encapsulado. Frasco con 120 cápsulas, peso neto 40 g.',
    formaConsumo: 'Tomar según las indicaciones del envase, con abundante agua.' },

  { id: 'p15', nombre: 'GOpuchino sabor Coco', categoria: 'Café funcional', precio: 70, precioOferta: null, stock: 12, emoji: '☕', imagen: 'img/productos/gopuchino.png', destacado: true,
    descripcion: 'Bebida instantánea sabor coco con café y extracto de ganoderma. Caja de 400 g con 20 sobres de 20 g cada uno. Contiene lactosa.',
    formaConsumo: 'Diluir el contenido de un sobre en 250 ml de agua, agitar y tomar. Consumir preferentemente frío o caliente.' },

  { id: 'p16', nombre: 'Total GO', categoria: 'Suplementos en cápsulas', precio: 95, precioOferta: null, stock: 10, emoji: '💊', imagen: 'img/productos/total-go.png', destacado: false,
    descripcion: 'Suplemento alimenticio deshidratado en polvo, encapsulado. Frasco con 120 cápsulas.',
    formaConsumo: 'Tomar según las indicaciones del envase, con abundante agua.' },

  { id: 'p17', nombre: 'Transfer Factor TF-GO sabor Fresa', categoria: 'Suplementos en polvo', precio: 120, precioOferta: null, stock: 8, emoji: '🍓', imagen: 'img/productos/transfer-factor-fresa.png', destacado: true,
    descripcion: 'Mezcla en polvo sabor fresa para preparar bebida, línea Transfer Factor TF-GO.',
    formaConsumo: 'Disolver la cantidad indicada en el envase en agua y mezclar bien.' },

  { id: 'p18', nombre: 'Transfer Factor TF-GO sabor Vainilla', categoria: 'Suplementos en polvo', precio: 120, precioOferta: null, stock: 8, emoji: '🥄', imagen: 'img/productos/transfer-factor-vainilla.png', destacado: false,
    descripcion: 'Mezcla en polvo sabor vainilla para preparar bebida, línea Transfer Factor TF-GO.',
    formaConsumo: 'Disolver la cantidad indicada en el envase en agua y mezclar bien.' },

  { id: 'p19', nombre: 'Vital GO', categoria: 'Suplementos líquidos', precio: 80, precioOferta: null, stock: 10, emoji: '💧', imagen: 'img/productos/vital-go.png', destacado: false,
    descripcion: 'Suplemento alimenticio líquido de la línea Vital GO, presentación de 500 ml.',
    formaConsumo: 'Tomar según las indicaciones del envase.' },

  { id: 'p20', nombre: 'Natralm M FEM', categoria: 'Bebidas funcionales', precio: 50, precioOferta: null, stock: 12, emoji: '🌸', imagen: 'img/productos/natralm-mfem.png', destacado: false,
    descripcion: 'Bebida de la línea femenina M FEM, presentación en botella de 500 ml.',
    formaConsumo: 'Agitar antes de abrir y consumir frío.' },
];

/* ----------------------------------------------------------------------
   CUENTA DE ADMINISTRADOR — ÚNICO LUGAR DONDE SE CAMBIA
   ----------------------------------------------------------------------
   Para cambiar el teléfono, la contraseña o el nombre del administrador,
   edita SOLO estas 3 líneas y guarda el archivo. No hace falta tocar
   ningún otro archivo ni el panel de administrador.

   En la Fase 2 (Supabase), el administrador se crea como un usuario real
   dentro de Supabase Auth con rol "admin" en la tabla perfiles; aquí, en
   la Fase 1, se guarda en localStorage únicamente con fines escolares
   (no uses una contraseña real ni sensible).
   ---------------------------------------------------------------------- */
const ADMIN_TELEFONO = '68762839';
const ADMIN_CONTRASENA = 'samir123';
const ADMIN_NOMBRE = 'MARCELA';

const ADMIN_DEMO = {
  id: 'admin_1',
  nombre: ADMIN_NOMBRE,
  telefono: ADMIN_TELEFONO,
  contrasena: ADMIN_CONTRASENA,
  rol: 'admin',
  fechaInicioSesion: new Date().toISOString(),
};


/* ==========================================================================
   2. ALMACENAMIENTO LOCAL (localStorage)
   ========================================================================== */
function leerStorage(clave, valorPorDefecto) {
  const guardado = localStorage.getItem(clave);
  return guardado ? JSON.parse(guardado) : valorPorDefecto;
}

// Guarda un valor en localStorage. Devuelve true si se pudo guardar y false
// si el navegador se quedó sin espacio (puede pasar si se suben muchas fotos
// grandes desde el celular).
function guardarStorage(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    mostrarToast('No hay espacio suficiente para guardar. Usa fotos más pequeñas o quita alguna.', 'error');
    return false;
  }
}

// Crea los datos de demostración la primera vez que se abre el sistema
// (desde la tienda o desde el panel de administrador, lo primero que se
// abra). Si ya existen, no los vuelve a sobrescribir.
//
// Nota importante: si el sistema ya se había probado ANTES de que existiera
// el panel de administrador, es posible que "ng_usuarios" ya exista en el
// navegador pero sin la cuenta de administrador. Por eso, además de crear
// los datos desde cero, esta función revisa que la cuenta de administrador
// de demostración siempre esté presente.
// Versión del catálogo de demostración. Si cambia el catálogo incluido en este
// archivo, se sube este número y el navegador carga el catálogo nuevo UNA vez.
// Después de eso, los cambios hechos desde el panel de administrador (precios,
// stock, fotos) se conservan y ya no se sobrescriben.
const VERSION_CATALOGO = '2-natural-go';

function inicializarDatosLocales() {
  if (!localStorage.getItem('ng_productos') || localStorage.getItem('ng_version_catalogo') !== VERSION_CATALOGO) {
    guardarStorage('ng_productos', PRODUCTOS_DEMO);
    localStorage.setItem('ng_version_catalogo', VERSION_CATALOGO);
  }

  let usuarios = leerStorage('ng_usuarios', null);
  if (!usuarios) {
    usuarios = [ADMIN_DEMO];
  } else {
    const indiceAdmin = usuarios.findIndex(u => u.id === 'admin_1');
    if (indiceAdmin === -1) {
      // No había cuenta de administrador guardada todavía: se agrega.
      usuarios.push(ADMIN_DEMO);
    } else {
      // Ya existía: se actualiza para que siempre coincida con
      // ADMIN_TELEFONO / ADMIN_CONTRASENA / ADMIN_NOMBRE de más arriba,
      // aunque el navegador ya tuviera guardados los datos anteriores.
      usuarios[indiceAdmin] = { ...usuarios[indiceAdmin], ...ADMIN_DEMO };
    }
  }
  guardarStorage('ng_usuarios', usuarios);

  if (!localStorage.getItem('ng_pedidos')) {
    guardarStorage('ng_pedidos', []);
  }
  if (!localStorage.getItem('ng_carrito')) {
    guardarStorage('ng_carrito', []);
  }
}


/* ==========================================================================
   3. PRODUCTOS (catálogo)
   ========================================================================== */
async function obtenerProductos() {
  if (USAR_SUPABASE) {
    // FASE 2: const { data } = await clienteSupabase.from(TABLAS.productos).select('*');
    return [];
  }
  return leerStorage('ng_productos', []);
}

async function guardarProductos(productos) {
  if (USAR_SUPABASE) {
    // FASE 2: actualizar cada producto modificado en Supabase.
    return;
  }
  guardarStorage('ng_productos', productos);
}

// Crea un producto nuevo. Lo usa el panel de administrador.
async function crearProducto(datosProducto) {
  if (USAR_SUPABASE) {
    // FASE 2: const { data } = await clienteSupabase.from(TABLAS.productos).insert([datosProducto]).select();
    return null;
  }
  const productos = leerStorage('ng_productos', []);
  const nuevoProducto = { id: 'p_' + Date.now(), ...datosProducto };
  productos.push(nuevoProducto);
  guardarStorage('ng_productos', productos);
  return nuevoProducto;
}

// Actualiza un producto existente (precio, stock, descripción, destacado, etc.).
// Lo usa el panel de administrador para configurar el catálogo desde el celular.
async function actualizarProducto(idProducto, cambios) {
  if (USAR_SUPABASE) {
    // FASE 2: await clienteSupabase.from(TABLAS.productos).update(cambios).eq('id', idProducto);
    return;
  }
  const productos = leerStorage('ng_productos', []);
  const indice = productos.findIndex(p => p.id === idProducto);
  if (indice === -1) return;
  productos[indice] = { ...productos[indice], ...cambios };
  guardarStorage('ng_productos', productos);
}

// Elimina un producto del catálogo.
async function eliminarProducto(idProducto) {
  if (USAR_SUPABASE) {
    // FASE 2: await clienteSupabase.from(TABLAS.productos).delete().eq('id', idProducto);
    return;
  }
  const productos = leerStorage('ng_productos', []).filter(p => p.id !== idProducto);
  guardarStorage('ng_productos', productos);
}


/* ==========================================================================
   4. CUENTAS Y SESIÓN (cliente y administrador)
   ========================================================================== */

// Registro de un nuevo CLIENTE (rol "cliente" siempre; el rol de
// administrador no se puede crear desde este formulario público).
async function registrarUsuario({ nombre, telefono }) {
  if (USAR_SUPABASE) {
    // FASE 2: clienteSupabase.auth.signUp(...) + insertar en TABLAS.perfiles con rol 'cliente'.
    return null;
  }
  const usuarios = leerStorage('ng_usuarios', []);
  const yaExiste = usuarios.some(u => u.telefono === telefono);
  if (yaExiste) return { error: 'Ya existe una cuenta con ese número de teléfono.' };

  const nuevoUsuario = {
    id: 'u_' + Date.now(),
    nombre,
    telefono,
    rol: 'cliente',
    fechaInicioSesion: new Date().toISOString(),
  };
  usuarios.push(nuevoUsuario);
  guardarStorage('ng_usuarios', usuarios);
  guardarStorage('ng_sesion', nuevoUsuario);
  return { usuario: nuevoUsuario };
}

// Inicio de sesión de CLIENTE (solo por número de teléfono, como ya
// funcionaba antes). No permite entrar con una cuenta de administrador.
async function iniciarSesion(telefono) {
  if (USAR_SUPABASE) {
    // FASE 2: autenticación real con clienteSupabase.auth.signInWithPassword(...)
    return null;
  }
  const usuarios = leerStorage('ng_usuarios', []);
  const usuario = usuarios.find(u => u.telefono === telefono && u.rol !== 'admin');
  if (!usuario) return { error: 'No encontramos una cuenta con ese número. Crea una cuenta primero.' };
  guardarStorage('ng_sesion', usuario);
  return { usuario };
}

// Inicio de sesión de ADMINISTRADOR (teléfono + contraseña). Es un login
// aparte, pensado para el propietario del negocio, no para los clientes.
async function iniciarSesionAdmin(telefono, contrasena) {
  if (USAR_SUPABASE) {
    // FASE 2: clienteSupabase.auth.signInWithPassword({ ... }) y luego
    // verificar que perfiles.rol === 'admin' antes de dejarlo entrar.
    return null;
  }
  const usuarios = leerStorage('ng_usuarios', []);
  const admin = usuarios.find(u => u.telefono === telefono && u.rol === 'admin');
  if (!admin) return { error: 'No encontramos una cuenta de administrador con ese número.' };
  if (admin.contrasena !== contrasena) return { error: 'La contraseña no es correcta.' };
  guardarStorage('ng_sesion', admin);
  return { usuario: admin };
}

function obtenerSesion() {
  return leerStorage('ng_sesion', null);
}

function esAdministrador() {
  const sesion = obtenerSesion();
  return !!sesion && sesion.rol === 'admin';
}

function cerrarSesion() {
  localStorage.removeItem('ng_sesion');
}


/* ==========================================================================
   5. PEDIDOS
   ========================================================================== */
async function guardarPedido(pedido) {
  if (USAR_SUPABASE) {
    // FASE 2: insertar en TABLAS.pedidos y TABLAS.itemsPedido.
    return;
  }
  const pedidos = leerStorage('ng_pedidos', []);
  pedidos.unshift(pedido);
  guardarStorage('ng_pedidos', pedidos);
}

// Pedidos de un cliente puntual (se usa en "Mis pedidos" de la tienda).
async function obtenerPedidosUsuario(usuarioId) {
  if (USAR_SUPABASE) {
    // FASE 2: consultar TABLAS.pedidos filtrando por usuario_id.
    return [];
  }
  const pedidos = leerStorage('ng_pedidos', []);
  return pedidos.filter(p => p.usuarioId === usuarioId);
}

// Todos los pedidos del sistema (se usa en el panel de administrador).
async function obtenerTodosPedidos() {
  if (USAR_SUPABASE) {
    // FASE 2: consultar TABLAS.pedidos completo (protegido por RLS de admin).
    return [];
  }
  return leerStorage('ng_pedidos', []);
}

// Cambia el estado de un pedido (por ejemplo, de "Pendiente de entrega" a
// "Entregado"). Lo usa el panel de administrador.
async function actualizarEstadoPedido(idPedido, nuevoEstado) {
  if (USAR_SUPABASE) {
    // FASE 2: await clienteSupabase.from(TABLAS.pedidos).update({ estado: nuevoEstado }).eq('id', idPedido);
    return;
  }
  const pedidos = leerStorage('ng_pedidos', []);
  const indice = pedidos.findIndex(p => p.id === idPedido);
  if (indice === -1) return;
  pedidos[indice].estado = nuevoEstado;
  guardarStorage('ng_pedidos', pedidos);
}


/* ==========================================================================
   6. UTILIDADES COMPARTIDAS (formato de precio y notificaciones toast)
   ========================================================================== */
function formatoPrecio(numero) {
  return 'Bs. ' + Number(numero).toFixed(2);
}

// Devuelve el HTML que va DENTRO del recuadro de imagen de un producto:
// - Si el producto tiene una foto real (producto.imagen), muestra esa foto.
// - Si no tiene foto, muestra el emoji como siempre (esto es lo que pasa
//   con los productos de demostración, que no tienen fotos todavía).
// Así, para poner una foto real a un producto, solo hay que completar el
// campo "imagen" con la ruta del archivo (ej: "img/productos/miel.jpg"),
// ya sea a mano en PRODUCTOS_DEMO o desde el panel de administrador.
function contenidoImagenProducto(producto) {
  if (producto.imagen) {
    const emojiRespaldo = (producto.emoji || '🌿').replace(/'/g, "\\'");
    return `<img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-producto-real" onerror="this.outerHTML='${emojiRespaldo}'">`;
  }
  return producto.emoji || '🌿';
}

// Muestra una notificación tipo toast. Requiere que la página tenga un
// elemento <div id="contenedorToast"></div> (tanto index.html como
// admin.html lo incluyen).
function mostrarToast(mensaje, tipo = 'exito') {
  const contenedor = document.getElementById('contenedorToast');
  if (!contenedor) return;
  const toast = document.createElement('div');
  toast.className = 'toast' + (tipo === 'error' ? ' toast-error' : '');
  toast.textContent = mensaje;
  contenedor.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}


/* ==========================================================================
   7. CONFIGURACIÓN DEL NEGOCIO (la edita el administrador desde su celular)
   --------------------------------------------------------------------------
   Aquí se guardan los datos que el administrador puede cambiar sin tocar
   código: número de WhatsApp, datos de la cuenta para pagos, y las fotos
   del logo, del QR y de la portada. En la Fase 2 se guardarían en Supabase.
   ========================================================================== */
const CONFIG_POR_DEFECTO = {
  whatsapp: '59170000000',   // con código de país, sin "+" ni espacios
  banco: 'Banco XXXX',
  cuenta: '0000-0000-0000',
  titular: 'Katerine',
  qr: '',        // foto del QR de pago (vacío = usa img/qr-pago.jpg si existe)
  logo: '',      // foto del logo (vacío = usa img/logo.png si existe)
  fotoHero: '',  // foto de portada (vacío = usa img/foto-tienda.jpg si existe)
};

function obtenerConfig() {
  // FASE 2: leer desde una tabla "configuracion" en Supabase.
  return { ...CONFIG_POR_DEFECTO, ...leerStorage('ng_config', {}) };
}

// Guarda solo los campos que cambian y devuelve true si se pudo guardar.
function guardarConfig(cambios) {
  const nueva = { ...leerStorage('ng_config', {}), ...cambios };
  return guardarStorage('ng_config', nueva);
}

/* ==========================================================================
   8. FOTOS DESDE EL CELULAR
   --------------------------------------------------------------------------
   Convierte la foto elegida (galería o cámara) en una imagen liviana para
   guardarla en el navegador. Se reduce a un máximo de 700 px de lado y se
   comprime, así una foto de 5 MB del celular pasa a pesar unos 50-100 KB.
   ========================================================================== */
function comprimirImagen(archivo, ladoMaximo = 700, calidad = 0.78) {
  return new Promise((resolver, rechazar) => {
    if (!archivo || !archivo.type.startsWith('image/')) {
      rechazar(new Error('El archivo no es una imagen.'));
      return;
    }
    const lector = new FileReader();
    lector.onerror = () => rechazar(new Error('No se pudo leer la foto.'));
    lector.onload = () => {
      const imagen = new Image();
      imagen.onerror = () => rechazar(new Error('No se pudo abrir la foto.'));
      imagen.onload = () => {
        const escala = Math.min(1, ladoMaximo / Math.max(imagen.width, imagen.height));
        const ancho = Math.round(imagen.width * escala);
        const alto = Math.round(imagen.height * escala);
        const lienzo = document.createElement('canvas');
        lienzo.width = ancho;
        lienzo.height = alto;
        const contexto = lienzo.getContext('2d');
        contexto.fillStyle = '#ffffff';          // fondo blanco para fotos con transparencia
        contexto.fillRect(0, 0, ancho, alto);
        contexto.drawImage(imagen, 0, 0, ancho, alto);
        resolver(lienzo.toDataURL('image/jpeg', calidad));
      };
      imagen.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}

/* ==========================================================================
   9. APLICAR LA CONFIGURACIÓN A LA TIENDA (index.html)
   Se llama al abrir la tienda y cada vez que el administrador guarda un
   ajuste. En admin.html no hay estos elementos, por eso cada uno se revisa
   antes de usarlo.
   ========================================================================== */
function aplicarConfigTienda() {
  const config = obtenerConfig();

  // Logo (encabezado y pie), foto de portada y QR de pago.
  const poner = (selector, ruta) => {
    document.querySelectorAll(selector).forEach(img => {
      img.style.display = '';
      img.src = ruta;
    });
  };
  if (config.logo) poner('.logo-imagen', config.logo);
  if (config.fotoHero) poner('.foto-hero', config.fotoHero);
  if (config.qr) poner('.imagen-qr', config.qr);

  // WhatsApp (botón de portada y enlace de contacto).
  const enlace = `https://wa.me/${config.whatsapp}`;
  document.querySelectorAll('[data-whatsapp]').forEach(a => { a.href = enlace; });
  const textoWhatsApp = document.getElementById('textoWhatsApp');
  if (textoWhatsApp) textoWhatsApp.textContent = `WhatsApp: +${config.whatsapp}`;

  // Datos de la cuenta para pagos digitales.
  const asignar = (id, texto) => { const el = document.getElementById(id); if (el) el.textContent = texto; };
  asignar('pagoCuenta', config.cuenta);
  asignar('pagoBanco', config.banco);
  asignar('pagoTitular', config.titular);
}
