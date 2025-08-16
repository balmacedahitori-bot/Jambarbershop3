// Script para configurar disponibilidad por defecto del barbero
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';
const TOKEN = 'TU_TOKEN_AQUI'; // Necesitas un token de barbero válido

async function configurarDisponibilidadPorDefecto() {
  console.log('=== CONFIGURANDO DISPONIBILIDAD POR DEFECTO ===\n');

  // Configuración por defecto: Lunes a Viernes de 9:00 a 18:00
  const disponibilidadPorDefecto = [
    {
      dia: 1, // Lunes
      inicio: '09:00',
      fin: '18:00',
      activo: true
    },
    {
      dia: 2, // Martes
      inicio: '09:00',
      fin: '18:00',
      activo: true
    },
    {
      dia: 3, // Miércoles
      inicio: '09:00',
      fin: '18:00',
      activo: true
    },
    {
      dia: 4, // Jueves
      inicio: '09:00',
      fin: '18:00',
      activo: true
    },
    {
      dia: 5, // Viernes
      inicio: '09:00',
      fin: '18:00',
      activo: true
    }
  ];

  try {
    console.log('Configurando disponibilidad para barbero ID 1...');
    console.log('Horarios:', disponibilidadPorDefecto);

    const res = await fetch(`${BASE_URL}/disponibilidad/barbero/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ disponibilidad: disponibilidadPorDefecto })
    });

    const result = await res.json();
    console.log('Respuesta:', result);

    if (res.ok) {
      console.log('✅ Disponibilidad configurada exitosamente');
      console.log(`Se configuraron ${result.horariosGuardados} días de trabajo`);
    } else {
      console.log('❌ Error al configurar disponibilidad:', result.message);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

if (TOKEN !== 'TU_TOKEN_AQUI') {
  configurarDisponibilidadPorDefecto();
} else {
  console.log('⚠️ Configura un token válido para ejecutar la configuración');
  console.log('💡 Usa un token de un usuario barbero');
}
