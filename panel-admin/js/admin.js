/* ==========================================================
   PASO 1. CONFIGURACIÓN
   Dirección de la API y una imagen por si la receta no trae
   ========================================================== */
const API_URL = "http://localhost:3000/recetas";
const IMAGEN_POR_DEFECTO = "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80";

// Copia de las recetas en memoria (para filtrar sin pedirle al servidor cada vez)
let recetasCache = [];


/* ==========================================================
   PASO 2. ELEMENTOS DEL HTML
   Guardamos en variables los elementos que vamos a usar,
   buscándolos por su id
   ========================================================== */
// Zonas que se llenan con JS
const alertaContainer = document.getElementById("alertaContainer");
const tablaRecetasBody = document.getElementById("tablaRecetasBody");
const contenedorTabla = document.getElementById("contenedorTabla");
const contenedorTarjetas = document.getElementById("contenedorTarjetas");
const textoMostrando = document.getElementById("textoMostrando");
const subtituloTotal = document.getElementById("subtituloTotal");

// Filtros
const inputBuscar = document.getElementById("inputBuscar");
const filtroPais = document.getElementById("filtroPais");

// Indicadores (KPIs) y estado del servidor
const kpiTotal = document.getElementById("kpiTotal");
const kpiPais = document.getElementById("kpiPais");
const kpiPaisDetalle = document.getElementById("kpiPaisDetalle");
const kpiTiempo = document.getElementById("kpiTiempo");
const serverStatusDot = document.getElementById("serverStatusDot");
const serverStatusText = document.getElementById("serverStatusText");
const serverLatencyText = document.getElementById("serverLatencyText");

// Modales (ventanas emergentes de Bootstrap)
const recetaModal = new bootstrap.Modal(document.getElementById("recetaModal"));
const detalleModal = new bootstrap.Modal(document.getElementById("detalleModal"));
const recetaModalLabel = document.getElementById("recetaModalLabel");

// Formulario y sus campos
const recetaForm = document.getElementById("recetaForm");
const recetaIdInput = document.getElementById("recetaId");
const tituloInput = document.getElementById("titulo");
const paisInput = document.getElementById("pais");
const tiempoInput = document.getElementById("tiempo");
const dificultadInput = document.getElementById("dificultad");
const estadoInput = document.getElementById("estado");
const imagenInput = document.getElementById("imagen");
const descripcionInput = document.getElementById("descripcion");


/* ==========================================================
   PASO 3. MENSAJES EN PANTALLA
   Muestra una alerta (éxito, advertencia o error) y la quita
   sola a los 4.5 segundos
   ========================================================== */
function mostrarAlerta(mensaje, tipo = "success") {
    alertaContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => { alertaContainer.innerHTML = ""; }, 4500);
}


/* ==========================================================
   PASO 4. LEER RECETAS (GET)
   Pide la lista al servidor, la guarda y actualiza la pantalla
   ========================================================== */
async function cargarRecetas(notificar = false) {
    const inicio = performance.now(); // para medir cuánto tarda el servidor

    try {
        const respuesta = await fetch(API_URL);          // 1. pedir datos
        if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);

        recetasCache = await respuesta.json();           // 2. guardarlos

        actualizarKPIs(recetasCache);                    // 3. calcular indicadores
        aplicarFiltrosYRenderizar();                     // 4. pintar tabla y tarjetas

        // Estado del servidor: conectado
        serverStatusDot.classList.remove("offline");
        serverStatusText.textContent = "200 OK";
        serverLatencyText.textContent = `Latencia: ${Math.round(performance.now() - inicio)}ms`;

        if (notificar) mostrarAlerta("Catálogo sincronizado con JSON Server.");

    } catch (error) {
        // Estado del servidor: sin conexión
        serverStatusDot.classList.add("offline");
        serverStatusText.textContent = "Sin conexión";
        serverLatencyText.textContent = "Revisa que JSON Server esté activo";
        mostrarAlerta(`No se pudieron cargar las recetas: ${error.message}`, "danger");
    }
}


/* ==========================================================
   PASO 5. INDICADORES (KPIs)
   Total de recetas, país que más se repite y tiempo promedio
   ========================================================== */
function actualizarKPIs(lista) {
    const total = lista.length;
    kpiTotal.textContent = total;
    subtituloTotal.textContent = `${total} recetas registradas`;

    // Si no hay recetas, dejamos todo en cero
    if (total === 0) {
        kpiPais.textContent = "—";
        kpiPaisDetalle.textContent = "";
        kpiTiempo.textContent = "0";
        return;
    }

    const conteoPaises = {};  // ejemplo: { "Japón": 1, "China": 2 }
    let sumaTiempos = 0;

    lista.forEach((receta) => {
        conteoPaises[receta.pais] = (conteoPaises[receta.pais] || 0) + 1;
        sumaTiempos += Number(receta.tiempo);
    });

    // Ordenamos de mayor a menor y tomamos el primero
    const paisTop = Object.entries(conteoPaises).sort((a, b) => b[1] - a[1])[0];

    kpiPais.textContent = paisTop[0];
    kpiPaisDetalle.textContent = `(${paisTop[1]} del total)`;
    kpiTiempo.textContent = Math.round(sumaTiempos / total);
}


/* ==========================================================
   PASO 6. FILTRAR Y PINTAR
   Filtra por texto y país, y dibuja la tabla y las tarjetas
   ========================================================== */
function aplicarFiltrosYRenderizar() {
    const texto = inputBuscar.value.trim().toLowerCase();
    const paisSeleccionado = filtroPais.value;

    // filter: deja pasar solo las recetas que cumplen las condiciones
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

// Dibuja una fila de la tabla por cada receta
function renderizarTabla(lista) {
    tablaRecetasBody.innerHTML = "";

    if (lista.length === 0) {
        tablaRecetasBody.innerHTML = `
            <tr><td colspan="6" class="text-center py-5 text-muted">
                No hay recetas que coincidan con el filtro.
            </td></tr>`;
        return;
    }

    lista.forEach((receta) => {
        const badgeEstado = receta.estado === "Publicado"
            ? `<span class="badge rounded-pill badge-estado-pub">• Publicado</span>`
            : `<span class="badge rounded-pill badge-estado-borr">• Borrador</span>`;

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-3">
                    <img src="${receta.imagen || IMAGEN_POR_DEFECTO}" alt="${receta.titulo}" class="recipe-thumb">
                    <div>
                        <div class="fw-bold">${receta.titulo}</div>
                        <div class="text-muted small text-truncate" style="max-width: 260px;">${receta.descripcion}</div>
                    </div>
                </div>
            </td>
            <td><span class="badge rounded-pill badge-pais">• ${receta.pais}</span></td>
            <td><span class="badge rounded-pill badge-tiempo">${receta.tiempo} min</span></td>
            <td><span class="badge bg-light text-dark border">${receta.dificultad}</span></td>
            <td>${badgeEstado}</td>
            <td class="text-end text-nowrap">
                <button class="btn btn-sm btn-link text-dark p-1" onclick="verDetalle('${receta.id}')" title="Ver detalle"><i class="bi bi-eye"></i></button>
                <button class="btn btn-sm btn-link text-secondary-kuro p-1" onclick="abrirModalEditar('${receta.id}')" title="Editar"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-link text-danger-custom p-1" onclick="eliminarReceta('${receta.id}')" title="Eliminar"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tablaRecetasBody.appendChild(fila);
    });
}

// Dibuja una tarjeta por cada receta
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
                    <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span class="small fw-semibold">${receta.dificultad}</span>
                        <div>
                            <button class="btn btn-sm btn-outline-secondary me-1" onclick="abrirModalEditar('${receta.id}')"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-outline-danger" onclick="eliminarReceta('${receta.id}')"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedorTarjetas.appendChild(columna);
    });
}


/* ==========================================================
   PASO 7. CREAR Y EDITAR (POST y PUT)
   El mismo formulario sirve para las dos cosas:
   - si el campo oculto "recetaId" está vacío → es una receta NUEVA (POST)
   - si trae un id → es una EDICIÓN (PUT)
   ========================================================== */

// Abre el formulario vacío
function abrirModalCrear() {
    recetaForm.reset();
    recetaIdInput.value = "";
    recetaModalLabel.textContent = "Nueva Receta";
    recetaModal.show();
}

// Abre el formulario con los datos de una receta ya existente
async function abrirModalEditar(id) {
    try {
        const respuesta = await fetch(`${API_URL}/${id}`);
        if (!respuesta.ok) throw new Error("No se encontró la receta.");

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
        mostrarAlerta(`Error al cargar la receta: ${error.message}`, "danger");
    }
}

// Se ejecuta al presionar "Guardar Receta"
recetaForm.addEventListener("submit", async (evento) => {
    evento.preventDefault(); // evita que la página se recargue

    // 1. Leer los datos del formulario
    const id = recetaIdInput.value;
    const titulo = tituloInput.value.trim();
    const pais = paisInput.value;
    const tiempo = Number(tiempoInput.value);
    const descripcion = descripcionInput.value.trim();

    // 2. Validar campos obligatorios
    if (!titulo || !pais || tiempo <= 0 || !descripcion) {
        mostrarAlerta("Completa todos los campos obligatorios (*) y usa un tiempo mayor a 0.", "warning");
        return;
    }

    // 3. Armar el objeto que se enviará al servidor
    const receta = {
        titulo,
        pais,
        tiempo,
        dificultad: dificultadInput.value,
        estado: estadoInput.value,
        imagen: imagenInput.value.trim() || IMAGEN_POR_DEFECTO,
        descripcion
    };

    // 4. Enviar: PUT si hay id, POST si no
    try {
        const url = id ? `${API_URL}/${id}` : API_URL;
        const metodo = id ? "PUT" : "POST";

        const respuesta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(receta)   // convierte el objeto a texto JSON
        });

        if (!respuesta.ok) throw new Error("El servidor no pudo guardar el cambio.");

        recetaModal.hide();
        mostrarAlerta(id ? "Receta actualizada correctamente." : "Receta creada con éxito.");
        await cargarRecetas(); // 5. refrescar la lista

    } catch (error) {
        mostrarAlerta(`Error al guardar la receta: ${error.message}`, "danger");
    }
});


/* ==========================================================
   PASO 8. ELIMINAR (DELETE) Y VER DETALLE
   ========================================================== */
async function eliminarReceta(id) {
    if (!confirm("¿Seguro que deseas eliminar esta receta?")) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!respuesta.ok) throw new Error("No se pudo eliminar la receta.");

        mostrarAlerta("Receta eliminada correctamente.");
        await cargarRecetas();
    } catch (error) {
        mostrarAlerta(`Error al eliminar la receta: ${error.message}`, "danger");
    }
}

// Muestra la receta completa en un modal (usa la copia en memoria, no pide nada al servidor)
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


/* ==========================================================
   PASO 9. EVENTOS (conectar botones con funciones) E INICIO
   ========================================================== */
// Botones principales
document.getElementById("navCrearBtn").addEventListener("click", abrirModalCrear);
document.getElementById("btnSincronizar").addEventListener("click", () => cargarRecetas(true));

// Filtros: se vuelve a filtrar cada vez que el usuario escribe o cambia el país
inputBuscar.addEventListener("input", aplicarFiltrosYRenderizar);
filtroPais.addEventListener("change", aplicarFiltrosYRenderizar);

// Cambio de vista: tabla <-> tarjetas (d-none = ocultar)
const btnVistaTabla = document.getElementById("btnVistaTabla");
const btnVistaTarjetas = document.getElementById("btnVistaTarjetas");

btnVistaTabla.addEventListener("click", () => {
    btnVistaTabla.classList.add("active");
    btnVistaTarjetas.classList.remove("active");
    contenedorTabla.classList.remove("d-none");
    contenedorTarjetas.classList.add("d-none");
});

btnVistaTarjetas.addEventListener("click", () => {
    btnVistaTarjetas.classList.add("active");
    btnVistaTabla.classList.remove("active");
    contenedorTarjetas.classList.remove("d-none");
    contenedorTabla.classList.add("d-none");
});

// Cerrar sesión: borra los datos guardados y vuelve al login
document.getElementById("btnCerrarSesionSidebar").addEventListener("click", () => {
    sessionStorage.removeItem("sesionActiva");
    sessionStorage.removeItem("adminSession");
    window.location.href = "login.html";
});

// INICIO: al abrir la página, cargar las recetas
document.addEventListener("DOMContentLoaded", () => cargarRecetas(false));