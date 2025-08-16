// Funciones globales para controlar el modal desde cualquier sección
function abrirModal() {
  const modal = document.getElementById('modal-cita');
  if (modal) modal.classList.remove('hidden');
}
function cerrarModal() {
  const modal = document.getElementById('modal-cita');
  if (modal) modal.classList.add('hidden');
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  window.location.href = 'Menu.html';
}

window.addEventListener('DOMContentLoaded', async () => {
  // ===== VERIFICACIÓN DE SESIÓN =====
  const token = localStorage.getItem('token');
  if (!token) return (window.location.href = 'Menu.html');

  try {
    const res = await fetch('http://localhost:3000/api/auth/perfil', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      localStorage.removeItem('token');
      return (window.location.href = 'Menu.html');
    }

    const user = await res.json();
    // Pintar vista inicial tipo dashboard en contenedor de cliente
    const cont = document.getElementById('cliente-contenido');
    if (cont) {
      cont.innerHTML = `
        <h3><i class="fa-solid fa-user"></i> Hola, ${escapeHtml(user.name.split(' ')[0])} Bienvenido</h3>
        <p>Informacion de tu cuenta.</p>
        <ul>
          <li>Nombre: ${escapeHtml(user.name)}</li>
          <li>Correo: ${escapeHtml(user.email)}</li>
          <li>Rol: ${escapeHtml(user.role)}</li>
        </ul>
      `;
    }
  } catch (err) {
    localStorage.removeItem('token');
    window.location.href = 'Menu.html';
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

  // ===== MODAL (abrir/cerrar robusto) =====
  const btnAgendar = document.getElementById('btn-agendar');
  const modal = document.getElementById('modal-cita');
  const cerrar = document.querySelector('.cerrar');

  if (btnAgendar) btnAgendar.addEventListener('click', abrirModal);
  if (cerrar) cerrar.addEventListener('click', cerrarModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
  });

  // ===== SERVICIOS =====
  const servicioSelect = document.getElementById('servicio');
  try {
    const serviciosRes = await fetch('http://localhost:3000/api/servicios/public');
    const servicios = await serviciosRes.json();

    servicios.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.nombre;
      servicioSelect.appendChild(opt);
    });
  } catch (err) {
    servicioSelect.innerHTML = `<option disabled>No disponible</option>`;
  }

  // ===== BARBEROS =====
  const barberoSelect = document.getElementById('barbero');
  try {
    const barberosRes = await fetch('http://localhost:3000/api/barberos');
    const barberos = await barberosRes.json();

    barberos.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.name;
      barberoSelect.appendChild(opt);
    });
  } catch (err) {
    barberoSelect.innerHTML = `<option disabled>No disponible</option>`;
  }

  // ===== HORARIOS DE ATENCIÓN =====
  
const horaSelect = document.getElementById('hora');
horaSelect.innerHTML = '';
for (let h = 7; h <= 19; h++) {   // <-- antes era 8 a 17
  const hora24 = `${h.toString().padStart(2, '0')}:00`;
  const periodo = h < 12 ? 'AM' : 'PM';
  const hora12 = `${((h % 12) || 12)}:00 ${periodo}`;

  const opt = document.createElement('option');
  opt.value = hora24;
  opt.textContent = hora12;
  horaSelect.appendChild(opt);
}

  // 📅 Confirmar cita
  const formCita = document.getElementById('form-cita');
  if (formCita) formCita.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const servicioId = document.getElementById('servicio').value;
    const barberoId = document.getElementById('barbero').value;

    if (!fecha || !hora || !servicioId || !barberoId) {
      return mostrarMensaje('⛔ Todos los campos son obligatorios', 'error');
    }

    // 🚀 Enviar cita con validaciones del servidor
    try {
      const res = await fetch('http://localhost:3000/api/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fecha, hora, servicioId, barberoId })
      });

      const result = await res.json();
      
      if (!res.ok) {
        return mostrarMensaje(`❌ ${result.message || 'Error al agendar cita'}`, 'error');
      }

      mostrarMensaje('✅ Cita agendada correctamente', 'success');
      modal.classList.add('hidden');
      
      // Limpiar formulario
      formCita.reset();
      
      // Recargar calendario si está visible
      const calendarEl = document.getElementById('calendar');
      if (calendarEl && calendarEl.children.length > 0) {
        // Si hay un calendario renderizado, recargarlo
        const calendar = FullCalendar.Calendar.getInstances()[0];
        if (calendar) {
          calendar.refetchEvents();
        }
      }
      
    } catch (err) {
      console.error('Error al conectar con el servidor:', err);
      mostrarMensaje('❌ Error de conexión con el servidor', 'error');
    }
  });

  // Configurar fecha mínima (hoy) y eventos
  if (fechaInput) {
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;
    fechaInput.addEventListener('change', validarFechaYBarbero);
  }
  
  if (barberoSelect) {
    barberoSelect.addEventListener('change', validarFechaYBarbero);
  }
// 🎯 Función para validar fecha y barbero antes de cargar horarios
function validarFechaYBarbero() {
  const fecha = fechaInput.value;
  const barberoId = barberoSelect.value;

  if (!fecha || !barberoId) {
    return;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaSeleccionada = new Date(fecha);
  fechaSeleccionada.setHours(0, 0, 0, 0);

  // 🚫 No permitir domingos
  if (fechaSeleccionada.getDay() === 0) {
    mostrarMensaje('❌ El barbero no trabaja los domingos', 'error');
    fechaInput.value = ''; // limpiar selección
    return;
  }

  // 🚫 No permitir fechas pasadas
  if (fechaSeleccionada < hoy) {
    mostrarMensaje('❌ No puedes seleccionar fechas pasadas', 'error');
    fechaInput.value = hoy.toISOString().split('T')[0];
    return;
  }

  // 🚫 Validar que si es hoy no sea tarde
  if (fechaSeleccionada.getTime() === hoy.getTime()) {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    
    if (horaActual >= 19) { // <-- ajustado al horario de 7 AM - 7 PM
      mostrarMensaje('❌ Ya es muy tarde para agendar citas hoy. Selecciona otro día.', 'error');
      return;
    }
  }

  // ✅ Cargar horarios disponibles
  cargarHorariosDisponibles();
}

  

  async function cargarHorariosDisponibles() {
    const fecha = fechaInput.value;
    const barberoId = barberoSelect.value;

    if (!fecha || !barberoId) {
      return;
    }

    try {
      // Mostrar loading en el select de horas
      horaSelect.innerHTML = '<option value="">🔄 Cargando horarios...</option>';
      horaSelect.disabled = true;

      const res = await fetch(`http://localhost:3000/api/disponibilidad/barbero/${barberoId}/fecha/${fecha}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json();

      if (!res.ok) {
        horaSelect.innerHTML = '<option value="">❌ No disponible</option>';
        horaSelect.disabled = true;
        
        // Mostrar mensaje específico según el error
        if (result.message) {
          mostrarMensaje(`❌ ${result.message}`, 'error');
        }
        return;
      }

      // Limpiar y llenar con horarios disponibles
      horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
      
      if (result.horariosDisponibles && result.horariosDisponibles.length > 0) {
        result.horariosDisponibles.forEach(horario => {
          const [hora24] = horario.split(':');
          const horaNum = parseInt(hora24);
          const periodo = horaNum < 12 ? 'AM' : 'PM';
          const hora12 = `${((horaNum % 12) || 12)}:00 ${periodo}`;

          const opt = document.createElement('option');
          opt.value = horario;
          opt.textContent = hora12;
          horaSelect.appendChild(opt);
        });
        horaSelect.disabled = false;
        
        // Mostrar mensaje de éxito
        mostrarMensaje(`✅ Horarios disponibles cargados (${result.horariosDisponibles.length} opciones)`, 'success');
      } else {
        horaSelect.innerHTML = '<option value="">❌ No hay horarios disponibles</option>';
        horaSelect.disabled = true;
        mostrarMensaje('❌ No hay horarios disponibles para esta fecha', 'error');
      }

    } catch (error) {
      console.error('Error al cargar horarios:', error);
      horaSelect.innerHTML = '<option value="">❌ Error al cargar</option>';
      horaSelect.disabled = true;
      mostrarMensaje('❌ Error al cargar horarios disponibles', 'error');
    }
  }

  // 🎯 Función para mostrar mensajes
  function mostrarMensaje(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    
    // Estilos según el tipo
    const estilos = {
      success: {
        background: '#28a745',
        color: 'white'
      },
      error: {
        background: '#dc3545',
        color: 'white'
      },
      info: {
        background: '#17a2b8',
        color: 'white'
      }
    };

    notificacion.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 9999;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      background: ${estilos[tipo].background};
      color: ${estilos[tipo].color};
    `;
    
    document.body.appendChild(notificacion);
    
    // Animar entrada
    setTimeout(() => {
      notificacion.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
      notificacion.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notificacion)) {
          document.body.removeChild(notificacion);
        }
      }, 300);
    }, 4000);
  }
});

// Configuración de navegación del dashboard cliente
document.addEventListener('DOMContentLoaded', () => {
  const cont = document.getElementById('cliente-contenido');
  const btnDatos = null; // botón eliminado del menú lateral
  const btnCalendario = document.getElementById('btn-calendario');
  const btnHistorial = document.getElementById('btn-historial');
  const btnAgendarSide = document.getElementById('btn-agendar-side');

  if (btnDatos) btnDatos.addEventListener('click', async () => {
    const perfil = await obtenerPerfil();
    cont.innerHTML = `
      <h3><i class=\"fa-solid fa-id-card\"></i> Datos personales</h3>
      <ul>
        <li><strong>Nombre:</strong> ${escapeHtml(perfil.name)}</li>
        <li><strong>Email:</strong> ${escapeHtml(perfil.email)}</li>
        <li><strong>Rol:</strong> ${escapeHtml(perfil.role)}</li>
      </ul>
    `;
    // no botón extra en Datos personales
  });

  if (btnHistorial) btnHistorial.addEventListener('click', async () => {
    cont.innerHTML = '<h3><i class="fa-solid fa-calendar"></i> Historial de citas</h3><p>Cargando...</p>';
    const citas = await obtenerCitas();
    if (!citas || citas.length === 0) {
      cont.innerHTML = '<h3><i class=\"fa-solid fa-calendar\"></i> Historial de citas</h3><p>No hay registros.</p>';
      return;
    }
    const items = citas.map(c => `
      <div class="info-block">
        <h4>${escapeHtml(c.servicio?.nombre || 'Servicio')}</h4>
        <p><strong>Fecha y Hora:</strong> ${escapeHtml(c.fecha)} ${escapeHtml(c.hora)} (${escapeHtml(c.estado)})</p>
        <p><strong>Duración:</strong> ${c.servicio?.duracion ?? '-'} min</p>
        <p><strong>Precio:</strong> ${c.servicio?.precio != null ? 'C$ ' + c.servicio.precio : '-'}</p>
        <p><strong>Barbero:</strong> ${escapeHtml(c.barbero?.name || '')}</p>
      </div>
    `).join('');
    cont.innerHTML = `<h3><i class=\"fa-solid fa-calendar\"></i> Historial de citas</h3>${items}`;
  });

  if (btnCalendario) btnCalendario.addEventListener('click', async () => {
    cont.innerHTML = `
      <h3><i class=\"fa-solid fa-calendar-days\"></i> Calendario</h3>
      <div id=\"calendar\" style=\"margin-top:1rem;\"></div>
    `;
    await renderCalendar();
  });



  // Botón lateral para abrir el modal en cualquier sección
  if (btnAgendarSide) btnAgendarSide.addEventListener('click', abrirModal);
});

// Función para sumar 1 hora y crear campo end para el evento
function calcularFin(fecha, hora) {
  const [h, m] = hora.split(':').map(Number);
  const fechaObj = new Date(`${fecha}T${hora}`);
  fechaObj.setHours(h + 1);
  return fechaObj.toISOString().slice(0,19);
}

//calendar.refetchEvents();

document.getElementById('perfil-img').addEventListener('click', cerrarSesion);

// Helpers reusables
async function obtenerPerfil() {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000/api/auth/perfil', { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('No se pudo obtener el perfil');
  return res.json();
}

async function obtenerCitas() {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000/api/citas', { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  return res.json();
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function renderCalendar() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;
  const calendar = new FullCalendar.Calendar(calendarEl, {
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
    events: async (fetchInfo, success, failure) => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/citas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const citas = await res.json();
        const events = citas.map(cita => ({
          id: cita.id,
          title: `${cita.servicio?.nombre || 'Servicio'} - ${cita.barbero?.name || ''}`.trim(),
          start: `${cita.fecha}T${cita.hora}`,
          end: calcularFin(cita.fecha, cita.hora),
          extendedProps: { estado: cita.estado }
        }));
        success(events);
      } catch (e) {
        failure(e);
      }
    }
  });
  calendar.render();
}