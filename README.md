# Hiper-Natural GO / Online

Tienda virtual de productos naturales del Mercado Juan Pablo II. Proyecto de grado — nivel secundario técnico.

## 1. Cómo abrir el proyecto en Visual Studio Code

1. Descomprime el ZIP del proyecto en una carpeta de tu computadora.
2. Abre Visual Studio Code.
3. Ve a **Archivo → Abrir carpeta...** y selecciona la carpeta `proyecto`.

## 2. Cómo ejecutarlo con Live Server

1. Instala la extensión **Live Server** (de Ritwick Dey) desde el panel de extensiones de VS Code, si aún no la tienes.
2. Haz clic derecho sobre `index.html`.
3. Selecciona **"Open with Live Server"**.
4. Se abrirá el sitio en tu navegador, normalmente en una dirección como `http://127.0.0.1:5500`.

## 3. Cómo probarlo en modo LOCAL (Fase 1)

En esta etapa el sistema funciona completo sin ninguna base de datos externa. Puedes probar:

- Navegar por el catálogo, buscar y filtrar por categoría.
- Ver el detalle de un producto (forma de consumo, disponibilidad, precio).
- Crear una cuenta y luego iniciar sesión con el mismo número de teléfono.
- Agregar productos al carrito, cambiar cantidades y quitarlos.
- Confirmar un pedido como **compra** o como **reserva** (esto descuenta el stock).
- Revisar "Mis pedidos" para ver el historial de compras/reservas.
- Enviar una consulta desde el formulario de contacto.

Todos estos datos se guardan en el `localStorage` del navegador (no se pierden al recargar la página, pero sí son distintos en cada navegador/computadora).

## 4. Por qué en esta etapa no se necesita Supabase

El sistema fue construido para poder probarse de principio a fin sin depender de una base de datos externa. Mientras `USAR_SUPABASE` esté en `false`, no hace falta URL, ni ANON KEY, ni tablas creadas: todo funciona con los datos de demostración incluidos en el código.

## 5. Dónde está la configuración de Supabase

Todo lo relacionado a Supabase se centraliza en un único archivo:

```
js/supabaseClient.js
```

Ningún otro archivo debe modificarse para activar o desactivar Supabase.

## 6. Qué líneas se cambian para activar Supabase

En `js/supabaseClient.js`, cambiar:

```js
const USAR_SUPABASE = false;
```

por:

```js
const USAR_SUPABASE = true;
```

## 7. Dónde colocar la URL y la ANON KEY

En el mismo archivo `js/supabaseClient.js`:

```js
const SUPABASE_URL = 'TU_SUPABASE_URL_AQUI';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY_AQUI';
```

Reemplaza esos dos valores por los que te da Supabase en **Configuración del proyecto → API**.

## 8. Cuándo ejecutar schema.sql

Ejecuta `sql/schema.sql` en el **SQL Editor** de Supabase antes de cambiar `USAR_SUPABASE` a `true`. Este archivo crea las tablas `perfiles`, `productos`, `pedidos`, `items_pedido` y `carrito`.

## 9. Cuándo usar migracion_rls.sql

`sql/migracion_rls.sql` se ejecuta más adelante, cuando el proyecto incorpore autenticación real de usuarios. Contiene las políticas de seguridad (RLS) ya redactadas con `auth.uid()`, listas para activarse en ese momento. No se debe ejecutar antes, porque bloquearía el acceso mientras no exista un sistema de login real.

## 10. Cuándo usar migracion_storage.sql

Este proyecto sí necesita imágenes. `sql/migracion_storage.sql` se ejecuta cuando se quiera reemplazar los emojis/imágenes de demostración por fotos reales de los productos, subidas a Supabase Storage. Crea el bucket `imagenes-productos` y sus políticas de acceso.

## 11. Antes de presentar ante el tribunal

El tribunal debe ver siempre la versión **completa e integrada**, nunca la versión local a medias. El orden de trabajo recomendado es:

1. Front-end local funcionando completo (esta entrega).
2. Pruebas y correcciones del flujo local.
3. Ejecutar `schema.sql` en Supabase.
4. Activar `USAR_SUPABASE = true` y completar la URL/ANON KEY.
5. Probar el sistema ya conectado a Supabase.
6. Ejecutar `migracion_storage.sql` y subir las fotos reales de los productos.
7. Ejecutar `migracion_rls.sql` cuando se incorpore autenticación.
8. Presentación ante el tribunal con el sistema completo y funcionando.

## 12. Panel de administrador (cuentas con rol cliente/admin)

El sistema ahora tiene dos tipos de cuenta:

- **Cliente**: se registra e inicia sesión desde `index.html` (solo con su número de teléfono), como antes. Puede comprar, reservar y ver "Mis pedidos".
- **Administrador**: ingresa con **teléfono + contraseña**. Es la cuenta del propietario del negocio (Katerine).

**Cuenta de administrador de demostración (Fase 1):**
- Teléfono: `68762839`
- Contraseña: `samir123`

Desde el panel de administrador (pensado para usarse cómodamente desde el celular) se puede:

- Ver un resumen rápido: cantidad de productos, pedidos totales, pedidos por atender y productos agotados.
- Editar cualquier producto: categoría, precio, precio de oferta, stock, descripción, forma de consumo y si aparece como destacado.
- Eliminar productos que ya no se venden.
- Agregar productos nuevos al catálogo.
- Ver todos los pedidos y reservas del sistema, y cambiar su estado (Pendiente de entrega / Reservado / Entregado).

**Se accede sin salir de la página principal:** en `index.html`, en el encabezado, hay un botón con ícono de escudo ("Admin"). Al hacer clic se abre un panel lateral: si no hay sesión de administrador, pide teléfono y contraseña; una vez dentro, ahí mismo se editan los productos, se agregan productos nuevos y se gestionan los pedidos — todo dentro de la misma página, sin recargar ni navegar a otro archivo.

También existe `admin.html` como una página aparte con el mismo panel a pantalla completa (útil si se prefiere trabajar sin el resto de la tienda alrededor), y un enlace **"Acceso administrador"** en el pie de página que lleva a ella.

**Para cambiar el teléfono, la contraseña o el nombre del administrador**, edita únicamente estas 3 líneas al principio de `js/datos.js`:
```js
const ADMIN_TELEFONO = '68762839';
const ADMIN_CONTRASENA = 'samir123';
const ADMIN_NOMBRE = 'Katerine';
```
No hay que tocar ningún otro archivo: el sistema se sincroniza solo con estos valores cada vez que se abre la página, aunque el navegador ya tuviera datos guardados de antes.

En la Fase 2 (Supabase), el rol se guarda en la columna `rol` de la tabla `perfiles` (`'cliente'` o `'admin'`), y las políticas de `sql/migracion_rls.sql` ya están preparadas para que solo un administrador pueda crear, editar o eliminar productos, y para que pueda ver y actualizar todos los pedidos.

## 13. Menú del administrador (botón de 3 líneas) y fotos desde el celular

En el encabezado de `index.html` hay un botón con **3 líneas (☰) y la palabra "Admin"**. Al tocarlo se abre el menú del administrador (pide teléfono y contraseña la primera vez). Tiene 4 pestañas:

- **Productos:** cambiar precio, precio de oferta, stock, descripción y si es destacado; **cambiar o quitar la foto** de cada producto; eliminar productos.
- **Pedidos:** ver todos los pedidos y reservas, el método de pago y cambiar su estado.
- **Agregar:** crear un producto nuevo, con su foto.
- **Ajustes:** cambiar el WhatsApp del negocio, el banco, número de cuenta y titular para pagos, y subir el **logo**, la **foto de portada** y el **código QR de pago**.

**Subir una foto desde el celular:** tocar **"📷 Cambiar foto"** (o "Elegir foto"). El celular ofrece la galería o la cámara. La foto se reduce y comprime sola (queda de unos 50 a 100 KB) y se ve de inmediato en la tienda. No hay que escribir rutas ni copiar archivos.

**Importante (Fase 1):** las fotos y los cambios se guardan en el navegador del dispositivo donde se hacen (`localStorage`). Por eso, lo que el administrador cambia desde su celular se ve en ese celular, no en otros dispositivos. Para que todos los clientes vean los cambios hay que pasar a la Fase 2 (Supabase y `sql/migracion_storage.sql`).

Las fotos de los 20 productos incluidos están en `img/productos/` y siguen funcionando; una foto subida desde el panel reemplaza a la de esa carpeta.

## 14. Método de pago digital (QR / transferencia)

Al confirmar un pedido, el cliente elige un método de pago:

- **Efectivo al recoger** (no muestra nada más).
- **Pago por QR** o **Transferencia bancaria** (digitales): al elegir cualquiera de estos dos, aparece automáticamente un recuadro con el código QR y los datos de la cuenta.

**Para poner tu QR y tus datos de cuenta:** abre el menú de 3 líneas (☰ Admin) → pestaña **Ajustes**. Ahí subes la foto de tu QR y escribes el banco, el número de cuenta y el titular. No hay que editar código.

El método de pago elegido queda guardado en cada pedido y se puede ver tanto en "Mis pedidos" (cliente) como en el panel de administrador. En Fase 2, se guarda en la columna `metodo_pago` de la tabla `pedidos`.

## Estructura del proyecto

```
proyecto/
├── index.html
├── admin.html               ← panel de administrador (productos y pedidos)
├── css/
│   └── style.css
├── js/
│   ├── supabaseClient.js    ← única configuración de Supabase
│   ├── datos.js             ← datos y funciones compartidas (tienda + admin)
│   ├── app.js                ← lógica de la tienda (cliente)
│   └── admin.js              ← lógica del panel de administrador
├── sql/
│   ├── schema.sql
│   ├── migracion_rls.sql
│   └── migracion_storage.sql
└── README.md
```

## Puntos para explicar en la defensa

- **HTML**: define la estructura del catálogo, el carrito, los formularios y los paneles.
- **CSS** (`css/style.css`): define todo el estilo visual: colores, tipografía, tarjetas de producto, paneles laterales y notificaciones.
- **JavaScript** (`js/app.js`): controla los datos, el filtrado del catálogo, el carrito, los pedidos, las cuentas y las notificaciones toast.
- **Supabase** (`js/supabaseClient.js`): en la Fase 2, reemplaza a `localStorage` como lugar donde se guardan realmente los productos, los pedidos y los perfiles.
- **Relación front-end / base de datos**: las funciones `obtenerProductos()`, `guardarPedido()`, `registrarUsuario()`, etc. son el punto único donde el front-end "habla" con los datos, sin importar si están en el navegador o en Supabase.
- **Preparación para usuarios y seguridad**: la tabla `perfiles` y la columna `usuario_id` existen desde el inicio, y las políticas de `migracion_rls.sql` ya están redactadas, para que agregar autenticación no obligue a rediseñar el sistema.
