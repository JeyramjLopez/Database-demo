const SUPABASE_URL = "https://cruapwkltiohggwqdsyu.supabase.co";
const SUPABASE_KEY = "sb_publishable_NtZ-jibltXYtMiDR3xvRRg_BGir-QBO";

const clienteSupabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
const listaProductos = document.querySelector("#lista-productos");
const mensaje = document.querySelector("#mensaje");
const buscador = document.querySelector("#buscar");
const filtroCategoria = document.querySelector("#filtro-categoria");

const totalProductosElemento =
  document.querySelector("#total-productos");

const totalUnidadesElemento =
  document.querySelector("#total-unidades");

const valorInventarioElemento =
  document.querySelector("#valor-inventario");

const stockBajoElemento =
  document.querySelector("#stock-bajo");

let productos = [];

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

async function cargarProductos() {
  mensaje.textContent = "Cargando productos desde Supabase...";

  const { data, error } = await clienteSupabase
    .from("productos")
    .select(`
      id,
      nombre,
      descripcion,
      precio_venta,
      stock,
      categoria_id
      imagen_url
    `)
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
      </div>
    `;

    listaProductos.appendChild(tarjeta);
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