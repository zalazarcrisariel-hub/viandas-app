// ============================================
// CONFIGURACIÓN FIREBASE
// ============================================

// IMPORTANTE: Reemplaza con tus datos de Firebase
// Ve a: https://firebase.google.com/docs/database/web/start
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID",
    databaseURL: "TU_DATABASE_URL"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ============================================
// DATOS LOCALES (mientras se conecta Firebase)
// ============================================

let clientes = [];
let menu = [];
let pedidos = [];

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================

function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(sec => {
        sec.classList.remove('activa');
    });

    // Ocultar todos los botones activos
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar sección seleccionada
    document.getElementById(seccionId).classList.add('activa');

    // Marcar botón como activo
    event.target.classList.add('active');

    // Actualizar datos cuando se abre la sección
    if (seccionId === 'clientes') {
        cargarClientes();
    } else if (seccionId === 'menu') {
        cargarMenu();
    } else if (seccionId === 'pedidos') {
        cargarClientesEnPedidos();
        cargarPlatosDisponibles();
        cargarPedidos();
    } else if (seccionId === 'resumen') {
        cargarResumen();
    }
}

// ============================================
// SECCIÓN: CLIENTES
// ============================================

document.getElementById('formCliente').addEventListener('submit', function(e) {
    e.preventDefault();
    agregarCliente();
});

function agregarCliente() {
    const nombre = document.getElementById('nombreCliente').value;
    const direccion = document.getElementById('direccionCliente').value;
    const telefono = document.getElementById('telefonoCliente').value;
    const horario = document.getElementById('horarioCliente').value;
    const sinSal = document.getElementById('sinSalCliente').checked;

    if (!nombre || !direccion || !telefono || !horario) {
        alert('Por favor completa todos los campos');
        return;
    }

    const cliente = {
        id: Date.now(),
        nombre,
        direccion,
        telefono,
        horario,
        sinSal,
        fecha: new Date().toLocaleString()
    };

    // Guardar en Firebase
    db.ref('clientes/' + cliente.id).set(cliente);

    // Guardar en array local
    clientes.push(cliente);

    // Limpiar formulario
    document.getElementById('formCliente').reset();

    // Actualizar lista
    cargarClientes();

    alert('✅ Cliente agregado correctamente');
}

function cargarClientes() {
    const lista = document.getElementById('listaClientes');

    if (clientes.length === 0) {
        lista.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No hay clientes registrados</p></div>';
        return;
    }

    lista.innerHTML = clientes.map(cliente => `
        <div class="item">
            <div class="item-content">
                <div class="item-title">${cliente.nombre}</div>
                <div class="item-info">📍 ${cliente.direccion}</div>
                <div class="item-info">📞 ${cliente.telefono}</div>
                <div class="item-info">🕐 ${cliente.horario}</div>
                ${cliente.sinSal ? '<span class="item-badge sin-sal">Sin sal</span>' : ''}
            </div>
            <div class="item-actions">
                <button class="btn btn-danger" onclick="eliminarCliente(${cliente.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function eliminarCliente(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
        db.ref('clientes/' + id).remove();
        clientes = clientes.filter(c => c.id !== id);
        cargarClientes();
    }
}

// ============================================
// SECCIÓN: MENÚ SEMANAL
// ============================================

function cargarMenu() {
    // Generar 10 campos para platos
    let platosList = '';
    for (let i = 1; i <= 10; i++) {
        platosList += `
            <div class="plato-input-group">
                <label>Plato ${i}:</label>
                <input type="text" id="plato${i}" placeholder="Nombre del plato ${i}">
            </div>
        `;
    }
    document.getElementById('platosList').innerHTML = platosList;

    // Cargar menú actual
    cargarMenuActual();
}

function crearMenu() {
    const fecha = document.getElementById('fechaMenu').value;

    if (!fecha) {
        alert('Por favor selecciona una fecha');
        return;
    }

    const platos = [];
    for (let i = 1; i <= 10; i++) {
        const nombre = document.getElementById('plato' + i).value.trim();
        if (nombre) {
            platos.push(nombre);
        }
    }

    if (platos.length === 0) {
        alert('Por favor ingresa al menos un plato');
        return;
    }

    const nuevoMenu = {
        id: Date.now(),
        fecha,
        platos,
        fechaCreacion: new Date().toLocaleString()
    };

    // Guardar en Firebase
    db.ref('menu/' + nuevoMenu.id).set(nuevoMenu);

    // Guardar en array local
    menu.push(nuevoMenu);

    // Limpiar formulario
    cargarMenu();

    alert('✅ Menú creado correctamente');
}

function cargarMenuActual() {
    const menuActual = document.getElementById('menuActual');

    if (menu.length === 0) {
        menuActual.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>No hay menú cargado</p></div>';
        return;
    }

    // Mostrar el menú más reciente
    const ultimoMenu = menu[menu.length - 1];

    menuActual.innerHTML = `
        <div class="item">
            <div class="item-content">
                <div class="item-title">Menú del ${new Date(ultimoMenu.fecha).toLocaleDateString()}</div>
                <div class="item-info">Platos:</div>
                <div style="margin-left: 15px;">
                    ${ultimoMenu.platos.map((plato, idx) => `
                        <div class="item-info">• ${plato}</div>
                    `).join('')}
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-danger" onclick="eliminarMenu(${ultimoMenu.id})">Eliminar</button>
            </div>
        </div>
    `;
}

function eliminarMenu(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este menú?')) {
        db.ref('menu/' + id).remove();
        menu = menu.filter(m => m.id !== id);
        cargarMenuActual();
    }
}

// ============================================
// SECCIÓN: PEDIDOS
// ============================================

function cargarClientesEnPedidos() {
    const select = document.getElementById('clientePedido');
    select.innerHTML = '<option value="">-- Seleccionar cliente --</option>';

    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = cliente.nombre;
        select.appendChild(option);
    });
}

function cargarPlatosDisponibles() {
    const contenedor = document.getElementById('platosDisponibles');

    if (menu.length === 0) {
        contenedor.innerHTML = '<p class="info-text">⚠️ Debes crear un menú primero</p>';
        return;
    }

    const ultimoMenu = menu[menu.length - 1];
    let html = '<h4 style="margin: 15px 0 10px 0;">Selecciona los platos:</h4>';

    ultimoMenu.platos.forEach((plato, idx) => {
        html += `
            <div class="plato-counter">
                <label>${plato}</label>
                <input type="number" id="cant_${idx}" value="0" min="0">
            </div>
        `;
    });

    contenedor.innerHTML = html;
}

function guardarPedido() {
    const clienteId = document.getElementById('clientePedido').value;

    if (!clienteId) {
        alert('Por favor selecciona un cliente');
        return;
    }

    if (menu.length === 0) {
        alert('No hay menú disponible');
        return;
    }

    const ultimoMenu = menu[menu.length - 1];
    const cliente = clientes.find(c => c.id == clienteId);
    const platos = {};
    let tienePlatos = false;

    ultimoMenu.platos.forEach((plato, idx) => {
        const cantidad = parseInt(document.getElementById('cant_' + idx).value) || 0;
        if (cantidad > 0) {
            platos[plato] = cantidad;
            tienePlatos = true;
        }
    });

    if (!tienePlatos) {
        alert('Por favor selecciona al menos un plato');
        return;
    }

    const pedido = {
        id: Date.now(),
        clienteId,
        clienteNombre: cliente.nombre,
        platos,
        fecha: new Date().toLocaleString(),
        horarioEntrega: cliente.horario,
        sinSal: cliente.sinSal
    };

    // Guardar en Firebase
    db.ref('pedidos/' + pedido.id).set(pedido);

    // Guardar en array local
    pedidos.push(pedido);

    // Limpiar
    cargarPlatosDisponibles();
    document.getElementById('clientePedido').value = '';

    alert('✅ Pedido guardado correctamente');
    cargarPedidos();
}

function cargarPedidos() {
    const lista = document.getElementById('listaPedidos');

    if (pedidos.length === 0) {
        lista.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🛒</div><p>No hay pedidos registrados</p></div>';
        return;
    }

    lista.innerHTML = pedidos.map(pedido => `
        <div class="item">
            <div class="item-content">
                <div class="item-title">${pedido.clienteNombre}</div>
                <div class="item-info">🕐 Horario: ${pedido.horarioEntrega}</div>
                ${pedido.sinSal ? '<span class="item-badge sin-sal">Sin sal</span>' : ''}
                <div style="margin-top: 10px;">
                    ${Object.entries(pedido.platos).map(([plato, cantidad]) => `
                        <div class="item-info">• ${plato}: <strong>${cantidad}</strong></div>
                    `).join('')}
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-danger" onclick="eliminarPedido(${pedido.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function eliminarPedido(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
        db.ref('pedidos/' + id).remove();
        pedidos = pedidos.filter(p => p.id !== id);
        cargarPedidos();
    }
}

// ============================================
// SECCIÓN: RESUMEN
// ============================================

function cargarResumen() {
    const contenedor = document.getElementById('resumenPreparacion');

    if (menu.length === 0 || pedidos.length === 0) {
        contenedor.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><p>Carga un menú y pedidos para ver el resumen</p></div>';
        return;
    }

    // Contar platos
    const totales = {};

    pedidos.forEach(pedido => {
        Object.entries(pedido.platos).forEach(([plato, cantidad]) => {
            totales[plato] = (totales[plato] || 0) + cantidad;
        });
    });

    const html = Object.entries(totales).map(([plato, cantidad]) => `
        <div class="resumen-item">
            <div class="resumen-item-plato">${plato}</div>
            <div class="resumen-item-cantidad">${cantidad} unidades</div>
        </div>
    `).join('');

    contenedor.innerHTML = html || '<div class="empty-state"><p>No hay pedidos para resumir</p></div>';
}

// ============================================
// SINCRONIZACIÓN CON FIREBASE (Real-time)
// ============================================

// Cargar clientes en tiempo real
db.ref('clientes').on('value', (snapshot) => {
    clientes = [];
    snapshot.forEach((childSnapshot) => {
        clientes.push(childSnapshot.val());
    });
});

// Cargar menú en tiempo real
db.ref('menu').on('value', (snapshot) => {
    menu = [];
    snapshot.forEach((childSnapshot) => {
        menu.push(childSnapshot.val());
    });
});

// Cargar pedidos en tiempo real
db.ref('pedidos').on('value', (snapshot) => {
    pedidos = [];
    snapshot.forEach((childSnapshot) => {
        pedidos.push(childSnapshot.val());
    });
});

// ============================================
// INICIALIZACIÓN
// ============================================

console.log('✅ Aplicación cargada correctamente');
cargarClientes();
