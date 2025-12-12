document.addEventListener("db-ready", inicializarPresupuestos);
document.addEventListener("movimientos-actualizados", cargarPresupuestos);
document.addEventListener("categorias-actualizadas", cargarCategoriasPresupuesto);

async function inicializarPresupuestos() {
    await cargarCategoriasPresupuesto();
    configurarFormularioPresupuesto();
    await cargarPresupuestos();
}

async function cargarCategoriasPresupuesto() {
    const select = document.getElementById("pres-categoria");
    if (!select) return;

    const categorias = await obtenerTodos(STORES.CATEGORIAS);

    select.innerHTML = "";

    const gastos = categorias.filter(c => c.tipo === "gasto");

    if (gastos.length === 0) {
        const op = document.createElement("option");
        op.textContent = "No hay categorías de gasto";
        op.disabled = true;
        select.appendChild(op);
        return;
    }

    gastos.forEach(cat => {
        const op = document.createElement("option");
        op.value = cat.id;
        op.textContent = cat.nombre;
        select.appendChild(op);
    });
}

async function cargarPresupuestos() {
    const lista = document.getElementById("lista-presupuestos");
    const vacio = document.getElementById("pres-vacio");

    if (!lista) return;

    const presupuestos = await obtenerTodos(STORES.PRESUPUESTOS);
    const categorias = await obtenerTodos(STORES.CATEGORIAS);
    const movimientos = await obtenerTodos(STORES.MOVIMIENTOS);

    lista.innerHTML = "";

    if (presupuestos.length === 0) {
        vacio.style.display = "block";
        return;
    }

    vacio.style.display = "none";

    presupuestos.forEach(p => {
        if (isNaN(p.anio) || isNaN(p.mes)) return;

        const categoria = categorias.find(c => c.id === p.categoria);
        if (!categoria || categoria.tipo !== "gasto") return;

        const gastoReal = movimientos
            .filter(m =>
                m.tipo === "gasto" &&
                m.categoria === p.categoria &&
                new Date(m.fecha).getMonth() + 1 === p.mes &&
                new Date(m.fecha).getFullYear() === p.anio
            )
            .reduce((t, m) => t + m.monto, 0);

        const desviacion = p.monto - gastoReal;

        const alertaKey = `presupuesto-alerta-${p.id}`;
        if (desviacion < 0 && !localStorage.getItem(alertaKey)) {
    alert(`Presupuesto sobrepasado en ${categoria.nombre}`);
    localStorage.setItem(alertaKey, "mostrada");
}


        const color =
            desviacion < 0 ? "#c0392b" :
            desviacion === 0 ? "#f39c12" :
            "#27ae60";

        const li = document.createElement("li");
        li.className = "item-lista";
        li.style.gridTemplateColumns = "2fr 1fr 1fr 1fr 100px";

        li.innerHTML = `
            <span>${categoria.nombre}</span>
            <span>${nombreMes(p.mes)} ${p.anio}</span>
            <span>$${p.monto.toFixed(2)}</span>
            <span style="color:${color}; font-weight:bold;">
                ${desviacion >= 0 ? "+" : ""}${desviacion.toFixed(2)}
            </span>
            <span>
                <button class="boton-chico" onclick="editarPresupuesto(${p.id})">Editar</button>
            </span>
        `;

        if (desviacion < 0) {
            li.style.backgroundColor = "#fdecea";
            li.style.borderLeft = "4px solid #c0392b";
        }

        if (gastoReal > p.monto) {
            li.style.background = "#fdecea";
        }

        lista.appendChild(li);
    });
}

function configurarFormularioPresupuesto() {
    const form = document.getElementById("form-presupuesto");
    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const anioValor = document.getElementById("pres-anio").value.trim();
        if (!anioValor || isNaN(anioValor)) {
            alert("Año invalido");
            return;
        }

        const presupuesto = {
            categoria: parseInt(document.getElementById("pres-categoria").value),
            mes: parseInt(document.getElementById("pres-mes").value),
            anio: parseInt(anioValor),
            monto: parseFloat(document.getElementById("pres-monto").value)
        };

        const editId = form.dataset.editando;

        if (editId) {
            presupuesto.id = parseInt(editId);
            await actualizarItem(STORES.PRESUPUESTOS, presupuesto);
        } else {
            await agregarItem(STORES.PRESUPUESTOS, presupuesto);
        }

        form.reset();
        form.dataset.editando = "";

        await cargarCategoriasPresupuesto();
        await cargarPresupuestos();
    });
}

async function editarPresupuesto(id) {
    const p = await obtenerPorId(STORES.PRESUPUESTOS, id);
    if (!p) return;

    const form = document.getElementById("form-presupuesto");

    form.dataset.editando = id;

    document.getElementById("pres-categoria").value = p.categoria;
    document.getElementById("pres-mes").value = p.mes;
    document.getElementById("pres-anio").value = p.anio;
    document.getElementById("pres-monto").value = p.monto;
}

function nombreMes(mes) {
    return [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ][mes - 1];
}
