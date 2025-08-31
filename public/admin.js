// ===== Configuración BASE_URL =====
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocal
  ? "http://localhost:3000"
  : "https://jambarbershop3-production-58dd.up.railway.app";

// ===== Escape HTML =====
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
}

// ===== Funciones globales =====
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  window.location.href = 'Menu.html';
}

// ===== Verificación de sesión al cargar =====
window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token || userRole !== 'admin') {
    window.location.href = 'Menu.html';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/auth/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Token inválido');

    const user = await res.json();
    if (user.role !== 'admin') throw new Error('No autorizado');

    // Mostrar nombre
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) userNameElement.textContent = user.name;

    // Inicializar interfaz
    window.adminUI = new AdminUI();

  } catch (err) {
    console.error('Error verificando sesión:', err);
    cerrarSesion();
    return;
  }

  // ===== Menú móvil =====
  const btnMenu = document.getElementById('btn-menu-movil');
  const menuAdmin = document.querySelector('.menu-admin');
  const overlay = document.getElementById('overlay-menu');

  if (!btnMenu || !menuAdmin || !overlay) return;

  function toggleMenuButton() {
    if (window.innerWidth <= 480) {
      btnMenu.style.display = 'block';
    } else {
      btnMenu.style.display = 'none';
      menuAdmin.classList.remove('menu-abierto');
      overlay.classList.remove('visible');
    }
  }

  toggleMenuButton();

  btnMenu.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    menuAdmin.classList.add('menu-abierto');
    overlay.classList.add('visible');
    menuAdmin.offsetHeight; // forzar reflow
  });

  overlay.addEventListener('click', () => {
    menuAdmin.classList.remove('menu-abierto');
    overlay.classList.remove('visible');
  });

  const btnCerrarSesion = document.querySelector('button[onclick="cerrarSesion()"]');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      menuAdmin.classList.remove('menu-abierto');
      overlay.classList.remove('visible');
    });
  }

  const menuButtons = menuAdmin.querySelectorAll('button:not([onclick="cerrarSesion()"])');
  menuButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (window.innerWidth <= 480) {
        menuAdmin.classList.remove('menu-abierto');
        overlay.classList.remove('visible');
      }
    });
  });

  window.addEventListener('resize', toggleMenuButton);
});

// ===== Clase TemplateManager =====
class TemplateManager {
  static getTemplate(id) {
    const template = document.getElementById(id);
    if (!template) {
      console.error(`Template no encontrado: ${id}`);
      return null;
    }
    return template.content.cloneNode(true);
  }

  static renderTemplate(id, data = {}) {
    const template = this.getTemplate(id);
    if (!template) return null;

    Object.keys(data).forEach(key => {
      const elements = template.querySelectorAll(`[data-${key}]`);
      elements.forEach(element => element.textContent = data[key]);
    });

    return template;
  }
}

// ===== Clase AdminUI =====
class AdminUI {
  constructor() {
    this.token = localStorage.getItem('token');
    this.contenedor = document.getElementById('admin-contenido');
    this.setupEventListeners();
    this.cargarEstadisticas();
  }

  setupEventListeners() {
    document.getElementById('btn-usuarios')?.addEventListener('click', () => this.cargarUsuarios());
    document.getElementById('btn-barberos')?.addEventListener('click', () => this.cargarBarberos());
    document.getElementById('btn-servicios')?.addEventListener('click', () => this.cargarServicios());
    document.getElementById('btn-citas')?.addEventListener('click', () => this.cargarCitas());
  }

  async cargarEstadisticas() {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/estadisticas`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const stats = await res.json();
      document.getElementById('total-usuarios').textContent = stats.totalUsuarios || 0;
      document.getElementById('total-barberos').textContent = stats.totalBarberos || 0;
      document.getElementById('total-servicios').textContent = stats.totalServicios || 0;
      document.getElementById('total-citas').textContent = stats.totalCitas || 0;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  // ===== Usuarios =====
  async cargarUsuarios() {
    this.contenedor.innerHTML = '<h3>👥 Usuarios registrados</h3><p>Cargando...</p>';
    try {
      const res = await fetch(`${BASE_URL}/api/admin/usuarios`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const usuarios = await res.json();
      const template = TemplateManager.getTemplate('usuarios-template');
      this.contenedor.innerHTML = '';
      this.contenedor.appendChild(template);
      const listaUsuarios = document.getElementById('lista-usuarios');
      usuarios.forEach(usuario => {
        const itemTemplate = TemplateManager.getTemplate('usuario-item-template');
        itemTemplate.querySelector('.usuario-nombre').textContent = usuario.name;
        itemTemplate.querySelector('.usuario-rol').textContent = usuario.role;
        itemTemplate.querySelector('.usuario-email').textContent = usuario.email;

        itemTemplate.querySelector('[data-action="editar"]')
          .addEventListener('click', () => this.editarUsuario(usuario.id, usuario.name, usuario.email, usuario.role));
        itemTemplate.querySelector('[data-action="eliminar"]')
          .addEventListener('click', () => this.eliminarUsuario(usuario.id));

        listaUsuarios.appendChild(itemTemplate);
      });

      const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
      btnNuevoUsuario?.addEventListener('click', () => this.mostrarFormularioUsuario());

    } catch (err) {
      this.contenedor.innerHTML = '<p>Error al cargar usuarios.</p>';
      console.error('Usuarios error:', err.message);
    }
  }

  // ===== Barberos =====
  async cargarBarberos() {
    this.contenedor.innerHTML = '<h3>💈 Barberos</h3><p>Cargando...</p>';
    try {
      const res = await fetch(`${BASE_URL}/api/barberos`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const barberos = await res.json();
      const template = TemplateManager.getTemplate('barberos-template');
      this.contenedor.innerHTML = '';
      this.contenedor.appendChild(template);
      const listaBarberos = document.getElementById('lista-barberos');
      barberos.forEach(barbero => {
        const itemTemplate = TemplateManager.getTemplate('barbero-item-template');
        itemTemplate.querySelector('.barbero-nombre').textContent = barbero.name;
        itemTemplate.querySelector('.barbero-email').textContent = barbero.email;
        itemTemplate.querySelector('.barbero-especialidad').textContent = barbero.especialidad || 'N/A';

        itemTemplate.querySelector('[data-action="editar"]')
          .addEventListener('click', () => this.editarBarbero(barbero.id, barbero.name, barbero.email, barbero.especialidad));
        itemTemplate.querySelector('[data-action="eliminar"]')
          .addEventListener('click', () => this.eliminarBarbero(barbero.id));

        listaBarberos.appendChild(itemTemplate);
      });

      const btnNuevoBarbero = document.getElementById('btn-nuevo-barbero');
      btnNuevoBarbero?.addEventListener('click', () => this.mostrarFormularioBarbero());

    } catch (err) {
      this.contenedor.innerHTML = '<p>Error al cargar barberos.</p>';
      console.error('Barberos error:', err.message);
    }
  }

  // ===== Servicios =====
  async cargarServicios() {
    this.contenedor.innerHTML = '<h3>Servicios</h3><p>Cargando...</p>';
    try {
      const res = await fetch(`${BASE_URL}/api/servicios`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const servicios = await res.json();
      const template = TemplateManager.getTemplate('servicios-template');
      this.contenedor.innerHTML = '';
      this.contenedor.appendChild(template);
      const listaServicios = document.getElementById('lista-servicios');

      servicios.forEach(servicio => {
        const itemTemplate = TemplateManager.getTemplate('servicio-item-template');
        itemTemplate.querySelector('.servicio-nombre').textContent = servicio.nombre;
        itemTemplate.querySelector('.servicio-precio').textContent = `$${servicio.precio}`;
        itemTemplate.querySelector('.servicio-duracion').textContent = `${servicio.duracion} min`;
        itemTemplate.querySelector('.servicio-descripcion').textContent = servicio.descripcion || 'N/A';

        itemTemplate.querySelector('[data-action="editar"]')
          .addEventListener('click', () => this.editarServicio(servicio.id, servicio.nombre, servicio.descripcion, servicio.precio, servicio.duracion));
        itemTemplate.querySelector('[data-action="eliminar"]')
          .addEventListener('click', () => this.eliminarServicio(servicio.id));

        listaServicios.appendChild(itemTemplate);
      });

      const btnNuevoServicio = document.getElementById('btn-nuevo-servicio');
      btnNuevoServicio?.addEventListener('click', () => this.mostrarFormularioServicio());

    } catch (err) {
      this.contenedor.innerHTML = '<p>Error al cargar servicios.</p>';
      console.error('Servicios error:', err.message);
    }
  }

  // ===== Citas =====
  async cargarCitas() {
    this.contenedor.innerHTML = '<h3>Citas</h3><p>Cargando...</p>';
    try {
      const res = await fetch(`${BASE_URL}/api/citas`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const citas = await res.json();
      const template = TemplateManager.getTemplate('citas-template');
      this.contenedor.innerHTML = '';
      this.contenedor.appendChild(template);
      const listaCitas = document.getElementById('lista-citas');

      citas.forEach(cita => {
        const itemTemplate = TemplateManager.getTemplate('cita-item-template');
        itemTemplate.querySelector('.cita-cliente').textContent = cita.cliente;
        itemTemplate.querySelector('.cita-barbero').textContent = cita.barbero;
        itemTemplate.querySelector('.cita-servicio').textContent = cita.servicio;
        itemTemplate.querySelector('.cita-fecha').textContent = cita.fecha;
        itemTemplate.querySelector('.cita-hora').textContent = cita.hora;

        itemTemplate.querySelector('[data-action="editar"]')
          .addEventListener('click', () => this.editarCita(cita.id, cita));
        itemTemplate.querySelector('[data-action="eliminar"]')
          .addEventListener('click', () => this.eliminarCita(cita.id));

        listaCitas.appendChild(itemTemplate);
      });

    } catch (err) {
      this.contenedor.innerHTML = '<p>Error al cargar citas.</p>';
      console.error('Citas error:', err.message);
    }
  }

  // ===== Métodos de edición y eliminación =====
  editarUsuario(id, name, email, role) { /* lógica edición */ }
  eliminarUsuario(id) { /* lógica eliminación */ }
  mostrarFormularioUsuario() { /* formulario nuevo usuario */ }

  editarBarbero(id, name, email, especialidad) { /* lógica edición */ }
  eliminarBarbero(id) { /* lógica eliminación */ }
  mostrarFormularioBarbero() { /* formulario nuevo barbero */ }

  editarServicio(id, nombre, descripcion, precio, duracion) { /* lógica edición */ }
  eliminarServicio(id) { /* lógica eliminación */ }
  mostrarFormularioServicio() { /* formulario nuevo servicio */ }

  editarCita(id, datos) { /* lógica edición */ }
  eliminarCita(id) { /* lógica eliminación */ }
}
