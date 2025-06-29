// =============================
// SISTEMA DE GESTIÓN DE BIBLIOTECA (FRONTEND)
// =============================

// Variables globales (se guardan en localStorage)
let prestamosActivos = JSON.parse(localStorage.getItem('prestamosActivos') || '[]');
let historialDevoluciones = JSON.parse(localStorage.getItem('historialDevoluciones') || '[]');
let multasDelDia = parseFloat(localStorage.getItem('multasDelDia') || '0');
let contadorOperaciones = parseInt(localStorage.getItem('contadorOperaciones') || '0');

// Utilidad para guardar datos
function guardarDatos() {
    localStorage.setItem('prestamosActivos', JSON.stringify(prestamosActivos));
    localStorage.setItem('historialDevoluciones', JSON.stringify(historialDevoluciones));
    localStorage.setItem('multasDelDia', multasDelDia.toString());
    localStorage.setItem('contadorOperaciones', contadorOperaciones.toString());
}

// Navegación entre secciones
const secciones = {
    prestamo: document.getElementById('seccion-prestamo'),
    devolucion: document.getElementById('seccion-devolucion'),
    estadisticas: document.getElementById('seccion-estadisticas'),
    activos: document.getElementById('seccion-activos')
};

function mostrarSeccion(nombre) {
    Object.keys(secciones).forEach(key => {
        secciones[key].classList.add('oculto');
    });
    secciones[nombre].classList.remove('oculto');
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('nav-' + nombre).classList.add('active');
}

document.getElementById('nav-prestamo').onclick = () => mostrarSeccion('prestamo');
document.getElementById('nav-devolucion').onclick = () => mostrarSeccion('devolucion');
document.getElementById('nav-estadisticas').onclick = () => {
    renderEstadisticas();
    mostrarSeccion('estadisticas');
};
document.getElementById('nav-activos').onclick = () => {
    renderPrestamosActivos();
    mostrarSeccion('activos');
};

// ========== PRÉSTAMO ==========
document.getElementById('form-prestamo').onsubmit = function(e) {
    e.preventDefault();
    const titulo = document.getElementById('titulo-prestamo').value.trim();
    const usuario = document.getElementById('usuario-prestamo').value.trim();
    const dias = parseInt(document.getElementById('dias-prestamo').value);
    const mensaje = document.getElementById('mensaje-prestamo');

    if (!titulo || !usuario || isNaN(dias) || dias <= 0) {
        mensaje.textContent = 'Por favor, complete todos los campos correctamente.';
        return;
    }

    // Validar que no exista préstamo igual
    if (prestamosActivos.some(p => p.titulo.toLowerCase() === titulo.toLowerCase() && p.usuario.toLowerCase() === usuario.toLowerCase())) {
        mensaje.textContent = 'Ya existe un préstamo activo para este libro y usuario.';
        return;
    }

    const fechaActual = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaActual.getDate() + dias);

    const prestamo = {
        id: ++contadorOperaciones,
        titulo,
        usuario,
        fechaPrestamo: fechaActual.toLocaleDateString('es-AR'),
        fechaLimite: fechaLimite.toLocaleDateString('es-AR'),
        diasPermitidos: dias
    };
    prestamosActivos.push(prestamo);
    guardarDatos();
    mensaje.textContent = '✅ Préstamo registrado exitosamente.';
    this.reset();
};

// ========== DEVOLUCIÓN ==========
document.getElementById('form-devolucion').onsubmit = function(e) {
    e.preventDefault();
    const titulo = document.getElementById('titulo-devolucion').value.trim();
    const usuario = document.getElementById('usuario-devolucion').value.trim();
    const mensaje = document.getElementById('mensaje-devolucion');

    const index = prestamosActivos.findIndex(p => p.titulo.toLowerCase() === titulo.toLowerCase() && p.usuario.toLowerCase() === usuario.toLowerCase());
    if (index === -1) {
        mensaje.textContent = 'No se encontró un préstamo activo para ese libro y usuario.';
        return;
    }
    const prestamo = prestamosActivos[index];
    const fechaActual = new Date();
    const fechaLimite = new Date(prestamo.fechaLimite.split('/').reverse().join('-'));
    const diferenciaDias = Math.ceil((fechaActual - fechaLimite) / (1000 * 60 * 60 * 24));
    const diasRetraso = diferenciaDias > 0 ? diferenciaDias : 0;
    const multaPorDia = 0.5;
    const multa = diasRetraso * multaPorDia;
    const devolucion = {
        ...prestamo,
        fechaDevolucion: fechaActual.toLocaleDateString('es-AR'),
        diasRetraso,
        multa,
        estado: diasRetraso > 0 ? 'CON RETRASO' : 'A TIEMPO'
    };
    historialDevoluciones.push(devolucion);
    multasDelDia += multa;
    prestamosActivos.splice(index, 1);
    guardarDatos();
    mensaje.textContent = diasRetraso > 0 ? `Devuelto con ${diasRetraso} día(s) de retraso. Multa: $${multa.toFixed(2)}` : '¡Devuelto a tiempo!';
    this.reset();
};

// ========== ESTADÍSTICAS ==========
function renderEstadisticas() {
    const totalPrestamosActivos = prestamosActivos.length;
    const totalDevoluciones = historialDevoluciones.length;
    const devolucionesATiempo = historialDevoluciones.filter(d => d.diasRetraso === 0).length;
    const devolucionesConRetraso = historialDevoluciones.filter(d => d.diasRetraso > 0).length;
    const promedioRetraso = totalDevoluciones > 0 ? (historialDevoluciones.reduce((sum, d) => sum + d.diasRetraso, 0) / totalDevoluciones).toFixed(1) : 0;
    const panel = document.getElementById('estadisticas-panel');
    panel.innerHTML = `
        <div class="card">
            <div><b>Préstamos activos:</b> ${totalPrestamosActivos}</div>
            <div><b>Devoluciones procesadas:</b> ${totalDevoluciones}</div>
            <div><b>Devoluciones a tiempo:</b> ${devolucionesATiempo}</div>
            <div><b>Devoluciones con retraso:</b> ${devolucionesConRetraso}</div>
            <div><b>Total multas recaudadas:</b> $${multasDelDia.toFixed(2)}</div>
            <div><b>Promedio días de retraso:</b> ${promedioRetraso}</div>
        </div>
    `;
}

// ========== PRÉSTAMOS ACTIVOS ==========
function renderPrestamosActivos() {
    const lista = document.getElementById('activos-lista');
    if (prestamosActivos.length === 0) {
        lista.innerHTML = '<div>No hay préstamos activos en este momento.</div>';
        return;
    }
    lista.innerHTML = prestamosActivos.map(p => `
        <div class="card">
            <div class="titulo">${p.titulo}</div>
            <div>Usuario: <b>${p.usuario}</b></div>
            <div>Fecha límite: ${p.fechaLimite}</div>
            <div>ID: ${p.id}</div>
        </div>
    `).join('');
}

// Mostrar sección inicial
mostrarSeccion('prestamo');
