export const API_URL = "https://panel-de-administracion.onrender.com/recetas";

// READ: Obtener todas las recetas
export async function obtenerRecetas() {
  const respuesta = await fetch(API_URL);
  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status}`);
  }
  return await respuesta.json();
}

// READ (por ID): Obtener una receta específica
export async function obtenerRecetaPorId(id) {
  const respuesta = await fetch(`${API_URL}/${encodeURIComponent(id)}`);
  if (!respuesta.ok) {
    throw new Error("No se encontró la receta seleccionada.");
  }
  return await respuesta.json();
}

// CREATE: Crear una nueva receta (POST)
export async function crearReceta(payload) {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!respuesta.ok) {
    throw new Error("No se pudo guardar la receta en el servidor.");
  }
  return await respuesta.json();
}

// UPDATE: Actualizar una receta existente (PUT)
export async function actualizarReceta(id, payload) {
  const respuesta = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!respuesta.ok) {
    throw new Error("No se pudo actualizar la receta en el servidor.");
  }
  return await respuesta.json();
}

// DELETE: Eliminar una receta por ID
export async function eliminarRecetaPorId(id) {
  const respuesta = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
  if (!respuesta.ok) {
    throw new Error("No se pudo eliminar la receta.");
  }
  return true;
}