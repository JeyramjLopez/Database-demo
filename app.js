const SUPABASE_URL = "PEGA_AQUI_TU_PROJECT_URL";
const SUPABASE_KEY = "PEGA_AQUI_TU_PUBLISHABLE_KEY";

const clienteSupabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const cuerpoTabla = document.querySelector("#lista-productos");
const mensaje = document.querySelector("#mensaje");
const buscador = document.querySelector("#buscar");

let productos = [];

async function cargarProductos() {
  mensaje.textContent = "Cargando productos...";

  const { data, error } = await clienteSupabase
    .from("productos")
    .select("id, nombre, descripcion, precio_venta, stock")
    .order("nombre");

  if (error) {
    console.error(error);
    mensaje.textContent =
      "No fue posible cargar los productos.";

    return;
  }

  productos = data ?? [];

  mostrarProductos(productos);

  mensaje.textContent =
    `${productos.length} productos encontrados`;
}

function mostrarProductos(lista) {
  cuerpoTabla.innerHTML = "";

  if (lista.length === 0) {
    cuerpoTabla.innerHTML = `
      <tr>
        <td colspan="4">No se encontraron productos.</td>
      </tr>
    `;

    return;
  }

  for (const producto of lista) {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${producto.nombre}</td>
      <td>${producto.descripcion ?? ""}</td>
      <td>$${Number(producto.precio_venta).toFixed(2)}</td>
      <td>${producto.stock}</td>
    `;

    cuerpoTabla.appendChild(fila);
  }
}

buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase().trim();

  const filtrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(texto)
  );

  mostrarProductos(filtrados);

  mensaje.textContent =
    `${filtrados.length} productos encontrados`;
});

cargarProductos();