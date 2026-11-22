// Verifica si existe sesión activa antes de mostrar el panel
const sesionValida =
    sessionStorage.getItem("sesionActiva") ||
    sessionStorage.getItem("adminSession");

if (!sesionValida) {
    window.location.href = "login.html";
}

// URL de la API (cambiar por la URL HTTPS desplegada al publicar)
const API_URL = "http://localhost:3000/recetas";
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