class DashboardComponent {
    constructor() {
        this.graficoGastos = null;
        this.graficoBalance = null;
        this.graficoComparativa = null;
        this.graficoEvolucion = null;
    }

    async render() {
        return `
            <div class="dashboard-container">
                <header class="dashboard-header">
                    <h1>Dashboard Financiero</h1>
                    <p class="dashboard-subtitle">Resumen completo de tus finanzas mensuales</p>
                </header>

                <div class="resumen-grid">
                    ${this.renderTarjetasResumen()}
                </div>

                <div class="graficos-grid">
                    <div class="grafico-card">
                        <div class="grafico-header">
                            <h3>Gastos por Categoría</h3>
                            <select class="mes-selector" id="selector-mes-gastos">
                                ${this.generarOpcionesMeses()}
                            </select>
                        </div>
                        <div class="grafico-body">
                            <canvas id="grafico-gastos"></canvas>
                        </div>
                    </div>

                    <div class="grafico-card">
                        <div class="grafico-header">
                            <h3>Evolución Mensual</h3>
                            <select class="ano-selector" id="selector-ano-evolucion">
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                            </select>
                        </div>
                        <div class="grafico-body">
                            <canvas id="grafico-evolucion"></canvas>
                        </div>
                    </div>
                </div>

                <div class="graficos-grid">
                    <div class="grafico-card">
                        <div class="grafico-header">
                            <h3>Balance Real vs Estimado</h3>
                            <select class="mes-selector" id="selector-mes-balance">
                                ${this.generarOpcionesMeses()}
                            </select>
                        </div>
                        <div class="grafico-body">
                            <canvas id="grafico-balance"></canvas>
                        </div>
                    </div>

                    <div class="grafico-card">
                        <div class="grafico-header">
                            <h3>Comparativa Ingresos vs Gastos</h3>
                            <select class="mes-selector" id="selector-mes-comparativa">
                                ${this.generarOpcionesMeses()}
                            </select>
                        </div>
                        <div class="grafico-body">
                            <canvas id="grafico-comparativa"></canvas>
                        </div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="seccion-card">
                        <div class="seccion-header">
                            <h3>Transacciones Recientes</h3>
                            <a href="#transacciones" class="ver-todas-link">Ver todas</a>
                        </div>
                        <div class="transacciones-lista">
                            <div class="lista-header">
                                <span>Descripción</span>
                                <span>Categoría</span>
                                <span>Monto</span>
                                <span>Fecha</span>
                            </div>
                            <div id="lista-transacciones-recientes" class="lista-contenido">
                                <!-- Cargado dinámicamente -->
                            </div>
                        </div>
                    </div>

                    <div class="seccion-card">
                        <div class="seccion-header">
                            <h3>Estado Presupuestos</h3>
                            <span class="mes-actual-label" id="mes-actual-label">Marzo 2024</span>
                        </div>
                        <div id="lista-presupuestos-dashboard" class="presupuestos-lista">
                            <!-- Cargado dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTarjetasResumen() {
        return `
            <div class="tarjeta-resumen tarjeta-ingreso">
                <div class="tarjeta-icono">I</div>
                <div class="tarjeta-contenido">
                    <h4>Total Ingresos</h4>
                    <p class="tarjeta-monto" id="total-ingresos">$0.00</p>
                    <span class="tarjeta-info">Este mes</span>
                </div>
            </div>

            <div class="tarjeta-resumen tarjeta-gasto">
                <div class="tarjeta-icono">G</div>
                <div class="tarjeta-contenido">
                    <h4>Total Gastos</h4>
                    <p class="tarjeta-monto" id="total-gastos">$0.00</p>
                    <span class="tarjeta-info">Este mes</span>
                </div>
            </div>

            <div class="tarjeta-resumen tarjeta-balance">
                <div class="tarjeta-icono">B</div>
                <div class="tarjeta-contenido">
                    <h4>Balance Actual</h4>
                    <p class="tarjeta-monto" id="balance-total">$0.00</p>
                    <span class="tarjeta-info" id="estado-balance">Disponible</span>
                </div>
            </div>
        `;
    }

    generarOpcionesMeses() {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const mesActual = new Date().getMonth();
        
        return meses.map((mes, index) => `
            <option value="${index + 1}" ${index === mesActual ? 'selected' : ''}>
                ${mes}
            </option>
        `).join('');
    }

    async afterRender() {
        await this.cargarResumen();
        await this.cargarTransaccionesRecientes();
        await this.cargarPresupuestosDashboard();
        
        this.configurarSelectores();
        
        // Inicializar gráficos
        await this.inicializarGraficos();
    }

    async cargarResumen() {
        try {
            const transacciones = await obtenerTodosItems(STORES.TRANSACCIONES);
            const mesActual = new Date().getMonth() + 1;
            const anoActual = new Date().getFullYear();
            
            let totalIngresos = 0;
            let totalGastos = 0;
            let ingresosMes = 0;
            let gastosMes = 0;
            
            transacciones.forEach(trans => {
                const fechaTrans = new Date(trans.fecha);
                const mesTrans = fechaTrans.getMonth() + 1;
                const anoTrans = fechaTrans.getFullYear();
                
                if (trans.tipo === 'ingreso') {
                    totalIngresos += trans.monto;
                    if (mesTrans === mesActual && anoTrans === anoActual) {
                        ingresosMes += trans.monto;
                    }
                } else {
                    totalGastos += trans.monto;
                    if (mesTrans === mesActual && anoTrans === anoActual) {
                        gastosMes += trans.monto;
                    }
                }
            });
            
            const balanceTotal = totalIngresos - totalGastos;
            const balanceMes = ingresosMes - gastosMes;
            
            document.getElementById('total-ingresos').textContent = `$${ingresosMes.toFixed(2)}`;
            document.getElementById('total-gastos').textContent = `$${gastosMes.toFixed(2)}`;
            document.getElementById('balance-total').textContent = `$${balanceMes.toFixed(2)}`;
            
            const estadoBalance = document.getElementById('estado-balance');
            if (balanceMes > 0) {
                estadoBalance.textContent = 'Superávit';
                estadoBalance.style.color = '#27ae60';
            } else if (balanceMes < 0) {
                estadoBalance.textContent = 'Déficit';
                estadoBalance.style.color = '#e74c3c';
            } else {
                estadoBalance.textContent = 'Equilibrado';
                estadoBalance.style.color = '#f39c12';
            }
            
        } catch (error) {
            console.error('Error cargando resumen:', error);
        }
    }

    async cargarTransaccionesRecientes() {
        try {
            const transacciones = await obtenerTodosItems(STORES.TRANSACCIONES);
            const categorias = await obtenerTodosItems(STORES.CATEGORIAS);
            
            // Ordenar por fecha (más recientes primero)
            transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            
            const lista = document.getElementById('lista-transacciones-recientes');
            if (!lista) return;
            
            const transaccionesRecientes = transacciones.slice(0, 5);
            
            if (transaccionesRecientes.length === 0) {
                lista.innerHTML = `
                    <div class="estado-vacio">
                        <p>No hay transacciones registradas</p>
                        <a href="#transacciones" class="btn-pequeno">Agregar transacción</a>
                    </div>
                `;
                return;
            }
            
            lista.innerHTML = transaccionesRecientes.map(trans => {
                const cat = categorias.find(c => c.id === trans.categoria);
                const fecha = new Date(trans.fecha).toLocaleDateString('es-ES');
                const color = trans.tipo === 'ingreso' ? '#27ae60' : '#e74c3c';
                const simbolo = trans.tipo === 'ingreso' ? '+' : '-';
                
                return `
                    <div class="item-transaccion">
                        <span class="trans-descripcion">${trans.descripcion || 'Sin descripción'}</span>
                        <span class="trans-categoria">${cat ? cat.nombre : 'Sin categoría'}</span>
                        <span class="trans-monto" style="color:${color}">
                            ${simbolo}$${trans.monto.toFixed(2)}
                        </span>
                        <span class="trans-fecha">${fecha}</span>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Error cargando transacciones recientes:', error);
        }
    }

    async cargarPresupuestosDashboard() {
        try {
            const presupuestos = await obtenerTodosItems(STORES.PRESUPUESTOS);
            const categorias = await obtenerTodosItems(STORES.CATEGORIAS);
            const transacciones = await obtenerTodosItems(STORES.TRANSACCIONES);
            
            const mesActual = new Date().getMonth() + 1;
            const anoActual = new Date().getFullYear();
            
            const presupuestosActuales = presupuestos.filter(p => 
                p.mes === mesActual && p.ano === anoActual
            );
            
            const lista = document.getElementById('lista-presupuestos-dashboard');
            if (!lista) return;
            
            const mesLabel = document.getElementById('mes-actual-label');
            if (mesLabel) {
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                mesLabel.textContent = `${meses[mesActual - 1]} ${anoActual}`;
            }
            
            if (presupuestosActuales.length === 0) {
                lista.innerHTML = `
                    <div class="estado-vacio">
                        <p>No hay presupuestos para este mes</p>
                        <a href="#presupuestos" class="btn-pequeno">Configurar presupuesto</a>
                    </div>
                `;
                return;
            }
            
            lista.innerHTML = await Promise.all(presupuestosActuales.map(async (pres) => {
                const cat = categorias.find(c => c.id === pres.categoria);
                if (!cat) return '';
                
                const gastosMes = transacciones.filter(t => 
                    t.categoria === pres.categoria && 
                    t.tipo === 'gasto' &&
                    new Date(t.fecha).getMonth() + 1 === mesActual &&
                    new Date(t.fecha).getFullYear() === anoActual
                );
                
                const gastoTotal = gastosMes.reduce((sum, t) => sum + t.monto, 0);
                const porcentaje = (gastoTotal / pres.monto) * 100;
                
                let estado = 'normal';
                let estadoColor = '#27ae60';
                
                if (porcentaje >= 100) {
                    estado = 'excedido';
                    estadoColor = '#e74c3c';
                } else if (porcentaje >= 80) {
                    estado = 'alerta';
                    estadoColor = '#f39c12';
                }
                
                return `
                    <div class="item-presupuesto-dash">
                        <div class="presupuesto-header">
                            <span class="presupuesto-categoria" style="color:${cat.color}">
                                ${cat.nombre}
                            </span>
                            <span class="presupuesto-porcentaje" style="color:${estadoColor}">
                                ${porcentaje.toFixed(0)}%
                            </span>
                        </div>
                        <div class="presupuesto-detalle">
                            <span>Presupuesto: $${pres.monto.toFixed(2)}</span>
                            <span>Gastado: $${gastoTotal.toFixed(2)}</span>
                        </div>
                        <div class="barra-progreso">
                            <div class="progreso-fill ${estado}" style="width: ${Math.min(porcentaje, 100)}%"></div>
                        </div>
                    </div>
                `;
            })).then(items => items.filter(item => item !== '').join(''));
            
        } catch (error) {
            console.error('Error cargando presupuestos:', error);
        }
    }

    configurarSelectores() {
        // Selector de mes para gráfico de gastos
        const selectorGastos = document.getElementById('selector-mes-gastos');
        if (selectorGastos) {
            selectorGastos.addEventListener('change', async (e) => {
                await this.actualizarGraficoGastos(parseInt(e.target.value));
            });
        }
        
        // Selector de año para gráfico de evolución
        const selectorEvolucion = document.getElementById('selector-ano-evolucion');
        if (selectorEvolucion) {
            selectorEvolucion.addEventListener('change', async (e) => {
                await this.actualizarGraficoEvolucion(parseInt(e.target.value));
            });
        }
        
        // Selector de mes para gráfico de balance
        const selectorBalance = document.getElementById('selector-mes-balance');
        if (selectorBalance) {
            selectorBalance.addEventListener('change', async (e) => {
                await this.actualizarGraficoBalance(parseInt(e.target.value));
            });
        }
        
        // Selector de mes para gráfico de comparativa
        const selectorComparativa = document.getElementById('selector-mes-comparativa');
        if (selectorComparativa) {
            selectorComparativa.addEventListener('change', async (e) => {
                await this.actualizarGraficoComparativa(parseInt(e.target.value));
            });
        }
    }

    async inicializarGraficos() {
        const mesActual = new Date().getMonth() + 1;
        const anoActual = new Date().getFullYear();
        
        await this.crearGraficoGastos(mesActual);
        await this.crearGraficoEvolucion(anoActual);
        await this.crearGraficoBalance(mesActual);
        await this.crearGraficoComparativa(mesActual);
    }

    async crearGraficoGastos(mes) {
        try {
            const transacciones = await obtenerTodosItems(STORES.TRANSACCIONES);
            const categorias = await obtenerTodosItems(STORES.CATEGORIAS);
            const anoActual = new Date().getFullYear();
            
            const gastosPorCategoria = {};
            
            // Inicializar todas las categorías de gasto con 0
            categorias.forEach(cat => {
                if (cat.tipo === 'gasto') {
                    gastosPorCategoria[cat.id] = {
                        nombre: cat.nombre,
                        color: cat.color,
                        total: 0
                    };
                }
            });
            
            // Sumar gastos del mes seleccionado
            transacciones.forEach(trans => {
                if (trans.tipo === 'gasto') {
                    const fechaTrans = new Date(trans.fecha);
                    const mesTrans = fechaTrans.getMonth() + 1;
                    const anoTrans = fechaTrans.getFullYear();
                    
                    if (mesTrans === mes && anoTrans === anoActual) {
                        if (gastosPorCategoria[trans.categoria]) {
                            gastosPorCategoria[trans.categoria].total += trans.monto;
                        }
                    }
                }
            });
            
            // Filtrar categorías con gastos > 0
            const categoriasConGastos = Object.values(gastosPorCategoria).filter(cat => cat.total > 0);
            
            const canvas = document.getElementById('grafico-gastos');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            
            // Destruir gráfico anterior si existe
            if (this.graficoGastos) {
                this.graficoGastos.destroy();
            }
            
            if (categoriasConGastos.length === 0) {
                ctx.font = '14px Arial';
                ctx.fillStyle = '#95a5a6';
                ctx.textAlign = 'center';
                ctx.fillText('No hay gastos este mes', canvas.width / 2, canvas.height / 2);
                return;
            }
            
            this.graficoGastos = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: categoriasConGastos.map(cat => cat.nombre),
                    datasets: [{
                        data: categoriasConGastos.map(cat => cat.total),
                        backgroundColor: categoriasConGastos.map(cat => cat.color),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b,
