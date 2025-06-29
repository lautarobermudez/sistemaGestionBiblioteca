// ========================================
// SISTEMA INTERACTIVO DE GESTIÓN DE BIBLIOTECA
// ========================================

const readline = require('readline');

// Configuración de readline para entrada de usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Variables globales para almacenar datos
let prestamosActivos = []; // Libros actualmente prestados
let historialDevoluciones = [];
let multasDelDia = 0;
let contadorOperaciones = 0;

// ========================================
// FUNCIONES DEL SISTEMA
// ========================================

// 1. FUNCIÓN PARA REGISTRAR PRÉSTAMOS (Función tradicional)
function registrarPrestamo(titulo, nombreUsuario, diasPrestamo = 7) {
    // ENTRADA: datos del préstamo
    const fechaActual = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaActual.getDate() + diasPrestamo);
    
    // PROCESAMIENTO: crear objeto préstamo
    const prestamo = {
        id: ++contadorOperaciones,
        titulo: titulo.trim(),
        usuario: nombreUsuario.trim(),
        fechaPrestamo: fechaActual.toLocaleDateString('es-AR'),
        fechaLimite: fechaLimite.toLocaleDateString('es-AR'),
        diasPermitidos: diasPrestamo
    };
    
    prestamosActivos.push(prestamo);
    
    // SALIDA: confirmación
    console.log(`\n✅ PRÉSTAMO REGISTRADO EXITOSAMENTE`);
    console.log(`📚 Libro: "${titulo}"`);
    console.log(`👤 Usuario: ${nombreUsuario}`);
    console.log(`📅 Fecha límite: ${prestamo.fechaLimite}`);
    console.log(`🔢 ID de préstamo: ${prestamo.id}\n`);
    
    return prestamo;
}

// 2. FUNCIÓN PARA PROCESAR DEVOLUCIONES (Arrow function)
const procesarDevolucion = (titulo, nombreUsuario) => {
    // ENTRADA: buscar el préstamo activo
    const prestamoIndex = prestamosActivos.findIndex(p => 
        p.titulo.toLowerCase() === titulo.toLowerCase() && 
        p.usuario.toLowerCase() === nombreUsuario.toLowerCase()
    );
    
    if (prestamoIndex === -1) {
        console.log(`\n❌ ERROR: No se encontró un préstamo activo de "${titulo}" para ${nombreUsuario}\n`);
        return null;
    }
    
    const prestamo = prestamosActivos[prestamoIndex];
    
    // PROCESAMIENTO: calcular días de retraso
    const fechaActual = new Date();
    const fechaLimite = new Date(prestamo.fechaLimite.split('/').reverse().join('-'));
    const diferenciaDias = Math.ceil((fechaActual - fechaLimite) / (1000 * 60 * 60 * 24));
    const diasRetraso = diferenciaDias > 0 ? diferenciaDias : 0;
    
    const multaPorDia = 0.50;
    const multa = diasRetraso * multaPorDia;
    
    // Crear registro de devolución
    const devolucion = {
        ...prestamo,
        fechaDevolucion: fechaActual.toLocaleDateString('es-AR'),
        diasRetraso: diasRetraso,
        multa: multa,
        estado: diasRetraso > 0 ? 'CON RETRASO' : 'A TIEMPO'
    };
    
    // Actualizar datos globales
    historialDevoluciones.push(devolucion);
    multasDelDia += multa;
    prestamosActivos.splice(prestamoIndex, 1); // Eliminar de préstamos activos
    
    // SALIDA: mostrar resultado
    console.log(`\n✅ DEVOLUCIÓN PROCESADA`);
    console.log(`📚 Libro: "${titulo}"`);
    console.log(`👤 Usuario: ${nombreUsuario}`);
    console.log(`📅 Devuelto el: ${devolucion.fechaDevolucion}`);
    
    if (diasRetraso > 0) {
        console.log(`⏰ Días de retraso: ${diasRetraso}`);
        console.log(`💰 Multa aplicada: $${multa.toFixed(2)}`);
    } else {
        console.log(`🎉 ¡Devuelto a tiempo! Sin multa.`);
    }
    console.log('');
    
    return devolucion;
};

// 3. FUNCIÓN PARA MOSTRAR ESTADÍSTICAS (Función anónima)
const mostrarEstadisticas = function() {
    // ENTRADA: datos almacenados
    const totalPrestamosActivos = prestamosActivos.length;
    const totalDevoluciones = historialDevoluciones.length;
    const devolucionesATiempo = historialDevoluciones.filter(d => d.diasRetraso === 0).length;
    const devolucionesConRetraso = historialDevoluciones.filter(d => d.diasRetraso > 0).length;
    
    // PROCESAMIENTO: calcular métricas
    const promedioRetraso = totalDevoluciones > 0 
        ? (historialDevoluciones.reduce((sum, d) => sum + d.diasRetraso, 0) / totalDevoluciones).toFixed(1)
        : 0;
    
    // SALIDA: reporte completo
    console.log(`\n📊 ========== ESTADÍSTICAS DEL DÍA ==========`);
    console.log(`📚 Préstamos activos: ${totalPrestamosActivos}`);
    console.log(`🔄 Devoluciones procesadas: ${totalDevoluciones}`);
    console.log(`✅ Devoluciones a tiempo: ${devolucionesATiempo}`);
    console.log(`⏰ Devoluciones con retraso: ${devolucionesConRetraso}`);
    console.log(`💰 Total multas recaudadas: $${multasDelDia.toFixed(2)}`);
    console.log(`📈 Promedio días de retraso: ${promedioRetraso}`);
    
    if (totalPrestamosActivos > 0) {
        console.log(`\n📋 PRÉSTAMOS ACTIVOS:`);
        prestamosActivos.forEach(p => {
            console.log(`  • "${p.titulo}" - ${p.usuario} (vence: ${p.fechaLimite})`);
        });
    }
    console.log(`=============================================\n`);
    
    return {
        prestamosActivos: totalPrestamosActivos,
        devoluciones: totalDevoluciones,
        multasTotal: multasDelDia,
        promedioRetraso: parseFloat(promedioRetraso)
    };
};

// ========================================
// FUNCIONES DE INTERFAZ INTERACTIVA
// ========================================

// Función para mostrar el menú principal
function mostrarMenu() {
    console.log(`
🏛️  SISTEMA DE BIBLIOTECA - MENÚ PRINCIPAL
==========================================
1. 📚 Registrar nuevo préstamo
2. 🔄 Procesar devolución
3. 📊 Ver estadísticas del día
4. 📋 Ver préstamos activos
5. 🚪 Salir del sistema
==========================================`);
}

// Función para validar entrada no vacía
function validarEntrada(input, campo) {
    if (!input || input.trim() === '') {
        console.log(`❌ Error: ${campo} no puede estar vacío.`);
        return false;
    }
    return true;
}

// Función para procesar opción de registrar préstamo
function procesarRegistroPrestamo() {
    rl.question('📚 Ingrese el título del libro: ', (titulo) => {
        if (!validarEntrada(titulo, 'El título')) {
            volverAlMenu();
            return;
        }
        
        rl.question('👤 Ingrese el nombre del usuario: ', (usuario) => {
            if (!validarEntrada(usuario, 'El nombre del usuario')) {
                volverAlMenu();
                return;
            }
            
            rl.question('📅 Días de préstamo (por defecto 7): ', (dias) => {
                const diasPrestamo = dias.trim() === '' ? 7 : parseInt(dias);
                
                if (isNaN(diasPrestamo) || diasPrestamo <= 0) {
                    console.log('❌ Error: Los días deben ser un número positivo.');
                    volverAlMenu();
                    return;
                }
                
                registrarPrestamo(titulo, usuario, diasPrestamo);
                volverAlMenu();
            });
        });
    });
}

// Función para procesar opción de devolución
function procesarDevolucionInteractiva() {
    if (prestamosActivos.length === 0) {
        console.log('\n📋 No hay préstamos activos para devolver.\n');
        volverAlMenu();
        return;
    }
    
    rl.question('📚 Ingrese el título del libro a devolver: ', (titulo) => {
        if (!validarEntrada(titulo, 'El título')) {
            volverAlMenu();
            return;
        }
        
        rl.question('👤 Ingrese el nombre del usuario: ', (usuario) => {
            if (!validarEntrada(usuario, 'El nombre del usuario')) {
                volverAlMenu();
                return;
            }
            
            procesarDevolucion(titulo, usuario);
            volverAlMenu();
        });
    });
}

// Función para mostrar préstamos activos
function mostrarPrestamosActivos() {
    console.log(`\n📋 PRÉSTAMOS ACTIVOS`);
    console.log(`====================`);
    
    if (prestamosActivos.length === 0) {
        console.log('No hay préstamos activos en este momento.\n');
    } else {
        prestamosActivos.forEach((prestamo, index) => {
            console.log(`${index + 1}. "${prestamo.titulo}"`);
            console.log(`   Usuario: ${prestamo.usuario}`);
            console.log(`   Fecha límite: ${prestamo.fechaLimite}`);
            console.log(`   ID: ${prestamo.id}\n`);
        });
    }
}

// Función para volver al menú principal
function volverAlMenu() {
    rl.question('Presione Enter para continuar...', () => {
        iniciarSistema();
    });
}

// Función principal del sistema
function iniciarSistema() {
    mostrarMenu();
    rl.question('Seleccione una opción (1-5): ', (opcion) => {
        switch(opcion.trim()) {
            case '1':
                procesarRegistroPrestamo();
                break;
            case '2':
                procesarDevolucionInteractiva();
                break;
            case '3':
                mostrarEstadisticas();
                volverAlMenu();
                break;
            case '4':
                mostrarPrestamosActivos();
                volverAlMenu();
                break;
            case '5':
                console.log('\n👋 ¡Gracias por usar el Sistema de Biblioteca!');
                console.log('¡Hasta pronto!\n');
                rl.close();
                break;
            default:
                console.log('\n❌ Opción no válida. Por favor, seleccione del 1 al 5.\n');
                iniciarSistema();
                break;
        }
    });
}

// ========================================
// INICIO DEL SISTEMA
// ========================================

console.log('🎉 ¡Bienvenido al Sistema de Gestión de Biblioteca!\n');
iniciarSistema();
