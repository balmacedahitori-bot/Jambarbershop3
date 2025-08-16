// Escape simple HTML entities para evitar romper el HTML en botones con datos dinámicos
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Funciones globales
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  window.location.href = 'Menu.html';
}

// Verificación de sesión al cargar
window.addEventListener('DOMContentLoaded', async () => {
  // ===== VERIFICACIÓN DE SESIÓN =====
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token || userRole !== 'admin') {
    window.location.href = 'Menu.html';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/auth/perfil', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      window.location.href = 'Menu.html';
      return;
    }

    const user = await res.json();
    if (user.role !== 'admin') {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      window.location.href = 'Menu.html';
      return;
    }

    // Actualizar nombre del usuario en la interfaz
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = user.name;
    }

    // Inicializar la interfaz del admin
    window.adminUI = new AdminUI();

  } catch (err) {
    console.error('Error verificando sesión:', err);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'Menu.html';
    return;
  }

  // ===== FUNCIONALIDAD DEL MENÚ MÓVIL =====
  const btnMenu = document.getElementById('btn-menu-movil');
  const menuAdmin = document.querySelector('.menu-admin');
  const overlay = document.getElementById('overlay-menu');
  
  console.log('Inicializando menú móvil...');
  console.log('Botón encontrado:', !!btnMenu);
  console.log('Menú encontrado:', !!menuAdmin);
  console.log('Overlay encontrado:', !!overlay);
  
  // Verificar que los elementos existan
  if (!btnMenu || !menuAdmin || !overlay) {
    console.error('Elementos del menú móvil no encontrados');
    return;
  }
  
  // Función para mostrar/ocultar botón según tamaño de pantalla
  function toggleMenuButton() {
    if (window.innerWidth <= 480) {
      btnMenu.style.display = 'block';
      console.log('Botón mostrado en móvil');
    } else {
      btnMenu.style.display = 'none';
      menuAdmin.classList.remove('menu-abierto');
      overlay.classList.remove('visible');
      console.log('Botón oculto en desktop');
    }
  }
  
  // Ejecutar al cargar
  toggleMenuButton();
  
  // Abrir menú
  btnMenu.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Botón menú clickeado');
    console.log('Estado del menú antes:', menuAdmin.classList.contains('menu-abierto'));
    console.log('Posición antes:', window.getComputedStyle(menuAdmin).left);
    
    menuAdmin.classList.add('menu-abierto');
    overlay.classList.add('visible');
    
    console.log('Estado del menú después:', menuAdmin.classList.contains('menu-abierto'));
    console.log('Clases del menú:', menuAdmin.className);
    console.log('Posición después:', window.getComputedStyle(menuAdmin).left);
    
    // Forzar reflow para asegurar que la transición funcione
    menuAdmin.offsetHeight;
  });
  
  // Cerrar menú con overlay
  overlay.addEventListener('click', function() {
    console.log('Cerrando menú con overlay');
    menuAdmin.classList.remove('menu-abierto');
    overlay.classList.remove('visible');
  });
  
  // Cerrar menú con botón de cerrar sesión
  const btnCerrarSesion = document.querySelector('button[onclick="cerrarSesion()"]');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function() {
      menuAdmin.classList.remove('menu-abierto');
      overlay.classList.remove('visible');
    });
  }
  
  // Cerrar menú automáticamente al hacer clic en cualquier botón del menú
  const menuButtons = menuAdmin.querySelectorAll('button:not([onclick="cerrarSesion()"])');
  menuButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (window.innerWidth <= 480) {
        menuAdmin.classList.remove('menu-abierto');
        overlay.classList.remove('visible');
      }
    });
  });
  
  // Responsive: mostrar/ocultar botón según tamaño de pantalla
  window.addEventListener('resize', toggleMenuButton);
  
  // Debug: verificar que el botón esté visible en móviles
  console.log('Menú móvil inicializado');
  console.log('Ancho de ventana:', window.innerWidth);
  console.log('Botón visible:', btnMenu.style.display);
  
  // Verificación adicional después de un breve delay
  setTimeout(() => {
    console.log('Verificación post-inicialización:');
    console.log('Menú encontrado:', !!menuAdmin);
    console.log('Overlay encontrado:', !!overlay);
    console.log('Botón encontrado:', !!btnMenu);
    console.log('Posición inicial del menú:', window.getComputedStyle(menuAdmin).left);
    console.log('Z-index del menú:', window.getComputedStyle(menuAdmin).zIndex);
  }, 100);
});

// Clase para manejar templates HTML
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

    // Llenar datos en el template
    Object.keys(data).forEach(key => {
      const elements = template.querySelectorAll(`[data-${key}]`);
      elements.forEach(element => {
        element.textContent = data[key];
      });
    });

    return template;
  }
}

// Clase para manejar la interfaz de usuario
class AdminUI {
  constructor() {
    this.token = localStorage.getItem('token');
    this.contenedor = document.getElementById('admin-contenido');
    this.setupEventListeners();
    this.cargarEstadisticas();
  }

  setupEventListeners() {
    // Navegación entre secciones
    document.getElementById('btn-usuarios').addEventListener('click', () => this.cargarUsuarios());
    document.getElementById('btn-barberos').addEventListener('click', () => this.cargarBarberos());
    document.getElementById('btn-servicios').addEventListener('click', () => this.cargarServicios());
    document.getElementById('btn-citas').addEventListener('click', () => this.cargarCitas());
  }

  async cargarEstadisticas() {
    try {
      // Cargar estadísticas del dashboard
      const res = await fetch('http://localhost:3000/api/admin/estadisticas', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const stats = await res.json();

      // Actualizar elementos del dashboard
      document.getElementById('total-usuarios').textContent = stats.totalUsuarios || 0;
      document.getElementById('total-barberos').textContent = stats.totalBarberos || 0;
      document.getElementById('total-servicios').textContent = stats.totalServicios || 0;
      document.getElementById('total-citas').textContent = stats.totalCitas || 0;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  async cargarUsuarios() {
    this.contenedor.innerHTML = '<h3>👥 Usuarios registrados</h3><p>Cargando...</p>';
    
    try {
      const res = await fetch('http://localhost:3000/api/admin/usuarios', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const usuarios = await res.json();

      // Renderizar template de usuarios
      const template = TemplateManager.getTemplate('usuarios-template');
      this.contenedor.innerHTML = '';
      this.contenedor.appendChild(template);

      // Renderizar cada usuario
      const listaUsuarios = document.getElementById('lista-usuarios');
      usuarios.forEach(usuario => {
        const itemTemplate = TemplateManager.getTemplate('usuario-item-template');
        
        itemTemplate.querySelector('.usuario-nombre').textContent = usuario.name;
        itemTemplate.querySelector('.usuario-rol').textContent = usuario.role;
        itemTemplate.querySelector('.usuario-email').textContent = usuario.email;
        
        // Configurar botones
        const btnEditar = itemTemplate.querySelector('[data-action="editar"]');
        const btnEliminar = itemTemplate.querySelector('[data-action="eliminar"]');
        
        btnEditar.addEventListener('click', () => this.editarUsuario(usuario.id, usuario.name, usuario.email, usuario.role));
        btnEliminar.addEventListener('click', () => this.eliminarUsuario(usuario.id));
        
        listaUsuarios.appendChild(itemTemplate);
      });

      // Configurar botón nuevo usuario
      const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
      if (btnNuevoUsuario) {
        btnNuevoUsuario.addEventListener('click', () => this.mostrarFormularioUsuario());
      }

    } catch (err) {
      this.contenedor.innerHTML = '<p>Error al cargar usuarios.</p>';
      console.error('Usuarios error:', err.message);
    }
  }

  async cargarBarberos() {
    this.contenedor.innerHTML = '<h3>💈 Barberos</h3><p>Cargando...</p>';
    
    try {
      const res = await fetch('http://localhost:3000/api/barberos', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const barberos = await res.json();

      // Renderizar template de barberos
      const template = TemplateManager.getTemplate('barberos-template');
      this.contenedor.innerHTML = '';
      this.contenedor.appendChild(template);

      // Renderizar cada barbero
      const listaBarberos = document.getElementById('lista-barberos');
      barberos.forEach(barbero => {
        const itemTemplate = TemplateManager.getTemplate('barbero-item-template');
        
        itemTemplate.querySelector('.barbero-nombre').textContent = barbero.name;
        itemTemplate.querySelector('.barbero-email').textContent = barbero.email;
        itemTemplate.querySelector('.barbero-especialidad').textContent = barbero.especialidad || 'N/A';
        
        // Configurar botones
        const btnEditar = itemTemplate.querySelector('[data-action="editar"]');
        const btnEliminar = itemTemplate.querySelector('[data-action="eliminar"]');
        
        btnEditar.addEventListener('click', () => this.editarBarbero(barbero.id, barbero.name, barbero.email, barbero.especialidad));
        btnEliminar.addEventListener('click', () => this.eliminarBarbero(barbero.id));
        
        listaBarberos.appendChild(itemTemplate);
      });

      // Configurar botón nuevo barbero
      const btnNuevoBarbero = document.getElementById('btn-nuevo-barbero');
      if (btnNuevoBarbero) {
        btnNuevoBarbero.addEventListener('click', () => this.mostrarFormularioBarbero());
      }

    } catch (err) {
      this.contenedor.innerHTML = '<p>Error al cargar barberos.</p>';
      console.error('Barberos error:', err.message);
    }
  }

  async cargarServicios() {
    this.contenedor.innerHTML = '<h3> Servicios</h3><p>Cargando...</p>';
    
    try {
      const res = await fetch('http://localhost:3000/api/servicios', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const servicios = await res.json();

      // Renderizar template de servicios
      const template = TemplateManager.getTemplate('servicios-template');
      this.contenedor.innerHTML = '';
      this.contenedor.appendChild(template);

      // Renderizar cada servicio
      const listaServicios = document.getElementById('lista-servicios');
      servicios.forEach(servicio => {
        const itemTemplate = TemplateManager.getTemplate('servicio-item-template');
        
        itemTemplate.querySelector('.servicio-nombre').textContent = servicio.nombre;
        itemTemplate.querySelector('.servicio-precio').textContent = `$${servicio.precio}`;
        itemTemplate.querySelector('.servicio-duracion').textContent = `${servicio.duracion} min`;
        itemTemplate.querySelector('.servicio-descripcion').textContent = servicio.descripcion || 'N/A';
        
        // Configurar botones
        const btnEditar = itemTemplate.querySelector('[data-action="editar"]');
        const btnEliminar = itemTemplate.querySelector('[data-action="eliminar"]');
        
        btnEditar.addEventListener('click', () => this.editarServicio(servicio.id, servicio.nombre, servicio.descripcion, servicio.precio, servicio.duracion));
        btnEliminar.addEventListener('click', () => this.eliminarServicio(servicio.id));
        
        listaServicios.appendChild(itemTemplate);
      });

      // Configurar botón nuevo servicio
      const btnNuevoServicio = document.getElementById('btn-nuevo-servicio');
      if (btnNuevoServicio) {
        btnNuevoServicio.addEventListener('click', () => this.mostrarFormularioServicio());
      }

    } catch (err) {
      this.contenedor.innerHTML = '<p>Error al cargar servicios.</p>';
      console.error('Servicios error:', err.message);
    }
  }

  async cargarCitas() {
    this.contenedor.innerHTML = '<h3>📋 Citas</h3><p>Cargando...</p>';
    
    
    try {
      const res = await fetch('http://localhost:3000/api/citas', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      
      const citas = await res.json();
      console.log('Citas cargadas:', citas);

      // Renderizar template de citas
      const template = TemplateManager.getTemplate('citas-template');
      if (!template) {
        throw new Error('Template de citas no encontrado');
      }
      
      this.contenedor.innerHTML = '';
      this.contenedor.appendChild(template);

      // Renderizar cada cita
      const listaCitas = document.getElementById('lista-citas');
      if (!listaCitas) {
        throw new Error('Elemento lista-citas no encontrado');
      }

      if (!citas.length) {
        listaCitas.innerHTML = '<p>No hay citas programadas</p>';
        return;
      }

      citas.forEach(cita => {
        const itemTemplate = TemplateManager.getTemplate('cita-item-template');
        if (!itemTemplate) {
          console.error('Template de item de cita no encontrado');
          return;
        }
        
        // Llenar datos de la cita
        const fechaHora = itemTemplate.querySelector('.cita-fecha-hora');
        const cliente = itemTemplate.querySelector('.cita-cliente');
        const barbero = itemTemplate.querySelector('.cita-barbero');
        const servicio = itemTemplate.querySelector('.cita-servicio');
        const estado = itemTemplate.querySelector('.cita-estado');
        
        if (fechaHora) fechaHora.textContent = `${cita.fecha} - ${cita.hora}`;
        if (cliente) cliente.textContent = cita.cliente?.name || 'N/A';
        if (barbero) barbero.textContent = cita.barbero?.name || 'N/A';
        if (servicio) servicio.textContent = cita.servicio?.nombre || 'N/A';
        if (estado) estado.textContent = cita.estado || 'Pendiente';
        
        listaCitas.appendChild(itemTemplate);
      });

    } catch (err) {
      console.error('Error al cargar citas:', err);
      this.contenedor.innerHTML = `
        <h3>📋 Citas</h3>
        <p>Error al cargar citas: ${err.message}</p>
        <button onclick="adminUI.cargarCitas()">Reintentar</button>
      `;
    }
  }

  // Métodos para formularios y acciones
  mostrarFormularioUsuario() {
    this.contenedor.innerHTML = `
      <h3>👤 Nuevo Usuario</h3>
      <form id="form-usuario">
        <label for="nombre">Nombre</label>
        <input type="text" id="nombre" name="nombre" required>
        
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
        
        <label for="rol">Rol</label>
        <select id="rol" name="rol" required>
          <option value="">Seleccionar rol</option>
          <option value="cliente">Cliente</option>
          <option value="barbero">Barbero</option>
          <option value="admin">Admin</option>
        </select>
        
        <label for="password">Contraseña</label>
        <input type="password" id="password" name="password" required>
        
        <div class="form-buttons">
          <button type="submit">Crear Usuario</button>
          <button type="button" onclick="adminUI.cargarUsuarios()">Cancelar</button>
        </div>
      </form>
    `;

    document.getElementById('form-usuario').addEventListener('submit', (e) => this.crearUsuario(e));
  }

  mostrarFormularioBarbero() {
    this.contenedor.innerHTML = `
      <h3>💈 Nuevo Barbero</h3>
      <form id="form-barbero">
        <label for="nombre">Nombre</label>
        <input type="text" id="nombre" name="nombre" required>
        
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
        
        <label for="especialidad">Especialidad</label>
        <input type="text" id="especialidad" name="especialidad">
        
        <label for="password">Contraseña</label>
        <input type="password" id="password" name="password" required>
        
        <div class="form-buttons">
          <button type="submit">Crear Barbero</button>
          <button type="button" onclick="adminUI.cargarBarberos()">Cancelar</button>
        </div>
      </form>
    `;

    document.getElementById('form-barbero').addEventListener('submit', (e) => this.crearBarbero(e));
  }

  mostrarFormularioServicio() {
    this.contenedor.innerHTML = `
      <h3>📋 Nuevo Servicio</h3>
      <form id="form-servicio">
        <label for="nombre">Nombre del servicio</label>
        <input type="text" id="nombre" name="nombre" required>
        
        <label for="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows="3" placeholder="Describe el servicio..."></textarea>
        
        <label for="precio">Precio</label>
        <input type="number" id="precio" name="precio" step="0.01" required>
        
        <label for="duracion">Duración (minutos)</label>
        <input type="number" id="duracion" name="duracion" required>
        
        <div class="form-buttons">
          <button type="submit">Crear Servicio</button>
          <button type="button" onclick="adminUI.cargarServicios()">Cancelar</button>
        </div>
      </form>
    `;

    document.getElementById('form-servicio').addEventListener('submit', (e) => this.crearServicio(e));
  }

  async crearUsuario(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const res = await fetch('http://localhost:3000/api/admin/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify({
          name: formData.get('nombre'),
          email: formData.get('email'),
          role: formData.get('rol'),
          password: formData.get('password')
        })
      });

      if (res.ok) {
        alert('Usuario creado exitosamente');
        this.cargarUsuarios();
      } else {
        alert('Error al crear usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear usuario');
    }
  }

  async crearBarbero(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const res = await fetch('http://localhost:3000/api/barberos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify({
          name: formData.get('nombre'),
          email: formData.get('email'),
          especialidad: formData.get('especialidad'),
          password: formData.get('password')
        })
      });

      if (res.ok) {
        alert('Barbero creado exitosamente');
        this.cargarBarberos();
      } else {
        alert('Error al crear barbero');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear barbero');
    }
  }

  async crearServicio(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const res = await fetch('http://localhost:3000/api/servicios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify({
          nombre: formData.get('nombre'),
          descripcion: formData.get('descripcion'),
          precio: parseFloat(formData.get('precio')),
          duracion: parseInt(formData.get('duracion'))
        })
      });

      if (res.ok) {
        alert('Servicio creado exitosamente');
        this.cargarServicios();
      } else {
        alert('Error al crear servicio');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear servicio');
    }
  }

  // Métodos de edición y eliminación
  editarUsuario(id, name, email, role) {
    this.contenedor.innerHTML = `
      <h3>✏️ Editar Usuario</h3>
      <form id="form-editar-usuario">
        <label for="nombre">Nombre</label>
        <input type="text" id="nombre" name="nombre" value="${name}" required>
        
        <label for="email">Email</label>
        <input type="email" id="email" name="email" value="${email}" required>
        
        <label for="rol">Rol</label>
        <select id="rol" name="rol" required>
          <option value="cliente" ${role === 'cliente' ? 'selected' : ''}>Cliente</option>
          <option value="barbero" ${role === 'barbero' ? 'selected' : ''}>Barbero</option>
          <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
        
        <div class="form-buttons">
          <button type="submit">Actualizar</button>
          <button type="button" onclick="adminUI.cargarUsuarios()">Cancelar</button>
        </div>
      </form>
    `;

    document.getElementById('form-editar-usuario').addEventListener('submit', (e) => this.actualizarUsuario(e, id));
  }

  editarBarbero(id, name, email, especialidad) {
    this.contenedor.innerHTML = `
      <h3>✏️ Editar Barbero</h3>
      <form id="form-editar-barbero">
        <label for="nombre">Nombre</label>
        <input type="text" id="nombre" name="nombre" value="${name}" required>
        
        <label for="email">Email</label>
        <input type="email" id="email" name="email" value="${email}" required>
        
        <label for="especialidad">Especialidad</label>
        <input type="text" id="especialidad" name="especialidad" value="${especialidad || ''}">
        
        <div class="form-buttons">
          <button type="submit">Actualizar</button>
          <button type="button" onclick="adminUI.cargarBarberos()">Cancelar</button>
        </div>
      </form>
    `;

    document.getElementById('form-editar-barbero').addEventListener('submit', (e) => this.actualizarBarbero(e, id));
  }

  editarServicio(id, nombre, descripcion, precio, duracion) {
    this.contenedor.innerHTML = `
      <h3>✏️ Editar Servicio</h3>
      <form id="form-editar-servicio">
        <label for="nombre">Nombre</label>
        <input type="text" id="nombre" name="nombre" value="${nombre}" required>
        
        <label for="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows="3" placeholder="Describe el servicio...">${descripcion || ''}</textarea>
        
        <label for="precio">Precio</label>
        <input type="number" id="precio" name="precio" value="${precio}" step="0.01" required>
        
        <label for="duracion">Duración (minutos)</label>
        <input type="number" id="duracion" name="duracion" value="${duracion}" required>
        
        <div class="form-buttons">
          <button type="submit">Actualizar</button>
          <button type="button" onclick="adminUI.cargarServicios()">Cancelar</button>
        </div>
      </form>
    `;

    document.getElementById('form-editar-servicio').addEventListener('submit', (e) => this.actualizarServicio(e, id));
  }

  async actualizarUsuario(e, id) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const res = await fetch(`http://localhost:3000/api/admin/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify({
          name: formData.get('nombre'),
          email: formData.get('email'),
          role: formData.get('rol')
        })
      });

      if (res.ok) {
        alert('Usuario actualizado exitosamente');
        this.cargarUsuarios();
      } else {
        alert('Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar usuario');
    }
  }

  async actualizarBarbero(e, id) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const res = await fetch(`http://localhost:3000/api/barberos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify({
          name: formData.get('nombre'),
          email: formData.get('email'),
          especialidad: formData.get('especialidad')
        })
      });

      if (res.ok) {
        alert('Barbero actualizado exitosamente');
        this.cargarBarberos();
      } else {
        alert('Error al actualizar barbero');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar barbero');
    }
  }

  async actualizarServicio(e, id) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const res = await fetch(`http://localhost:3000/api/servicios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify({
          nombre: formData.get('nombre'),
          descripcion: formData.get('descripcion'),
          precio: parseFloat(formData.get('precio')),
          duracion: parseInt(formData.get('duracion'))
        })
      });

      if (res.ok) {
        alert('Servicio actualizado exitosamente');
        this.cargarServicios();
      } else {
        alert('Error al actualizar servicio');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar servicio');
    }
  }

  async eliminarUsuario(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const res = await fetch(`http://localhost:3000/api/admin/usuarios/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${this.token}` }
        });

        if (res.ok) {
          alert('Usuario eliminado exitosamente');
          this.cargarUsuarios();
        } else {
          alert('Error al eliminar usuario');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar usuario');
      }
    }
  }

  async eliminarBarbero(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este barbero?')) {
      try {
        const res = await fetch(`http://localhost:3000/api/barberos/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${this.token}` }
        });

        if (res.ok) {
          alert('Barbero eliminado exitosamente');
          this.cargarBarberos();
        } else {
          alert('Error al eliminar barbero');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar barbero');
      }
    }
  }

  async eliminarServicio(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      try {
        const res = await fetch(`http://localhost:3000/api/servicios/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${this.token}` }
        });

        if (res.ok) {
          alert('Servicio eliminado exitosamente');
          this.cargarServicios();
        } else {
          alert('Error al eliminar servicio');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar servicio');
      }
    }
  }

  async eliminarCita(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        const res = await fetch(`http://localhost:3000/api/citas/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${this.token}` }
        });

        if (res.ok) {
          alert('Cita eliminada exitosamente');
          this.cargarCitas();
        } else {
          alert('Error al eliminar cita');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar cita');
      }
    }
  }

  editarCita(id) {
    // Implementar edición de cita
    alert('Funcionalidad de edición de cita en desarrollo');
  }
}

