window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const loginBtn = document.getElementById('btn-login');

  // Si no hay token, el botón permanece como "Login" y va a login-registro.html
  if (!token) {
    loginBtn.textContent = 'Login';
    loginBtn.href = 'login-registro.html';
    return;
  }

  // Si hay token, validar y cambiar el botón según el rol
  fetch('http://localhost:3000/api/auth/perfil', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.ok ? res.json() : Promise.reject('Token inválido'))
  .then(user => {
    // Actualizar el texto y redirección del botón según el rol
    if (user.role === 'admin') {
      loginBtn.textContent = 'Panel Admin';
      loginBtn.href = 'admin.html';
    } else if (user.role === 'barbero') {
      loginBtn.textContent = 'Panel Barbero';
      loginBtn.href = 'barbero.html';
    } else {
      loginBtn.textContent = 'Mi Panel';
      loginBtn.href = 'cliente.html';
    }
    
    // Agregar funcionalidad de cerrar sesión al botón
    loginBtn.addEventListener('click', function(e) {
      // Si se mantiene presionado Ctrl, cerrar sesión
      if (e.ctrlKey) {
        e.preventDefault();
        localStorage.removeItem('token');
        alert('Sesión cerrada. Recarga la página para ver el formulario de login.');
        location.reload();
      }
    });
  })
  .catch(err => {
    console.warn('No se pudo validar sesión:', err);
    localStorage.removeItem('token'); // Limpieza si el token no sirve
    // Restaurar el botón a Login si el token es inválido
    loginBtn.textContent = 'Login';
    loginBtn.href = 'login-registro.html';
  });
});



async function cargarServiciosPublicos() {
  try {
    const res = await fetch('http://localhost:3000/api/servicios/public');
    const servicios = await res.json();

    const contenedor = document.getElementById('publicServicesGrid');
    contenedor.innerHTML = '';

    servicios.forEach(servicio => {
      const card = document.createElement('div');
      card.className = 'service-card';

      card.innerHTML = `
        ${servicio.imagen ? `<img src="${servicio.imagen}" alt="${servicio.nombre}" class="service-img" />` : ''}
        <h3>${servicio.nombre}</h3>
        <p>${servicio.descripcion || 'Sin descripción'}</p>
        <p><strong>Duración:</strong> ${servicio.duracion} min</p>
        <p><strong>Precio:</strong> C$ ${servicio.precio}</p>
      `;

      contenedor.appendChild(card);
    });

  } catch (error) {
    console.error('Error al cargar servicios públicos:', error);
  }
}

// Ejecutar al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  cargarServiciosPublicos(); // 🔥 esto se llama automáticamente al abrir la web
  
  // Configurar enlaces de redes sociales
  configurarRedesSociales();
  
  // Configurar scroll suave para navegación
  configurarScrollSuave();
});

// Función para configurar los enlaces de redes sociales
function configurarRedesSociales() {
  const facebookIcon = document.querySelector('.icon.facebook');
  const whatsappIcon = document.querySelector('.icon.whatsapp');
  const instagramIcon = document.querySelector('.icon.instagram');

  // Enlaces de redes sociales (reemplaza con tus URLs reales)
  const redesSociales = {
    facebook: 'https://www.facebook.com/jeffrje?locale=es_LA',
    whatsapp: 'https://wa.me/50512345678?text=Hola,%20me%20interesa%20agendar%20una%20cita',
    instagram: 'https://www.instagram.com'
  };

  // Agregar eventos click
  if (facebookIcon) {
    facebookIcon.addEventListener('click', () => {
      window.open(redesSociales.facebook, '_blank');
    });
  }

  if (whatsappIcon) {
    whatsappIcon.addEventListener('click', () => {
      window.open(redesSociales.whatsapp, '_blank');
    });
  }

  if (instagramIcon) {
    instagramIcon.addEventListener('click', () => {
      window.open(redesSociales.instagram, '_blank');
    });
  }
}

// Función para configurar scroll suave en la navegación
function configurarScrollSuave() {
  // Seleccionar todos los enlaces del menú de navegación
  const enlacesNavegacion = document.querySelectorAll('.nav a[href^="#"]');
  
  enlacesNavegacion.forEach(enlace => {
    enlace.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Obtener el ID de la sección objetivo
      const seccionObjetivo = this.getAttribute('href').substring(1);
      const seccion = document.getElementById(seccionObjetivo);
      
      if (seccion) {
        // Calcular la posición de la sección con offset para el header
        const headerHeight = document.querySelector('.container-header').offsetHeight;
        const posicionSeccion = seccion.offsetTop - headerHeight - 20; // 20px de margen adicional
        
        // Realizar scroll suave
        window.scrollTo({
          top: posicionSeccion,
          behavior: 'smooth'
        });
        
        // Opcional: Actualizar la URL sin recargar la página
        history.pushState(null, null, `#${seccionObjetivo}`);
      }
    });
  });
  
  // Agregar efecto de resaltado activo al menú
  window.addEventListener('scroll', function() {
    const secciones = document.querySelectorAll('section[id]');
    const enlaces = document.querySelectorAll('.nav a[href^="#"]');
    
    let seccionActual = '';
    
    secciones.forEach(seccion => {
      const seccionTop = seccion.offsetTop;
      const seccionAltura = seccion.clientHeight;
      
      if (window.pageYOffset >= (seccionTop - 200)) {
        seccionActual = seccion.getAttribute('id');
      }
    });
    
    enlaces.forEach(enlace => {
      enlace.classList.remove('active');
      if (enlace.getAttribute('href') === `#${seccionActual}`) {
        enlace.classList.add('active');
      }
    });
  });
}

// Carga dinámica de servicios para la página pública
window.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('services-grid-public');
  if (!grid) return;

  grid.innerHTML = '<p style="color:#ccc">Cargando servicios...</p>';

  try {
    const res = await fetch('http://localhost:3000/api/servicios/public');
    if (!res.ok) throw new Error('No se pudo cargar');
    const servicios = await res.json();

    if (!Array.isArray(servicios) || servicios.length === 0) {
      grid.innerHTML = '<p style="color:#ccc">No hay servicios disponibles por ahora.</p>';
      return;
    }

    const escapeHtml = (t = '') => t
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    grid.innerHTML = servicios.map(s => {
      const nombre = escapeHtml(s.nombre || 'Servicio');
      const descripcion = escapeHtml(s.descripcion || '');
      const precio = s.precio != null ? `C$ ${s.precio}` : '';
      const duracion = s.duracion != null ? `${s.duracion} min` : '';

      return `
        <div class="service-card">
          <div class="service-name">${nombre}</div>
          ${descripcion ? `<div class="service-description">${descripcion}</div>` : ''}
          <div class="service-meta">
            ${duracion ? `<span class="meta-item"><i class="fa-regular fa-clock"></i> ${duracion}</span>` : ''}
            ${precio ? `<span class="meta-item price"><i class="fa-solid fa-tag"></i> ${precio}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Servicios públicos:', err);
    grid.innerHTML = '<p style="color:#e63946">Error al cargar servicios.</p>';
  }
});


