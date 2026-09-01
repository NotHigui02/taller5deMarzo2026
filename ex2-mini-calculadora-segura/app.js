const CLAVE_HISTORIAL = 'ex2-historial-calculadora';

const OPERACIONES = {
  suma: { simbolo: '+', calcular: (a, b) => a + b },
  resta: { simbolo: '−', calcular: (a, b) => a - b },
  multiplicacion: { simbolo: '×', calcular: (a, b) => a * b },
  division: { simbolo: '÷', calcular: (a, b) => a / b },
};

const $formulario = $('#form-calculadora');
const $numeroA = $('#numero-a');
const $numeroB = $('#numero-b');
const $operacion = $('#operacion');
const $mensaje = $('#mensaje');
const $resultado = $('#resultado');
const $listaHistorial = $('#lista-historial');
const $historialVacio = $('#historial-vacio');

const leerHistorial = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_HISTORIAL));
    return Array.isArray(guardado) ? guardado : [];
  } catch (error) {
    console.warn('No se pudo leer el historial guardado:', error.message);
    return [];
  }
};

let historial = leerHistorial();

const parsearNumero = (valor, etiqueta) => {
  const texto = String(valor).trim();

  if (texto === '') {
    return { ok: false, error: `El ${etiqueta} no puede estar vacío` };
  }

  const numero = Number(texto);

  if (!Number.isFinite(numero)) {
    return { ok: false, error: `El ${etiqueta} debe ser un número válido` };
  }

  return { ok: true, numero };
};

const renderizarHistorial = () => {
  $listaHistorial.empty();
  $historialVacio.toggleClass('hidden', historial.length > 0);

  historial.forEach(({ expresion }) => {
    $listaHistorial.append(`<li>${expresion}</li>`);
  });
};

const mostrarError = (error) => {
  $mensaje.text(error).removeClass('ok').addClass('error');
  $resultado.addClass('hidden').text('');
  console.log('Resultado:', { ok: false, error });
};

const mostrarResultado = (expresion, resultado) => {
  $mensaje.text('Operación válida').removeClass('error').addClass('ok');
  $resultado.removeClass('hidden').text(expresion);
  console.log('Resultado:', { ok: true, resultado, expresion });
};

const guardarHistorial = () => {
  localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
};

const registrarOperacion = (entrada) => {
  historial = [entrada, ...historial];
  guardarHistorial();
  renderizarHistorial();
  console.log('Historial actualizado:', historial);
};

const resolverOperacion = ({ a, b, operacion }) => {
  if (operacion === 'division' && b === 0) {
    return { ok: false, error: 'No se puede dividir por cero' };
  }

  const { simbolo, calcular } = OPERACIONES[operacion];
  const resultado = calcular(a, b);

  if (!Number.isFinite(resultado)) {
    return { ok: false, error: 'El resultado no es un número válido' };
  }

  return { ok: true, simbolo, resultado };
};

const calcular = (evento) => {
  evento.preventDefault();

  const valorA = $numeroA.val();
  const valorB = $numeroB.val();
  const operacion = $operacion.val();

  console.log('Operación solicitada:', {
    numeroA: valorA,
    numeroB: valorB,
    operacion,
  });

  const parsedA = parsearNumero(valorA, 'número A');
  if (!parsedA.ok) {
    mostrarError(parsedA.error);
    return;
  }

  const parsedB = parsearNumero(valorB, 'número B');
  if (!parsedB.ok) {
    mostrarError(parsedB.error);
    return;
  }

  const { numero: a } = parsedA;
  const { numero: b } = parsedB;
  const resolucion = resolverOperacion({ a, b, operacion });

  if (!resolucion.ok) {
    mostrarError(resolucion.error);
    return;
  }

  const { simbolo, resultado } = resolucion;
  const expresion = `${a} ${simbolo} ${b} = ${resultado}`;

  mostrarResultado(expresion, resultado);
  registrarOperacion({ expresion, a, b, operacion, resultado });
};

$(() => {
  renderizarHistorial();
  $formulario.on('submit', (evento) => calcular(evento));
});
