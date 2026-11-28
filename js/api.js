export const API_URL = "https://panel-de-administracion.onrender.com/recetas";

// Función auxiliar para peticiones con control de tiempo de espera (ideal para Render)
async function fetchConTimeout(url, opciones = {}, timeoutMs = 45000) {
  const controller = new AbortController();
  const idTimeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const respuesta = await fetch(url, {
      ...opciones,
      signal: controller.signal
    });
    return respuesta;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("El servidor tardó demasiado en responder (Render iniciando). Intenta de nuevo en unos segundos.");
    }
    throw new Error("No se pudo conectar con la API. Verifica tu conexión a internet.");
  } finally {
    clearTimeout(idTimeout);
  }
}

// Normaliza cada receta para asegurar compatibilidad entre 'tiempo' y 'tiempoMinutos'
function normalizarReceta(receta) {
  if (!receta || typeof receta !== "object") return receta;
  const tiempoNormalizado = Number(receta.tiempo ?? receta.tiempoMinutos ?? 0);
  return {
    ...receta,
    tiempo: tiempoNormalizado,
    tiempoMinutos: tiempoNormalizado,
    estado: receta.estado || "Publicado"
  };
}

// READ: Obtener todas las recetas
export async function obtenerRecetas() {
  const respuesta = await fetchConTimeout(API_URL);
  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status} al consultar recetas.`);
  }
  const datos = await respuesta.json();
  return Array.isArray(datos) ? datos.map(normalizarReceta) : [];
}

// READ (por ID): Obtener una receta específica
export async function obtenerRecetaPorId(id) {
  const respuesta = await fetchConTimeout(`${API_URL}/${encodeURIComponent(id)}`);
  if (!respuesta.ok) {
    throw new Error("No se encontró la receta seleccionada.");
  }
  const receta = await respuesta.json();
  return normalizarReceta(receta);
}

// CREATE: Crear una nueva receta (POST)
export async function crearReceta(payload) {
  const cuerpo = {
    ...payload,
    tiempo: Number(payload.tiempo),
    tiempoMinutos: Number(payload.tiempo)
  };

  const respuesta = await fetchConTimeout(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo)
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo guardar la receta en el servidor.");
  }
  return normalizarReceta(await respuesta.json());
}

// UPDATE: Actualizar una receta existente sin borrar ingredientes ni pasos (PATCH)
export async function actualizarReceta(id, payload) {
  const cuerpo = {
    ...payload,
    tiempo: Number(payload.tiempo),
    tiempoMinutos: Number(payload.tiempo)
  };

  const respuesta = await fetchConTimeout(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo)
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo actualizar la receta en el servidor.");
  }
  return normalizarReceta(await respuesta.json());
}

// DELETE: Eliminar una receta por ID
export async function eliminarRecetaPorId(id) {
  const respuesta = await fetchConTimeout(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo eliminar la receta.");
  }
  return true;
}