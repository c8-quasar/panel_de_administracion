// 1. Verifica si existe sesión activa antes de mostrar el panel
const sesionValida =
    sessionStorage.getItem("sesionAdmin") ||
    localStorage.getItem("sesionAdmin");

if (sesionValida !== "activa") {
    window.location.href = "./login.html";
}

// URL de la API (cambiar por la URL HTTPS desplegada al publicar)
const API_URL = "https://panel-de-administracion.onrender.com/recetas";
const IMAGEN_POR_DEFECTO = "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80";

let recetasCache = [];
let vistaActual = "tabla";

// Referencias a elementos del DOM
const apiEndpointLabel = document.getElementById("apiEndpointLabel");
const alertaContainer = document.getElementById("alertaContainer");
const tablaRecetasBody = document.getElementById("tablaRecetasBody");
const contenedorTabla = document.getElementById("contenedorTabla");
const contenedorTarjetas = document.getElementById("contenedorTarjetas");
const inputBuscar = document.getElementById("inputBuscar");
const filtroPais = document.getElementById("filtroPais");
const textoMostrando = document.getElementById("textoMostrando");
const subtituloTotal = document.getElementById("subtituloTotal");

const kpiTotal = document.getElementById("kpiTotal");
const kpiPais = document.getElementById("kpiPais");
const kpiPaisDetalle = document.getElementById("kpiPaisDetalle");
const kpiTiempo = document.getElementById("kpiTiempo");
const serverStatusDot = document.getElementById("serverStatusDot");
const serverStatusText = document.getElementById("serverStatusText");
const serverLatencyText = document.getElementById("serverLatencyText");

const recetaModal = new bootstrap.Modal(document.getElementById("recetaModal"));
const detalleModal = new bootstrap.Modal(document.getElementById("detalleModal"));
const recetaModalLabel = document.getElementById("recetaModalLabel");
const recetaForm = document.getElementById("recetaForm");

const recetaIdInput = document.getElementById("recetaId");
const tituloInput = document.getElementById("titulo");
const paisInput = document.getElementById("pais");
const tiempoInput = document.getElementById("tiempo");
const dificultadInput = document.getElementById("dificultad");
const estadoInput = document.getElementById("estado");
const imagenInput = document.getElementById("imagen");
const descripcionInput = document.getElementById("descripcion");

apiEndpointLabel.textContent = API_URL;

// Muestra mensajes de éxito, advertencia o error en pantalla
function mostrarAlerta(mensaje, tipo = "success") {
    const iconos = {
        success: "bi-check-circle-fill",
        danger: "bi-exclamation-triangle-fill",
        warning: "bi-exclamation-circle-fill"
    };

    alertaContainer.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show shadow-sm d-flex align-items-center" role="alert">
      <i class="bi ${iconos[tipo] || iconos.success} me-2"></i>
      <div>${mensaje}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;

    setTimeout(() => {
        alertaContainer.innerHTML = "";
    }, 4500);
}

// Calcula los indicadores a partir de las recetas cargadas
function actualizarKPIs(lista) {
    const total = lista.length;
    kpiTotal.textContent = total;
    subtituloTotal.textContent = `${total} recetas registradas`;

    if (total === 0) {
        kpiPais.textContent = "—";
        kpiPaisDetalle.textContent = "";
        kpiTiempo.textContent = "0";
        return;
    }

    const conteoPaises = {};
    let sumaTiempos = 0;

    lista.forEach((receta) => {
        conteoPaises[receta.pais] = (conteoPaises[receta.pais] || 0) + 1;
        sumaTiempos += Number(receta.tiempo) || 0;
    });

    const paisTop = Object.entries(conteoPaises).sort((a, b) => b[1] - a[1])[0];
    kpiPais.textContent = paisTop[0];
    kpiPaisDetalle.textContent = `(${paisTop[1]} del total)`;
    kpiTiempo.textContent = Math.round(sumaTiempos / total);
}

// Consulta todos los registros desde JSON Server usando GET
async function cargarRecetas(notificar = false) {
    const inicio = performance.now();
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        const latencia = Math.round(performance.now() - inicio);

        recetasCache = datos;
        actualizarKPIs(recetasCache);
        aplicarFiltrosYRenderizar();

        serverStatusDot.classList.remove("offline");
        serverStatusText.textContent = "200 OK";
        serverLatencyText.textContent = `Latencia: ${latencia}ms • json-server`;

        if (notificar) {
            mostrarAlerta("Catálogo sincronizado con JSON Server.", "success");
        }
    } catch (error) {
        serverStatusDot.classList.add("offline");
        serverStatusText.textContent = "Sin conexión";
        serverLatencyText.textContent = "Revisa que JSON Server esté activo";
        mostrarAlerta(`No se pudieron cargar las recetas: ${error.message}`, "danger");
    }
}

// Envía el formulario para crear una receta (POST) o actualizarla (PUT)
recetaForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const id = recetaIdInput.value;
    const titulo = tituloInput.value.trim();
    const pais = paisInput.value.trim();
    const tiempo = Number(tiempoInput.value);
    const dificultad = dificultadInput.value;
    const estado = estadoInput.value;
    const imagen = imagenInput.value.trim() || IMAGEN_POR_DEFECTO;
    const descripcion = descripcionInput.value.trim();

    // Valida que los campos obligatorios no estén vacíos y que el tiempo sea válido
    if (!titulo || !pais || !tiempo || tiempo <= 0 || !descripcion) {
        mostrarAlerta("Completa todos los campos obligatorios (*) y asegúrate de ingresar un tiempo mayor a 0.", "warning");
        return;
    }

    const payload = { titulo, pais, tiempo, dificultad, estado, imagen, descripcion };

    try {
        const url = id ? `${API_URL}/${id}` : API_URL;
        const metodo = id ? "PUT" : "POST";

        const respuesta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo guardar el cambio en el servidor.");
        }

        recetaModal.hide();
        recetaForm.reset();
        mostrarAlerta(
            id ? "Receta actualizada correctamente." : "Receta creada con éxito.",
            "success"
        );
        await cargarRecetas();
    } catch (error) {
        mostrarAlerta(`Error al guardar la receta: ${error.message}`, "danger");
    }
});

// Abre el modal limpio para registrar una nueva receta
function abrirModalCrear() {
    recetaForm.reset();
    recetaIdInput.value = "";
    recetaModalLabel.textContent = "Nueva Receta";
    recetaModal.show();
}

// Consulta una receta por ID y llena el formulario para editarla
async function abrirModalEditar(id) {
    try {
        const respuesta = await fetch(`${API_URL}/${id}`);
        if (!respuesta.ok) {
            throw new Error("No se encontró la receta seleccionada.");
        }

        const receta = await respuesta.json();
        recetaIdInput.value = receta.id;
        tituloInput.value = receta.titulo;
        paisInput.value = receta.pais;
        tiempoInput.value = receta.tiempo;
        dificultadInput.value = receta.dificultad;
        estadoInput.value = receta.estado || "Publicado";
        imagenInput.value = receta.imagen || "";
        descripcionInput.value = receta.descripcion;

        recetaModalLabel.textContent = "Editar Receta";
        recetaModal.show();
    } catch (error) {
        mostrarAlerta(`Error al cargar la receta para editar: ${error.message}`, "danger");
    }
}

// Elimina un registro de JSON Server mediante DELETE
async function eliminarReceta(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar esta receta?");
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar la receta.");
        }

        mostrarAlerta("Receta eliminada correctamente.", "success");
        await cargarRecetas();
    } catch (error) {
        mostrarAlerta(`Error al eliminar la receta: ${error.message}`, "danger");
    }
}

// Filtra por texto y por país antes de pintar en pantalla
function aplicarFiltrosYRenderizar() {
    const texto = inputBuscar.value.trim().toLowerCase();
    const paisSeleccionado = filtroPais.value;

    const filtradas = recetasCache.filter((receta) => {
        const coincideTexto =
            receta.titulo.toLowerCase().includes(texto) ||
            receta.pais.toLowerCase().includes(texto) ||
            receta.dificultad.toLowerCase().includes(texto);

        const coincidePais = paisSeleccionado === "TODOS" || receta.pais === paisSeleccionado;
        return coincideTexto && coincidePais;
    });

    textoMostrando.textContent = `Mostrando ${filtradas.length} de ${recetasCache.length}`;
    renderizarTabla(filtradas);
    renderizarTarjetas(filtradas);
}

// Dibuja las filas de la tabla principal
function renderizarTabla(lista) {
    tablaRecetasBody.innerHTML = "";

    if (lista.length === 0) {
        tablaRecetasBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5 text-muted">
          No hay recetas que coincidan con el filtro.
        </td>
      </tr>
    `;
        return;
    }

    lista.forEach((receta) => {
        const badgeEstado =
            receta.estado === "Publicado"
                ? `<span class="badge rounded-pill badge-estado-pub">• Publicado</span>`
                : `<span class="badge rounded-pill badge-estado-borr">• Borrador</span>`;

        const fila = document.createElement("tr");
        fila.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-3">
          <img src="${receta.imagen || IMAGEN_POR_DEFECTO}" alt="${receta.titulo}" class="recipe-thumb">
          <div>
            <div class="fw-bold" style="font-family: 'Noto Serif', serif;">${receta.titulo}</div>
            <div class="text-muted small text-truncate" style="max-width: 260px;">${receta.descripcion}</div>
          </div>
        </div>
      </td>
      <td><span class="badge rounded-pill badge-pais">• ${receta.pais}</span></td>
      <td><span class="badge rounded-pill badge-tiempo"><i class="bi bi-clock me-1"></i>${receta.tiempo} min</span></td>
      <td><span class="badge bg-light text-dark border">${receta.dificultad}</span></td>
      <td>${badgeEstado}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-link text-dark p-1" type="button" onclick="verDetalle('${receta.id}')" title="Ver detalle">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-sm btn-link text-secondary-kuro p-1" type="button" onclick="abrirModalEditar('${receta.id}')" title="Editar">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-link text-danger-custom p-1" type="button" onclick="eliminarReceta('${receta.id}')" title="Eliminar">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
        tablaRecetasBody.appendChild(fila);
    });
}

// Dibuja las recetas en formato de tarjetas
function renderizarTarjetas(lista) {
    contenedorTarjetas.innerHTML = "";

    lista.forEach((receta) => {
        const columna = document.createElement("div");
        columna.className = "col-md-6 col-xl-3";
        columna.innerHTML = `
      <div class="kpi-card overflow-hidden h-100 d-flex flex-column">
        <img src="${receta.imagen || IMAGEN_POR_DEFECTO}" alt="${receta.titulo}" style="height: 150px; object-fit: cover;">
        <div class="p-3 flex-grow-1 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between mb-2">
              <span class="badge rounded-pill badge-pais">${receta.pais}</span>
              <span class="badge rounded-pill badge-tiempo">${receta.tiempo} min</span>
            </div>
            <h6 class="page-title fw-bold">${receta.titulo}</h6>
            <p class="text-muted small mb-3">${receta.descripcion}</p>
          </div>
          <div class="d-flex justify-content-between align-items-center pt-2 border-top border-subtle">
            <span class="small fw-semibold">${receta.dificultad}</span>
            <div>
              <button class="btn btn-sm btn-outline-secondary me-1" type="button" onclick="abrirModalEditar('${receta.id}')"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" type="button" onclick="eliminarReceta('${receta.id}')"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    `;
        contenedorTarjetas.appendChild(columna);
    });
}

// Muestra la información completa de una receta en un modal
function verDetalle(id) {
    const receta = recetasCache.find((item) => String(item.id) === String(id));
    if (!receta) return;

    document.getElementById("detalleTitulo").textContent = receta.titulo;
    document.getElementById("detalleContenido").innerHTML = `
    <img src="${receta.imagen || IMAGEN_POR_DEFECTO}" alt="${receta.titulo}" class="img-fluid rounded-3 mb-3 w-100" style="max-height: 220px; object-fit: cover;">
    <div class="d-flex gap-2 mb-3">
      <span class="badge rounded-pill badge-pais">${receta.pais}</span>
      <span class="badge rounded-pill badge-tiempo">${receta.tiempo} min</span>
      <span class="badge bg-light text-dark border">${receta.dificultad}</span>
    </div>
    <p class="text-muted mb-0">${receta.descripcion}</p>
  `;
    detalleModal.show();
}

// Eventos de botones, filtros y cambio de vista
document.getElementById("btnNuevaReceta").addEventListener("click", abrirModalCrear);
document.getElementById("navCrearBtn").addEventListener("click", abrirModalCrear);
document.getElementById("btnSincronizar").addEventListener("click", () => cargarRecetas(true));

inputBuscar.addEventListener("input", aplicarFiltrosYRenderizar);
filtroPais.addEventListener("change", aplicarFiltrosYRenderizar);

const btnVistaTabla = document.getElementById("btnVistaTabla");
const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");

btnVistaTabla.addEventListener("click", () => {
    vistaActual = "tabla";
    btnVistaTabla.classList.add("active");
    btnVistaTarjetas.classList.remove("active");
    contenedorTabla.classList.remove("d-none");
    contenedorTarjetas.classList.add("d-none");
});

btnVistaTarjetas.addEventListener("click", () => {
    vistaActual = "tarjetas";
    btnVistaTarjetas.classList.add("active");
    btnVistaTabla.classList.remove("active");
    contenedorTarjetas.classList.remove("d-none");
    contenedorTabla.classList.add("d-none");
});

// Borra los datos de sesión de ambos almacenamientos y regresa al inicio de sesión
function cerrarSesion() {
    sessionStorage.removeItem("sesionAdmin");
    localStorage.removeItem("sesionAdmin");
    window.location.href = "./login.html";
}

const btnCerrarSidebar = document.getElementById("btnCerrarSesionSidebar");
const btnCerrarTop = document.getElementById("btnCerrarSesionTop");

if (btnCerrarSidebar) {
    btnCerrarSidebar.addEventListener("click", cerrarSesion);
} else {
    console.warn("No se encontró el botón btnCerrarSesionSidebar");
}

if (btnCerrarTop) {
    btnCerrarTop.addEventListener("click", cerrarSesion);
} else {
    console.warn("No se encontró el botón btnCerrarSesionTop");
}

// Carga inicial al abrir el documento
document.addEventListener("DOMContentLoaded", () => cargarRecetas(false));