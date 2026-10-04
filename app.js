const SUPABASE_URL = "https://cruapwkltiohggwqdsyu.supabase.co";
const SUPABASE_KEY = "sb_publishable_NtZ-jibltXYtMiDR3xvRRg_BGir-QBO";
const formularioProducto =
  document.querySelector("#formulario-producto");

const mensajeFormulario =
  document.querySelector("#mensaje-formulario");
const clienteSupabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
const listaProductos = document.querySelector("#lista-productos");
const mensaje = document.querySelector("#mensaje");
const buscador = document.querySelector("#buscar");
let carrito = [];

const botonCarrito = document.querySelector("#abrir-carrito");
const contadorCarrito = document.querySelector("#contador-carrito");
const panelCarrito =
  document.querySelector("#panel-carrito");

const fondoCarrito =
  document.querySelector("#fondo-carrito");

const cerrarCarrito =
  document.querySelector("#cerrar-carrito");

const listaCarrito =
  document.querySelector("#lista-carrito");

const totalCarrito =
  document.querySelector("#total-carrito");
const filtroCategoria = document.querySelector("#filtro-categoria");

const totalProductosElemento =
  document.querySelector("#total-productos");

const totalUnidadesElemento =
  document.querySelector("#total-unidades");

const valorInventarioElemento =
  document.querySelector("#valor-inventario");

const stockBajoElemento =
  document.querySelector("#stock-bajo");
  const formularioLogin =
  document.querySelector("#formulario-login");

const botonRegistro =
  document.querySelector("#boton-registro");

const mensajeLogin =
  document.querySelector("#mensaje-login");

const loginEmail =
  document.querySelector("#login-email");

const loginPassword =
  document.querySelector("#login-password");
  const enlaceAdministrar =
  document.querySelector("#enlace-administrar");

const seccionAdministrar =
  document.querySelector("#administrar");
  const seccion2FA = document.querySelector("#seccion-2fa");
const botonActivar2FA = document.querySelector("#activar-2fa");
const contenedorQR = document.querySelector("#contenedor-qr");
const codigo2FA = document.querySelector("#codigo-2fa");
const botonVerificar2FA = document.querySelector("#verificar-2fa");
const mensaje2FA = document.querySelector("#mensaje-2fa");
const textoBulk =
  document.querySelector("#texto-bulk");

const botonGuardarBulk =
  document.querySelector("#guardar-bulk");

const mensajeBulk =
  document.querySelector("#mensaje-bulk");
let factorId2FA = null;
async function controlarAccesoAdmin() {
  const { data } = await clienteSupabase.auth.getUser();

  const usuario = data.user;

  const esAdmin =
    usuario?.app_metadata?.role === "admin";

  if (esAdmin) {
    enlaceAdministrar.style.display = "";
    seccionAdministrar.style.display = "";
  } else {
    enlaceAdministrar.style.display = "none";
    seccionAdministrar.style.display = "none";
  }
}

controlarAccesoAdmin();

clienteSupabase.auth.onAuthStateChange(() => {
  controlarAccesoAdmin();
});
botonGuardarBulk.addEventListener("click", async () => {
  mensajeBulk.textContent = "";

  const texto = textoBulk.value.trim();

  if (!texto) {
    mensajeBulk.textContent =
      "Pega por lo menos un producto.";
    return;
  }

  const categorias = {
    "procesadores": 1,
    "tarjetas graficas": 2,
    "memoria ram": 3,
    "almacenamiento": 4,
    "motherboards": 5,
    "fuentes de poder": 6,
    "perifericos": 7,
    "accesorios": 8
  };

  const normalizarTexto = (texto) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const lineas = texto
    .split("\n")
    .map(linea => linea.trim())
    .filter(linea => linea !== "");

  const productosBulk = [];

  for (let i = 0; i < lineas.length; i++) {
    const campos = lineas[i]
      .split("|")
      .map(campo => campo.trim());

    if (campos.length !== 8) {
      mensajeBulk.textContent =
        `Error en la línea ${i + 1}: debe tener 8 campos.`;
      return;
    }

    const [
      nombre,
      tipo,
      precioCompra,
      precioVenta,
      stock,
      categoriaTexto,
      imagenUrl,
      especificacionesTexto
    ] = campos;

    const categoriaId =
      categorias[normalizarTexto(categoriaTexto)];

    if (!categoriaId) {
      mensajeBulk.textContent =
        `Categoría inválida en la línea ${i + 1}: ${categoriaTexto}`;
      return;
    }

    if (
      !nombre ||
      !precioCompra ||
      !precioVenta ||
      !stock
    ) {
      mensajeBulk.textContent =
        `Faltan datos obligatorios en la línea ${i + 1}.`;
      return;
    }

    const especificaciones = {};

    if (especificacionesTexto) {
      const listaSpecs =
        especificacionesTexto.split(";");

      for (const spec of listaSpecs) {
        const posicionIgual = spec.indexOf("=");

        if (posicionIgual === -1) {
          continue;
        }

        const clave =
          spec.slice(0, posicionIgual).trim();

        const valor =
          spec.slice(posicionIgual + 1).trim();

        if (clave && valor) {
          especificaciones[clave] = valor;
        }
      }
    }

    productosBulk.push({
      nombre: nombre,
      tipo_componente: tipo || null,
      precio_compra: Number(precioCompra),
      precio_venta: Number(precioVenta),
      stock: Number(stock),
      categoria_id: categoriaId,

      // Proveedor interno por defecto
      proveedor_id: 1,

      imagen_url: imagenUrl || null,

      especificaciones: especificaciones
    });
  }

  const { error } = await clienteSupabase
    .from("productos")
    .insert(productosBulk);

  if (error) {
    console.error("Error en Bulk Insert:", error);

    mensajeBulk.textContent =
      `Error: ${error.message}`;

    return;
  }

  mensajeBulk.textContent =
    `${productosBulk.length} productos guardados correctamente.`;

  textoBulk.value = "";

  cargarProductos();
});
botonActivar2FA.addEventListener("click", async () => {
  mensaje2FA.textContent = "Generando código QR...";

  const { data: usuarioData } =
    await clienteSupabase.auth.getUser();

  if (!usuarioData.user) {
    mensaje2FA.textContent =
      "Primero debes iniciar sesión.";
    return;
  }

  const { data, error } =
    await clienteSupabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "TechZone Authenticator"
    });

  if (error) {
    console.error("Error al activar 2FA:", error);
    mensaje2FA.textContent =
      `No se pudo activar 2FA: ${error.message}`;
    return;
  }

  factorId2FA = data.id;

  contenedorQR.innerHTML = `
    <p>Escanea este código con tu aplicación Authenticator:</p>
    ${data.totp.qr_code}
    <p>
      Si no puedes escanearlo, usa esta clave:
      <strong>${data.totp.secret}</strong>
    </p>
  `;

  mensaje2FA.textContent =
    "Escanea el QR y luego escribe el código de 6 dígitos.";
});
  botonRegistro.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
    mensajeLogin.textContent =
      "Escribe tu correo y contraseña.";
    return;
  }

  mensajeLogin.textContent =
    "Creando cuenta...";

  const { data, error } =
    await clienteSupabase.auth.signUp({
      email,
      password
    });

  if (error) {
    console.error(error);

    mensajeLogin.textContent =
      `Error: ${error.message}`;

    return;
  }

  mensajeLogin.textContent =
    "Cuenta creada. Revisa tu correo si Supabase solicita confirmación.";

  console.log("Usuario creado:", data);
});
formularioLogin.addEventListener(
  "submit",
  async (evento) => {
    evento.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    mensajeLogin.textContent =
      "Iniciando sesión...";

    const { data, error } =
      await clienteSupabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      console.error(error);

      mensajeLogin.textContent =
        `No se pudo iniciar sesión: ${error.message}`;

      return;
    }

    mensajeLogin.textContent =
      "Inicio de sesión correcto.";

    console.log("Sesión:", data);
  }
);

let productos = [];
function actualizarContadorCarrito() {
  contadorCarrito.textContent = carrito.length;
}
function abrirCarrito() {
  panelCarrito.classList.add("activo");
  fondoCarrito.classList.add("activo");
}
function mostrarCarrito() {
  console.log("Mostrando carrito:", carrito);
  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    listaCarrito.innerHTML = `
      <div class="carrito-vacio">
        Tu carrito está vacío.
      </div>
    `;

    totalCarrito.textContent = "$0.00";
    return;
  }

  let total = 0;

  for (const producto of carrito) {
    total += Number(producto.precio_venta);

    const itemCarrito =
      document.createElement("article");

    itemCarrito.className = "item-carrito";

    itemCarrito.innerHTML = `
      ${
        producto.imagen_url
          ? `<img
              src="${producto.imagen_url}"
              alt="${producto.nombre}"
            >`
          : `<div class="imagen-carrito-vacia">💻</div>`
      }

      <div>
        <h3>${producto.nombre}</h3>

        <p>
          ${Number(producto.precio_venta).toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "USD"
            }
          )}
        </p>

        <button
          class="eliminar-carrito"
          type="button"
        >
          Eliminar
        </button>
      </div>
    `;

    const botonEliminar =
      itemCarrito.querySelector(".eliminar-carrito");

    botonEliminar.addEventListener("click", () => {
      eliminarDelCarrito(producto.id);
    });

    listaCarrito.appendChild(itemCarrito);
  }

  totalCarrito.textContent = total.toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD"
    }
  );
}
function eliminarDelCarrito(idProducto) {
  const posicion = carrito.findIndex(
    (producto) => producto.id === idProducto
  );

  if (posicion === -1) {
    return;
  }

  carrito.splice(posicion, 1);

  actualizarContadorCarrito();
  mostrarCarrito();
}
function cerrarPanelCarrito() {
  panelCarrito.classList.remove("activo");
  fondoCarrito.classList.remove("activo");
}
botonCarrito.addEventListener("click", abrirCarrito);

cerrarCarrito.addEventListener("click", cerrarPanelCarrito);

fondoCarrito.addEventListener("click", cerrarPanelCarrito);
function agregarAlCarrito(idProducto) {
  const producto = productos.find(p => p.id === idProducto);

  if (!producto) return;

carrito.push(producto);

console.log("Producto agregado:", producto);
console.log("Contenido del carrito:", carrito);

actualizarContadorCarrito();
mostrarCarrito();
abrirCarrito();
}
const categorias = {
  1: {
    nombre: "Procesadores",
    icono: "🧠"
  },
  2: {
    nombre: "Tarjetas gráficas",
    icono: "🎮"
  },
  3: {
    nombre: "Memoria RAM",
    icono: "💾"
  },
  4: {
    nombre: "Almacenamiento",
    icono: "📀"
  },
  5: {
    nombre: "Motherboards",
    icono: "🔌"
  },
  6: {
    nombre: "Fuentes de poder",
    icono: "⚡"
  },
  7: {
    nombre: "Periféricos",
    icono: "🖱️"
  },
  8: {
    nombre: "Accesorios",
    icono: "🔧"
  }
};
formularioProducto.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  mensajeFormulario.className = "mensaje-formulario";
  mensajeFormulario.textContent = "Guardando producto...";

  const nuevoProducto = {
    nombre: document
      .querySelector("#producto-nombre")
      .value
      .trim(),

    descripcion: document
      .querySelector("#producto-descripcion")
      .value
      .trim(),

    precio_compra: Number(
      document.querySelector("#producto-precio-compra").value
    ),

    precio_venta: Number(
      document.querySelector("#producto-precio-venta").value
    ),

    stock: Number(
      document.querySelector("#producto-stock").value
    ),

    categoria_id: Number(
      document.querySelector("#producto-categoria").value
    ),

    proveedor_id: Number(
      document.querySelector("#producto-proveedor").value
    ),

    imagen_url:
      document.querySelector("#producto-imagen").value.trim() ||
      null
  };

  const { error } = await clienteSupabase
    .from("productos")
    .insert(nuevoProducto);

  if (error) {
    console.error("Error al guardar:", error);

    mensajeFormulario.classList.add("error");
    mensajeFormulario.textContent =
      `No se pudo guardar: ${error.message}`;

    return;
  }

  mensajeFormulario.classList.add("exito");
  mensajeFormulario.textContent =
    "Producto guardado correctamente.";

  formularioProducto.reset();

  await cargarProductos();
});
async function cargarProductos() {
  mensaje.textContent = "Cargando productos desde Supabase...";

  const { data, error } = await clienteSupabase
    .from("productos")
    .select("*")
    .order("nombre");

  if (error) {
    console.error("Error de Supabase:", error);

    mensaje.textContent =
      "No fue posible cargar los productos.";

    return;
  }

  productos = data ?? [];

  actualizarEstadisticas();
  aplicarFiltros();
}

function actualizarEstadisticas() {
  const totalProductos = productos.length;

  const totalUnidades = productos.reduce(
    (acumulado, producto) =>
      acumulado + Number(producto.stock),
    0
  );

  const valorInventario = productos.reduce(
    (acumulado, producto) =>
      acumulado +
      Number(producto.precio_venta) *
      Number(producto.stock),
    0
  );

  const productosStockBajo = productos.filter(
    (producto) => Number(producto.stock) < 10
  ).length;

  totalProductosElemento.textContent = totalProductos;

  totalUnidadesElemento.textContent =
    totalUnidades.toLocaleString("en-US");

  valorInventarioElemento.textContent =
    valorInventario.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });

  stockBajoElemento.textContent = productosStockBajo;
}

function obtenerEstadoStock(stock) {
  const cantidad = Number(stock);

  if (cantidad < 10) {
    return {
      texto: `${cantidad} disponibles`,
      clase: "stock-bajo"
    };
  }

  if (cantidad < 20) {
    return {
      texto: `${cantidad} disponibles`,
      clase: "stock-medio"
    };
  }

  return {
    texto: `${cantidad} disponibles`,
    clase: "stock-alto"
  };
}

function mostrarProductos(lista) {
  listaProductos.innerHTML = "";

  if (lista.length === 0) {
    listaProductos.innerHTML = `
      <div class="sin-resultados">
        No encontramos productos con esos filtros.
      </div>
    `;

    mensaje.textContent = "0 productos encontrados";

    return;
  }

  for (const producto of lista) {
    const categoria =
      categorias[producto.categoria_id] ?? {
        nombre: "Tecnología",
        icono: "💻"
      };

    const estadoStock = obtenerEstadoStock(producto.stock);

    const tarjeta = document.createElement("article");

    tarjeta.className = "producto";

    tarjeta.innerHTML = `
      <div class="producto-imagen">
  ${
    producto.imagen_url
      ? `<img
          src="${producto.imagen_url}"
          alt="${producto.nombre}"
          class="imagen-real-producto"
        >`
      : categoria.icono
  }
</div>

      <div class="producto-contenido">
        <span class="producto-categoria">
          ${categoria.nombre}
        </span>

        <h3>${producto.nombre}</h3>

        <p class="producto-descripcion">
          ${producto.descripcion ?? "Sin descripción disponible."}
        </p>

        <div class="producto-footer">
          <strong class="producto-precio">
            ${Number(producto.precio_venta).toLocaleString(
              "en-US",
              {
                style: "currency",
                currency: "USD"
              }
            )}
          </strong>

          <span class="producto-stock ${estadoStock.clase}">
            ${estadoStock.texto}
          </span>
        </div>
        <button
  class="boton-agregar"
  data-id="${producto.id}"
  type="button"
>
  Agregar al carrito
</button>
      </div>
    `;

    listaProductos.appendChild(tarjeta);
  
const botonAgregar = tarjeta.querySelector(".boton-agregar");

botonAgregar.addEventListener("click", () => {
    agregarAlCarrito(producto.id);
});
}
  mensaje.textContent =
    `${lista.length} productos encontrados`;
}

function aplicarFiltros() {
  const texto = buscador.value
    .toLowerCase()
    .trim();

  const categoriaSeleccionada =
    filtroCategoria.value;

  const productosFiltrados = productos.filter(
    (producto) => {
      const coincideTexto =
        producto.nombre
          .toLowerCase()
          .includes(texto) ||
        (producto.descripcion ?? "")
          .toLowerCase()
          .includes(texto);

      const coincideCategoria =
        categoriaSeleccionada === "todas" ||
        String(producto.categoria_id) ===
          categoriaSeleccionada;

      return coincideTexto && coincideCategoria;
    }
  );

  mostrarProductos(productosFiltrados);
}

buscador.addEventListener("input", aplicarFiltros);

filtroCategoria.addEventListener(
  "change",
  aplicarFiltros
);

cargarProductos();