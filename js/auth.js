const formulario = document.getElementById("form-login");
const recordar = document.getElementById("remember");
const estadoConexion = document.getElementById("connection-status");

const conexionSegura = window.location.protocol === "https:";
estadoConexion.textContent = conexionSegura ? "SSL Activo" : "Sin HTTPS";
estadoConexion.classList.toggle("is-secure", conexionSegura);

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const correo = document.getElementById("email").value;
  const clave = document.getElementById("password").value;
  const mensaje = document.getElementById("mensaje-error");

  if (correo === "admin@kurosesamo.com" && clave === "admin123") {
    const almacenamiento = recordar.checked ? localStorage : sessionStorage;
    const otroAlmacenamiento = recordar.checked ? sessionStorage : localStorage;
    almacenamiento.setItem("sesionAdmin", "activa");
    otroAlmacenamiento.removeItem("sesionAdmin");
    window.location.href = "admin.html";
  } else {
    mensaje.textContent = "Correo o contraseña incorrectos";
    mensaje.hidden = false;
  }
});
