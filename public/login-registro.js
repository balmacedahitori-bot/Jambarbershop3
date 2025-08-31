// ===== Configuración BASE_URL =====
// Detectamos si estamos en local o en producción
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// 🚨 OPCIÓN 1: Si frontend y backend están en la misma app en Railway -> BASE_URL = "" en producción
// 🚨 OPCIÓN 2: Si frontend está en otro hosting (ej. GitHub Pages / Vercel) -> reemplaza la URL de Railway
const BASE_URL = isLocal
  ? "http://localhost:3000" // Local
  : ""; // Producción (mismo dominio en Railway). 
// Si tu frontend está separado, cámbialo por:
// "https://jambarbershop3-production.up.railway.app"

// ===== Formulario de login =====
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorMsg = document.getElementById("login-error");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Limpiar errores anteriores
    errorMsg.textContent = "";

    if (!email || !password) {
      errorMsg.textContent = "Por favor, completa todos los campos.";
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorMsg.textContent =
          data.message || "Correo o contraseña incorrectos.";
        return;
      }

      // Guardar token y datos del usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);

      // Redirigir según el rol
      const rol = data.user.role;
      if (rol === "admin") {
        window.location.href = "admin.html";
      } else if (rol === "barbero") {
        window.location.href = "barbero.html";
      } else {
        window.location.href = "Menu.html";
      }
    } catch (err) {
      console.error("Error en login:", err);
      errorMsg.textContent = "Error al conectar con el servidor.";
    }
  });
});

// ===== Formulario de registro =====
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  const registerError = document.getElementById("register-error");
  if (registerError) registerError.textContent = "";

  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (registerError) {
        registerError.textContent = data.message || "Error al crear cuenta.";
      } else {
        alert(data.message || "Error al crear cuenta.");
      }
      return;
    }

    alert("Cuenta creada con éxito, inicia sesión.");
    document.querySelector(".wrapper").classList.remove("active"); // Regresa al login
  } catch (err) {
    console.error("Error de registro:", err);
    alert("No se pudo registrar el usuario.");
  }
});

// ===== Switch entre login y registro =====
const wrapper = document.querySelector(".wrapper");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

showRegister.addEventListener("click", (e) => {
  e.preventDefault();
  wrapper.classList.add("active");
  clearErrors();
});

showLogin.addEventListener("click", (e) => {
  e.preventDefault();
  wrapper.classList.remove("active");
  clearErrors();
});

function clearErrors() {
  const loginError = document.getElementById("login-error");
  const registerError = document.getElementById("register-error");
  if (loginError) loginError.textContent = "";
  if (registerError) registerError.textContent = "";
}

// ===== Manejo del botón atrás del navegador =====
if (window.history.length <= 1) {
  window.addEventListener("popstate", () => {
    window.location.href = "Menu.html"; // Página principal
  });
}

