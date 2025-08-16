// ===== BARBERO DASHBOARD - SISTEMA DE TEMPLATES =====

const token = localStorage.getItem('token');
let barberoId;

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
  if (!token) {
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
    if (user.role !== 'barbero') {
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

    // Inicializar la interfaz del barbero
    window.barberoUI = new BarberoUI();

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

// ===== CLASE PRINCIPAL PARA GESTIONAR LA INTERFAZ =====
class BarberoUI {
  constructor() {
    this.contenido = document.getElementById('barbero-contenido');
    this.templateManager = new TemplateManager();
    this.inicializarEventos();
    this.cargarDatosIniciales();
  }

  // 🔗 Inicializar eventos de navegación
  inicializarEventos() {
    // Navegación entre secciones
    document.getElementById('btn-calendario').addEventListener('click', () => this.mostrarCalendario());
    document.getElementById('btn-proximas').addEventListener('click', () => this.mostrarProximas());
    document.getElementById('btn-pendientes').addEventListener('click', () => this.mostrarPendientes());
    document.getElementById('btn-disponibilidad').addEventListener('click', () => this.mostrarDisponibilidad());
    document.getElementById('btn-historial').addEventListener('click', () => this.mostrarHistorial());
    document.getElementById('btn-clientes').addEventListener('click', () => this.mostrarClientes());
  }

  // 📊 Cargar datos iniciales
  async cargarDatosIniciales() {
    try {
      const res = await fetch('http://localhost:3000/api/auth/perfil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Perfil inválido');
      const user = await res.json();
      
      if (user.role !== 'barbero') {
        alert('Acceso denegado');
        return window.location.href = 'Menu.html';
      }

      barberoId = user.id;
      this.mostrarBienvenida(user);
    } catch (err) {
      console.error('Error de autenticación:', err.message);
      localStorage.removeItem('token');
      window.location.href = 'Menu.html';
    }
  }

  // 👋 Mostrar pantalla de bienvenida
  mostrarBienvenida(user) {
    const template = this.templateManager.getTemplate('template-bienvenida');
    const html = template
      .replace('{{nombre}}', user.name.split(' ')[0])
      .replace('{{nombreCompleto}}', user.name);
    
    this.contenido.innerHTML = html;
    this.cargarEstadisticas();
  }

  // 📈 Cargar estadísticas del dashboard
  async cargarEstadisticas() {
    try {
      // Citas de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const resHoy = await fetch(`http://localhost:3000/api/citas?fecha=${hoy}&barberoId=${barberoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const citasHoy = await resHoy.json();
      document.getElementById('citas-hoy').textContent = citasHoy.length;

      // Citas pendientes
      const resPendientes = await fetch(`http://localhost:3000/api/citas?estado=pendiente&barberoId=${barberoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const citasPendientes = await resPendientes.json();
      document.getElementById('citas-pendientes').textContent = citasPendientes.length;

      // Total de clientes
      const resClientes = await fetch(`http://localhost:3000/api/citas?barberoId=${barberoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const todasCitas = await resClientes.json();
      const clientesUnicos = new Set(todasCitas.map(c => c.cliente?.id).filter(Boolean));
      document.getElementById('total-clientes').textContent = clientesUnicos.size;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  // 📅 Mostrar calendario
  async mostrarCalendario() {
    const template = this.templateManager.getTemplate('template-calendario');
    this.contenido.innerHTML = template;
    await this.renderizarCalendarioBarbero();
  }

  // 🔔 Mostrar próximas citas
  async mostrarProximas() {
    const template = this.templateManager.getTemplate('template-proximas');
    this.contenido.innerHTML = template;
    await this.cargarProximasCitas();
  }

  // 📥 Mostrar citas pendientes
  async mostrarPendientes() {
    const template = this.templateManager.getTemplate('template-pendientes');
    this.contenido.innerHTML = template;
    await this.cargarCitasPendientes();
  }

  // 🗓️ Mostrar disponibilidad
  async mostrarDisponibilidad() {
    const template = this.templateManager.getTemplate('template-disponibilidad');
    this.contenido.innerHTML = template;
    await this.renderizarEditorDisponibilidad();
  }

  // 📜 Mostrar historial
  async mostrarHistorial() {
    const template = this.templateManager.getTemplate('template-historial');
    this.contenido.innerHTML = template;
    await this.cargarHistorial();
  }

  // 🧑‍💼 Mostrar clientes
  async mostrarClientes() {
    const template = this.templateManager.getTemplate('template-clientes');
    this.contenido.innerHTML = template;
    await this.cargarMisClientes();
  }

  // 🔄 Cargar citas pendientes
  async cargarCitasPendientes() {
    const tabla = document.getElementById('tabla-pendientes');
    if (!tabla) {
      console.error('Tabla de citas pendientes no encontrada');
      return;
    }
    
    console.log('Cargando citas pendientes...');
    tabla.innerHTML = '<tr><td colspan="5" class="loading">🔄 Cargando citas pendientes...</td></tr>';

    try {
      const res = await fetch(`http://localhost:3000/api/citas?estado=pendiente&barberoId=${barberoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al cargar citas pendientes');
      const citas = await res.json();
      
      console.log('Citas pendientes cargadas:', citas);
      console.log('URL de la petición:', `http://localhost:3000/api/citas?estado=pendiente&barberoId=${barberoId}`);
      console.log('Token usado:', token ? 'Token presente' : 'Token ausente');

      if (!citas.length) {
        tabla.innerHTML = `
          <tr>
            <td colspan="5" class="no-data" style="text-align: center; padding: 20px; color: #888;">
              🎉 ¡No hay citas pendientes! Todos los clientes han sido atendidos.
            </td>
          </tr>
        `;
        return;
      }

      tabla.innerHTML = ''; // Limpiar mensaje de carga

      citas.forEach(cita => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${cita.cliente?.name || 'Sin nombre'}</td>
          <td>${cita.fecha}</td>
          <td>${cita.hora}</td>
          <td>${cita.servicio?.nombre || 'N/A'}</td>
          <td>
            <button class="btn-success" data-cita-id="${cita.id}" data-accion="confirmada">✅ Aceptar</button>
            <button class="btn-danger" data-cita-id="${cita.id}" data-accion="rechazada">❌ Rechazar</button>
          </td>
        `;
        
        // Agregar event listeners a los botones con logs de depuración
        const btnAceptar = fila.querySelector('.btn-success');
        const btnRechazar = fila.querySelector('.btn-danger');
        
        console.log(`Configurando botones para cita ${cita.id}:`);
        console.log('Botón Aceptar encontrado:', !!btnAceptar);
        console.log('Botón Rechazar encontrado:', !!btnRechazar);
        
        if (btnAceptar) {
          btnAceptar.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Botón Aceptar clickeado para cita ${cita.id}`);
            await this.actualizarEstadoCitaConAnimacion(cita.id, 'confirmada', fila);
          });
        }
        
        if (btnRechazar) {
          btnRechazar.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Botón Rechazar clickeado para cita ${cita.id}`);
                         await this.actualizarEstadoCitaConAnimacion(cita.id, 'cancelada', fila);
          });
        }
        
        tabla.appendChild(fila);
        console.log(`Cita ${cita.id} agregada con botones Aceptar y Rechazar`);
      });
      
      console.log(`Total de citas pendientes cargadas: ${citas.length}`);
    } catch (error) {
      console.error('Error al cargar citas pendientes:', error);
      tabla.innerHTML = `
        <tr>
          <td colspan="5" class="error" style="text-align: center; padding: 20px; color: #dc3545;">
            ⚠️ Error al cargar citas pendientes: ${error.message}
          </td>
        </tr>
      `;
    }
  }

  // 📜 Cargar historial
  async cargarHistorial() {
    const tabla = document.getElementById('tabla-historial');
    if (!tabla) return;
    
    tabla.innerHTML = '';

    try {
      const res = await fetch(`http://localhost:3000/api/citas?estado=completada&barberoId=${barberoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al cargar historial');
      const citas = await res.json();

      if (!citas.length) {
        tabla.innerHTML = `<tr><td colspan="5" class="no-data">No hay citas en el historial</td></tr>`;
        return;
      }

      citas.forEach(cita => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${cita.cliente?.name || 'Sin nombre'}</td>
          <td>${cita.fecha}</td>
          <td>${cita.hora}</td>
          <td>${cita.servicio?.nombre || 'N/A'}</td>
          <td>${cita.nota || '-'}</td>
        `;
        tabla.appendChild(fila);
      });
    } catch (error) {
      console.error(error);
      tabla.innerHTML = `<tr><td colspan="5" class="error">⚠️ Error al cargar historial</td></tr>`;
    }
  }

  // 🧑‍💼 Cargar mis clientes
  async cargarMisClientes() {
    const tabla = document.getElementById('tabla-clientes');
    if (!tabla) return;
    
    tabla.innerHTML = '';

    try {
      const res = await fetch(`http://localhost:3000/api/citas?barberoId=${barberoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al cargar clientes');
      const citas = await res.json();

      // Agrupar por cliente y calcular estadísticas
      const clientesMap = new Map();
      citas.forEach(cita => {
        if (!cita.cliente) return;
        
        if (!clientesMap.has(cita.cliente.id)) {
          clientesMap.set(cita.cliente.id, {
            nombre: cita.cliente.name,
            frecuencia: 0,
            ultimaCita: null
          });
        }
        
        const cliente = clientesMap.get(cita.cliente.id);
        cliente.frecuencia++;
        
        const fechaCita = new Date(cita.fecha);
        if (!cliente.ultimaCita || fechaCita > new Date(cliente.ultimaCita)) {
          cliente.ultimaCita = cita.fecha;
        }
      });

      const clientes = Array.from(clientesMap.values());
      
      if (!clientes.length) {
        tabla.innerHTML = `<tr><td colspan="3" class="no-data">No hay clientes registrados</td></tr>`;
        return;
      }

      clientes.forEach(cliente => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${cliente.nombre}</td>
          <td>${cliente.frecuencia} citas</td>
          <td>${cliente.ultimaCita || 'N/A'}</td>
        `;
        tabla.appendChild(fila);
      });
    } catch (error) {
      console.error(error);
      tabla.innerHTML = `<tr><td colspan="3" class="error">⚠️ Error al cargar clientes</td></tr>`;
    }
  }

  // 🔔 Cargar próximas citas (solo confirmadas y organizadas por bloques)
  async cargarProximasCitas() {
    const panel = document.getElementById('panel-alertas');
    if (!panel) return;
    
    panel.innerHTML = '';

    try {
      const res = await fetch(`http://localhost:3000/api/citas?barberoId=${barberoId}&estado=confirmada`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al cargar próximas citas');
      const citas = await res.json();

      if (!citas.length) {
        panel.innerHTML = '<div class="alert-info">No hay citas confirmadas programadas</div>';
        return;
      }

      // Ordenar citas por hora
      citas.sort((a, b) => a.hora.localeCompare(b.hora));

      // Organizar citas por bloques de tiempo
      const bloques = this.organizarCitasPorBloques(citas);

             // Renderizar cada bloque con encabezado de fecha
       bloques.forEach(bloque => {
          // Crear encabezado de fecha
          const encabezadoFecha = document.createElement('div');
          encabezadoFecha.className = 'bloque-header';
          encabezadoFecha.innerHTML = `
            <div>
              📅 ${bloque.nombre}
            </div>
          `;
          panel.appendChild(encabezadoFecha);

          // Crear contenedor para las citas de esta fecha
          const contenedorCitas = document.createElement('div');
          contenedorCitas.className = 'bloque-citas';

          // Agregar cada cita de esta fecha
          bloque.citas.forEach(cita => {
            const alerta = document.createElement('div');
            alerta.className = 'alert-item';
            alerta.innerHTML = `
              <div class="alert-header">
                <span class="alert-time">🕐 ${cita.hora}</span>
                <span class="alert-client">👤 ${cita.cliente?.name || 'Cliente'}</span>
              </div>
              <div class="alert-service">✂️ ${cita.servicio?.nombre || 'Servicio'}</div>
            `;
           
           contenedorCitas.appendChild(alerta);
         });

         panel.appendChild(contenedorCitas);
       });

    } catch (error) {
      console.error(error);
      panel.innerHTML = '<div class="alert-error">⚠️ Error al cargar próximas citas</div>';
    }
  }

  // 📅 Organizar citas por fechas
  organizarCitasPorBloques(citas) {
    // Agrupar citas por fecha
    const citasPorFecha = {};
    
    citas.forEach(cita => {
      const fecha = cita.fecha;
      if (!citasPorFecha[fecha]) {
        citasPorFecha[fecha] = [];
      }
      citasPorFecha[fecha].push(cita);
    });

    // Convertir a array de bloques y ordenar por fecha
    const bloques = Object.keys(citasPorFecha).map(fecha => {
      // Ordenar citas de cada fecha por hora
      citasPorFecha[fecha].sort((a, b) => a.hora.localeCompare(b.hora));
      
      // Formatear fecha para mostrar - CORREGIDO para evitar problemas de zona horaria
      const [year, month, day] = fecha.split('-').map(Number);
      const fechaObj = new Date(year, month - 1, day); // month - 1 porque los meses van de 0-11
      
      const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const nombreFecha = fechaObj.toLocaleDateString('es-ES', opciones);
      
      return {
        nombre: nombreFecha,
        fecha: fecha,
        citas: citasPorFecha[fecha]
      };
    });

    // Ordenar bloques por fecha
    bloques.sort((a, b) => a.fecha.localeCompare(b.fecha));
    
    return bloques;
  }

  // 🗓️ Renderizar editor de disponibilidad
  async renderizarEditorDisponibilidad() {
    const tabla = document.getElementById('tabla-disponibilidad');
    if (!tabla) return;
    
    tabla.innerHTML = '';

    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    // Cargar disponibilidad actual del barbero
    let disponibilidadActual = [];
    try {
      const res = await fetch(`http://localhost:3000/api/disponibilidad/barbero/${barberoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        disponibilidadActual = await res.json();
      }
    } catch (error) {
      console.error('Error al cargar disponibilidad actual:', error);
    }
    
    dias.forEach((dia, index) => {
      // Buscar configuración actual para este día
      const configActual = disponibilidadActual.find(d => d.dia === index);
      
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${dia}</td>
        <td><input type="time" name="inicio_${index}" value="${configActual ? configActual.horaInicio : '09:00'}"></td>
        <td><input type="time" name="fin_${index}" value="${configActual ? configActual.horaFin : '18:00'}"></td>
        <td><input type="checkbox" name="activo_${index}" ${configActual ? 'checked' : ''}></td>
      `;
      tabla.appendChild(fila);
    });

    // Mostrar mensaje si no hay configuración
    if (disponibilidadActual.length === 0) {
      const mensajeNoConfiguracion = document.createElement('div');
      mensajeNoConfiguracion.className = 'alert-warning';
      mensajeNoConfiguracion.innerHTML = `
        <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffeaa7;">
          <strong>⚠️ No hay disponibilidad configurada</strong><br>
          Por favor, marca los días en los que trabajas y configura tus horarios, luego haz clic en "Guardar Disponibilidad".
        </div>
      `;
      tabla.parentNode.insertBefore(mensajeNoConfiguracion, tabla);
    }

    // Configurar evento del formulario
    const form = document.getElementById('form-disponibilidad');
    if (form) {
      form.addEventListener('submit', (e) => this.guardarDisponibilidad(e));
    }
  }

  // 💾 Guardar disponibilidad
  async guardarDisponibilidad(e) {
    e.preventDefault();
    const feedback = document.getElementById('feedback-disponibilidad');
    
    try {
      const formData = new FormData(e.target);
      const disponibilidad = [];
      
      for (let i = 0; i < 7; i++) {
        const activo = formData.get(`activo_${i}`) === 'on';
        const inicio = formData.get(`inicio_${i}`);
        const fin = formData.get(`fin_${i}`);
        
        // Solo incluir días activos con horarios válidos
        if (activo && inicio && fin && inicio < fin) {
          disponibilidad.push({
            dia: i,
            inicio: inicio,
            fin: fin,
            activo: true
          });
        }
      }

      const res = await fetch(`http://localhost:3000/api/disponibilidad/barbero/${barberoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ disponibilidad })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Error al guardar disponibilidad');
      }
      
      feedback.innerHTML = `
        <div class="success-message" style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; border: 1px solid #c3e6cb;">
          ✅ <strong>Disponibilidad guardada correctamente</strong>
          <br>
          <small>Se configuraron ${result.horariosGuardados || disponibilidad.length} días de trabajo</small>
          <br>
          <small>Los clientes ahora pueden agendar citas en estos horarios.</small>
        </div>
      `;
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        feedback.innerHTML = '';
      }, 5000);
      
    } catch (error) {
      console.error('Error al guardar disponibilidad:', error);
      feedback.innerHTML = `
        <div class="error-message" style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; border: 1px solid #f5c6cb;">
          ❌ <strong>Error al guardar disponibilidad</strong>
          <br>
          ${error.message}
        </div>
      `;
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        feedback.innerHTML = '';
      }, 5000);
    }
  }

  // 📅 Renderizar calendario
  async renderizarCalendarioBarbero() {
    const calendarioEl = document.getElementById('calendario-barbero');
    if (!calendarioEl) return;

    try {
      const res = await fetch(`http://localhost:3000/api/citas?barberoId=${barberoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al cargar citas para calendario');
      const citas = await res.json();

      const eventos = citas.map(cita => ({
        id: cita.id,
        title: `${cita.cliente?.name || 'Cliente'} - ${cita.servicio?.nombre || 'Servicio'}`,
        start: `${cita.fecha}T${cita.hora}`,
        backgroundColor: this.getColorByEstado(cita.estado),
        borderColor: this.getColorByEstado(cita.estado)
      }));

      const calendar = new FullCalendar.Calendar(calendarioEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día'
        },
        events: eventos,
        eventClick: (info) => this.mostrarDetalleCita(info.event)
      });

      calendar.render();
    } catch (error) {
      console.error('Error al renderizar calendario:', error);
      calendarioEl.innerHTML = '<div class="error">⚠️ Error al cargar el calendario</div>';
    }
  }

  // 🎨 Obtener color por estado
  getColorByEstado(estado) {
    switch (estado) {
      case 'pendiente': return '#ffc107';
      case 'confirmada': return '#28a745';
      case 'completada': return '#17a2b8';
      case 'rechazada': return '#dc3545';
      default: return '#6c757d';
    }
  }

  // 👁️ Mostrar detalle de cita
  mostrarDetalleCita(evento) {
    alert(`Cita: ${evento.title}\nFecha: ${evento.start.toLocaleDateString()}\nHora: ${evento.start.toLocaleTimeString()}`);
  }

  // ✅ Actualizar estado de cita (función original para compatibilidad)
  async actualizarEstadoCita(citaId, nuevoEstado) {
    try {
      console.log(`Actualizando cita ${citaId} a estado: ${nuevoEstado}`);
      
      const res = await fetch(`http://localhost:3000/api/citas/${citaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar cita');
      }

      const data = await res.json();
      console.log('Cita actualizada exitosamente:', data);

      // Mostrar mensaje de confirmación
      const mensaje = nuevoEstado === 'confirmada' ? 'Cita aceptada exitosamente' : 'Cita rechazada exitosamente';
      alert(mensaje);

      // Recargar solo las citas pendientes
      await this.cargarCitasPendientes();
      
      // Actualizar estadísticas del dashboard
      await this.cargarEstadisticas();
      
    } catch (error) {
      console.error('Error al actualizar estado de cita:', error);
      alert(`Error al actualizar el estado de la cita: ${error.message}`);
    }
  }

  // ✅ Actualizar estado de cita con animación
  async actualizarEstadoCitaConAnimacion(citaId, nuevoEstado, fila) {
    console.log(`Iniciando actualización de cita ${citaId} a estado: ${nuevoEstado}`);
    try {
      console.log(`Actualizando cita ${citaId} a estado: ${nuevoEstado} con animación`);
      
      // Deshabilitar botones durante la actualización
      const botones = fila.querySelectorAll('button');
      botones.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      });
      
      // Agregar clase de animación de carga
      fila.classList.add('actualizando');
      
      const res = await fetch(`http://localhost:3000/api/citas/${citaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      console.log('=== DIAGNÓSTICO DE ACTUALIZACIÓN ===');
      console.log('URL de actualización:', `http://localhost:3000/api/citas/${citaId}`);
      console.log('Método:', 'PATCH');
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Authorization': token ? 'Bearer [TOKEN_PRESENTE]' : 'Bearer [TOKEN_AUSENTE]'
      });
      console.log('Datos enviados:', { estado: nuevoEstado });
      console.log('Respuesta del servidor:', res.status, res.statusText);
      console.log('Headers de respuesta:', Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Error del servidor con PATCH:', errorData);
        
        // Intentar con PUT como alternativa
        console.log('🔄 Intentando con método PUT...');
        const putExitoso = await this.actualizarCitaConPUT(citaId, nuevoEstado);
        
        if (!putExitoso) {
          throw new Error(errorData.message || 'Error al actualizar cita con PATCH y PUT');
        }
      } else {
        const data = await res.json();
        console.log('✅ Cita actualizada exitosamente con PATCH:', data);
        console.log('Estado actualizado a:', data.estado);
      }
      
      // Verificar que el estado se actualizó correctamente en el servidor
      await this.verificarEstadoCita(citaId);
      
      // Animación de éxito
      fila.classList.add('exito');
      fila.style.transition = 'all 0.5s ease';
      fila.style.transform = 'scale(0.95)';
      fila.style.opacity = '0.7';
      
      // Mostrar mensaje de confirmación
             const mensaje = nuevoEstado === 'confirmada' ? '✅ Cita aceptada exitosamente' : '❌ Cita cancelada exitosamente';
      
      // Crear notificación temporal
      const notificacion = document.createElement('div');
      notificacion.className = 'notificacion-exito';
      notificacion.textContent = mensaje;
      notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${nuevoEstado === 'confirmada' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
      `;
      
      document.body.appendChild(notificacion);
      
      // Animar notificación
      setTimeout(() => {
        notificacion.style.transform = 'translateX(0)';
      }, 100);
      
      // Remover notificación después de 3 segundos
      setTimeout(() => {
        notificacion.style.transform = 'translateX(100%)';
        setTimeout(() => {
          document.body.removeChild(notificacion);
        }, 300);
      }, 3000);
      
             // Animación de desaparición de la fila
       setTimeout(() => {
         fila.style.transform = 'translateX(-100%)';
         fila.style.opacity = '0';
         
         setTimeout(() => {
           fila.remove();
           
           // Verificar si no quedan más citas
           const tabla = document.getElementById('tabla-pendientes');
           const filasRestantes = tabla.querySelectorAll('tr:not(.no-data):not(.error):not(.loading)');
           
           if (filasRestantes.length === 0) {
             tabla.innerHTML = `
               <tr>
                 <td colspan="5" class="no-data" style="text-align: center; padding: 20px; color: #888;">
                   🎉 ¡No hay citas pendientes! Todos los clientes han sido atendidos.
                 </td>
               </tr>
             `;
           }
           
                       // Actualizar estadísticas del dashboard sin recargar toda la lista
            this.actualizarEstadisticasRapidas();
            
            // Recargar citas pendientes después de un delay para verificar
            setTimeout(async () => {
              console.log('🔄 Recargando citas pendientes para verificar...');
              await this.cargarCitasPendientes();
            }, 2000);
          }, 500);
        }, 1000);
      
    } catch (error) {
      console.error('Error al actualizar estado de cita:', error);
      
      // Restaurar botones en caso de error
      const botones = fila.querySelectorAll('button');
      botones.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      });
      
      fila.classList.remove('actualizando');
      
      // Mostrar notificación de error
      const notificacionError = document.createElement('div');
      notificacionError.className = 'notificacion-error';
      notificacionError.textContent = `❌ Error: ${error.message}`;
      notificacionError.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
      `;
      
      document.body.appendChild(notificacionError);
      
      setTimeout(() => {
        notificacionError.style.transform = 'translateX(0)';
      }, 100);
      
      setTimeout(() => {
        notificacionError.style.transform = 'translateX(100%)';
        setTimeout(() => {
          document.body.removeChild(notificacionError);
        }, 300);
      }, 4000);
    }
  }

  // 🔍 Filtrar historial
  filtrarHistorial() {
    const fechaInicio = document.getElementById('fecha-inicio').value;
    const fechaFin = document.getElementById('fecha-fin').value;
    
    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona ambas fechas');
      return;
    }
    
    // Aquí se implementaría la lógica de filtrado
    console.log('Filtrando historial desde', fechaInicio, 'hasta', fechaFin);
  }

  // 📊 Actualizar estadísticas rápidamente (sin recargar toda la lista)
  async actualizarEstadisticasRapidas() {
    try {
      // Actualizar solo el contador de citas pendientes
      const resPendientes = await fetch(`http://localhost:3000/api/citas?estado=pendiente&barberoId=${barberoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const citasPendientes = await resPendientes.json();
      
      const elementoPendientes = document.getElementById('citas-pendientes');
      if (elementoPendientes) {
        elementoPendientes.textContent = citasPendientes.length;
      }
      
      console.log('Estadísticas actualizadas rápidamente');
    } catch (error) {
      console.error('Error al actualizar estadísticas rápidas:', error);
    }
  }

  // 🧪 Función de prueba para actualizar cita con método PUT
  async actualizarCitaConPUT(citaId, nuevoEstado) {
    try {
      console.log(`🧪 Probando actualización con PUT para cita ${citaId}`);
      
      const res = await fetch(`http://localhost:3000/api/citas/${citaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      console.log('Respuesta PUT:', res.status, res.statusText);
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Actualización PUT exitosa:', data);
        return true;
      } else {
        const errorData = await res.json();
        console.log('❌ Error en PUT:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error en PUT:', error);
      return false;
    }
  }

  // 🔍 Verificar el estado de una cita específica en el servidor
  async verificarEstadoCita(citaId) {
    try {
      console.log(`=== VERIFICACIÓN DE ESTADO DE CITA ${citaId} ===`);
      
      // 1. Verificar el estado actual de la cita
      const res = await fetch(`http://localhost:3000/api/citas/${citaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        console.error('❌ Error al verificar cita:', res.status, res.statusText);
        return;
      }
      
      const cita = await res.json();
      console.log('✅ Estado actual de la cita en el servidor:', cita.estado);
      console.log('📋 Datos completos de la cita:', cita);
      
      // 2. Verificar si aparece en las citas pendientes
      const resPendientes = await fetch(`http://localhost:3000/api/citas?estado=pendiente&barberoId=${barberoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (resPendientes.ok) {
        const citasPendientes = await resPendientes.json();
        const citaEnPendientes = citasPendientes.find(c => c.id === citaId);
        console.log('🔍 ¿La cita aparece en pendientes?', !!citaEnPendientes);
        if (citaEnPendientes) {
          console.log('⚠️ Cita encontrada en pendientes con estado:', citaEnPendientes.estado);
          console.log('⚠️ Esto indica un problema en el servidor');
        } else {
          console.log('✅ La cita NO aparece en pendientes (correcto)');
        }
      }
      
      // 3. Verificar todas las citas del barbero para debug
      const resTodas = await fetch(`http://localhost:3000/api/citas?barberoId=${barberoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (resTodas.ok) {
        const todasCitas = await resTodas.json();
        const citaEnTodas = todasCitas.find(c => c.id === citaId);
        if (citaEnTodas) {
          console.log('📊 Cita encontrada en todas las citas con estado:', citaEnTodas.estado);
        }
      }
      
    } catch (error) {
      console.error('❌ Error al verificar estado de cita:', error);
    }
  }
}

// ===== CLASE PARA GESTIONAR TEMPLATES =====
class TemplateManager {
  getTemplate(templateId) {
    const template = document.getElementById(templateId);
    if (!template) {
      console.error(`Template no encontrado: ${templateId}`);
      return '<div class="error">Error: Template no encontrado</div>';
    }
    return template.innerHTML;
  }
}