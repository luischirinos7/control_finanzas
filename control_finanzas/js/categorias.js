document.addEventListener('DOMContentLoaded', function() {
    const colorInput = document.getElementById('color-cat');
    const muestra = document.getElementById('muestra-color');
    const valor = document.getElementById('valor-color');
    
    if (colorInput && muestra && valor) {
        colorInput.addEventListener('input', function(e) {
            muestra.style.backgroundColor = e.target.value;
            valor.textContent = e.target.value;
        });
        muestra.style.backgroundColor = colorInput.value;
    }
});