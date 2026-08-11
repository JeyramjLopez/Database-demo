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