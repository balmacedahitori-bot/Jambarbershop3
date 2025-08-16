// ===== Formulario de login =====
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMsg = document.getElementById('login-error');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Limpiar errores anteriores
    errorMsg.textContent = '';

    // Validación simple
    if (!email || !password) {
      errorMsg.textContent = 'Por favor, completa todos los campos.';
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorMsg.textContent = data.message || 'Correo o contraseña incorrectos.';
        return;
      }

      // Guardar el token
      localStorage.setItem('token', data.token);

      // Guardar datos del usuario
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);

      // Redirigir según el rol
      const rol = data.user.role;
      if (rol === 'admin') {
        window.location.href = 'admin.html';
      } else if (rol === 'barbero') {
        window.location.href = 'barbero.html';
      } else {
        window.location.href = 'Menu.html';
      }

    } catch (err) {
      console.error('Error en login:', err);
      errorMsg.textContent = 'Error al conectar con el servidor.';
    }
  });
});

// ===== Formulario de registro =====
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();

  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Error al crear cuenta.');
      return;
    }

    alert('Cuenta creada con éxito, inicia sesión.');
    document.querySelector('.wrapper').classList.remove('active'); // Regresa al login

  } catch (err) {
    console.error('Error de registro:', err.message);
    alert('No se pudo registrar el usuario.');
  }
});

const wrapper = document.querySelector('.wrapper');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');

showRegister.addEventListener('click', e => {
  e.preventDefault();
  wrapper.classList.add('active');
  clearErrors();
});

showLogin.addEventListener('click', e => {
  e.preventDefault();
  wrapper.classList.remove('active');
  clearErrors();
});

function clearErrors() {
  document.getElementById('login-error').textContent = '';
  document.getElementById('register-error').textContent = '';
}

 if (window.history.length <= 1) {
window.addEventListener('popstate', () => {
  window.location.href = 'Menu.html'; // Ruta a tu página principal
});
}