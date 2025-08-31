// ===== Configuración BASE_URL =====
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocal
  ? "http://localhost:3000"
  : "https://jambarbershop3-production-58dd.up.railway.app";

// ===== Funciones globales =====
function abrirModal() {
  const modal = document.getElementById('modal-cita');
  if (modal) modal.classList.remove('hidden');
}

function cerrarModal() {
  const modal = document.getElementById('modal-cita');
  if (modal) modal.classList.add('hidden');
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  window.location.href = 'Menu.html';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===== Inicialización al cargar =====
window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return cerrarSesion();

  // Obtener perfil
  let user;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return cerrarSesion();
    user = await res.json();
  } catch (err) {
    return cerrarSesion();
  }

  // Renderizar dashboard inicial
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

  // ===== Menú móvil =====
  const btnMenu = document.getElementById('btn-menu-movil');
  const menuAdmin = document.querySelector('.menu-admin');
  const overlay = document.getElementById('overlay-menu');

  if (btnMenu && menuAdmin && overlay) {
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
    window.addEventListener('resize', toggleMenuButton);

    btnMenu.addEventListener('click', e => {
      e.preventDefault();
      menuAdmin.classList.add('menu-abierto');
      overlay.classList.add('visible');
      menuAdmin.offsetHeight; // reflow
    });

    overlay.addEventListener('click', () => {
      menuAdmin.classList.remove('menu-abierto');
      overlay.classList.remove('visible');
    });

    document.querySelectorAll('button:not([onclick="cerrarSesion()"])').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.innerWidth <= 480) {
          menuAdmin.classList.remove('menu-abierto');
          overlay.classList.remove('visible');
        }
      });
    });
  }

  // ===== Modal =====
  const btnAgendar = document.getElementById('btn-agendar');
  const modal = document.getElementById('modal-cita');
  const cerrar = document.querySelector('.cerrar');

  if (btnAgendar) btnAgendar.addEventListener('click', abrirModal);
  if (cerrar) cerrar.addEventListener('click', cerrarModal);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) cerrarModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

  // ===== Select Servicios =====
  const servicioSelect = document.getElementById('servicio');
  try {
    const res = await fetch(`${BASE_URL}/api/servicios/public`);
    const servicios = await res.json();
    servicios.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.nombre;
      servicioSelect.appendChild(opt);
    });
  } catch {
    servicioSelect.innerHTML = `<option disabled>No disponible</option>`;
  }

  // ===== Select Barberos =====
  const barberoSelect = document.getElementById('barbero');
  try {
    const res = await fetch(`${BASE_URL}/api/barberos`);
    const barberos = await res.json();
    barberos.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.name;
      barberoSelect.appendChild(opt);
    });
  } catch {
    barberoSelect.innerHTML = `<option disabled>No disponible</option>`;
  }

  // ===== Select Horas =====
  const horaSelect = document.getElementById('hora');
  for (let h = 7; h <= 19; h++) {
    const hora24 = `${h.toString().padStart(2, '0')}:00`;
    const periodo = h < 12 ? 'AM' : 'PM';
    const hora12 = `${(h % 12 || 12)}:00 ${periodo}`;
    const opt = document.createElement('option');
    opt.value = hora24;
    opt.textContent = hora12;
    horaSelect.appendChild(opt);
  }

  // ===== Formulario cita =====
  const formCita = document.getElementById('form-cita');
  const fechaInput = document.getElementById('fecha');

  function mostrarMensaje(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    const estilos = { success: '#28a745', error: '#dc3545', info: '#17a2b8' };
    notificacion.style.cssText = `
      position: fixed; top: 20px; right: 20px; padding: 15px 20px;
      border-radius: 8px; z-index: 9999; font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      background: ${estilos[tipo]}; color: white; transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    setTimeout(() => notificacion.style.transform = 'translateX(0)', 100);
    setTimeout(() => { notificacion.style.transform = 'translateX(100%)'; setTimeout(() => notificacion.remove(), 300); }, 4000);
  }

  async function cargarHorariosDisponibles() {
    if (!fechaInput.value || !barberoSelect.value) return;
    horaSelect.innerHTML = '<option>🔄 Cargando...</option>';
    horaSelect.disabled = true;
    try {
      const res = await fetch(`${BASE_URL}/api/disponibilidad/barbero/${barberoSelect.value}/fecha/${fechaInput.value}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok || !result.horariosDisponibles) {
        horaSelect.innerHTML = '<option>No disponible</option>'; return;
      }
      horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
      result.horariosDisponibles.forEach(horario => {
        const h = parseInt(horario.split(':')[0]);
        const periodo = h < 12 ? 'AM' : 'PM';
        const opt = document.createElement('option');
        opt.value = horario;
        opt.textContent = `${h % 12 || 12}:00 ${periodo}`;
        horaSelect.appendChild(opt);
      });
      horaSelect.disabled = false;
    } catch {
      horaSelect.innerHTML = '<option>Error</option>'; horaSelect.disabled = true;
    }
  }

  function validarFechaYBarbero() {
    if (!fechaInput.value || !barberoSelect.value) return;
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const fechaSel = new Date(fechaInput.value);
    fechaSel.setHours(0,0,0,0);
    if (fechaSel < hoy || fechaSel.getDay() === 0) {
      mostrarMensaje('❌ Fecha no válida', 'error'); fechaInput.value = '';
      return;
    }
    cargarHorariosDisponibles();
  }

  if (fechaInput) fechaInput.min = new Date().toISOString().split('T')[0];
  fechaInput?.addEventListener('change', validarFechaYBarbero);
  barberoSelect?.addEventListener('change', validarFechaYBarbero);

  formCita?.addEventListener('submit', async e => {
    e.preventDefault();
    const fecha = fechaInput.value, hora = horaSelect.value, servicioId = servicioSelect.value, barberoId = barberoSelect.value;
    if (!fecha || !hora || !servicioId || !barberoId) return mostrarMensaje('Todos los campos son obligatorios','error');
    try {
      const res = await fetch(`${BASE_URL}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ fecha, hora, servicioId, barberoId })
      });
      const result = await res.json();
      if (!res.ok) return mostrarMensaje(result.message || 'Error al agendar','error');
      mostrarMensaje('✅ Cita agendada','success');
      cerrarModal(); formCita.reset();
      const calendarEl = document.getElementById('calendar');
      if (calendarEl && calendarEl.children.length>0) FullCalendar.getCalendar(calendarEl).refetchEvents();
    } catch { mostrarMensaje('❌ Error de conexión','error'); }
  });

  // ===== Calendario =====
  async function renderCalendar() {
    const calendarEl = document.getElementById('calendar'); if (!calendarEl) return;
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView:'dayGridMonth', locale:'es',
      headerToolbar:{ left:'prev,next today', center:'title', right:'dayGridMonth,timeGridWeek,timeGridDay' },
      events: async (fetchInfo, success, failure) => {
        try {
          const res = await fetch(`${BASE_URL}/api/citas`, { headers:{ Authorization:`Bearer ${token}` }});
          const citas = await res.json();
          success(citas.map(c => ({
            id:c.id,
            title:`${c.servicio?.nombre||'Servicio'} - ${c.barbero?.name||''}`.trim(),
            start:`${c.fecha}T${c.hora}`,
            end:new Date(new Date(`${c.fecha}T${c.hora}`).getTime()+60*60000).toISOString().slice(0,19),
            extendedProps:{estado:c.estado}
          })));
        } catch(e){ failure(e); }
      }
    });
    calendar.render();
  }

  // ===== Navegación dashboard cliente =====
  document.getElementById('btn-calendario')?.addEventListener('click', () => {
    cont.innerHTML = `<h3><i class="fa-solid fa-calendar-days"></i> Calendario</h3><div id="calendar" style="margin-top:1rem;"></div>`;
    renderCalendar();
  });
  document.getElementById('btn-historial')?.addEventListener('click', async () => {
    cont.innerHTML = '<h3><i class="fa-solid fa-calendar"></i> Historial de citas</h3><p>Cargando...</p>';
    const res = await fetch(`${BASE_URL}/api/citas`, { headers:{ Authorization:`Bearer ${token}` }});
    const citas = await res.json();
    cont.innerHTML = citas.length===0 ? '<p>No hay registros.</p>' :
      citas.map(c=>`
        <div class="info-block">
          <h4>${escapeHtml(c.servicio?.nombre||'Servicio')}</h4>
          <p><strong>Fecha y Hora:</strong> ${escapeHtml(c.fecha)} ${escapeHtml(c.hora)} (${escapeHtml(c.estado)})</p>
          <p><strong>Duración:</strong> ${c.servicio?.duracion??'-'} min</p>
          <p><strong>Precio:</strong> ${c.servicio?.precio!=null?'C$ '+c.servicio.precio:'-'}</p>
          <p><strong>Barbero:</strong> ${escapeHtml(c.barbero?.name||'')}</p>
        </div>`).join('');
  });

  document.getElementById('btn-agendar-side')?.addEventListener('click', abrirModal);
  document.getElementById('perfil-img')?.addEventListener('click', cerrarSesion);
});
