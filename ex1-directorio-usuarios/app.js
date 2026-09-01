const API_USUARIOS = 'https://jsonplaceholder.typicode.com/users';

let usuarios = [];

const $cuerpoTabla = $('#cuerpo-usuarios');
const $filtro = $('#filtro-nombre');
const $estado = $('#estado-filtro');
const $mensajeVacio = $('#mensaje-vacio');
const $panelDetalle = $('#panel-detalle');
const $fondoDetalle = $('#fondo-detalle');

const formatearDireccion = ({ street, suite, city, zipcode }) =>
  `${street}, ${suite}, ${city} ${zipcode}`;

const renderizarTabla = (lista) => {
  $cuerpoTabla.empty();

  lista.forEach(({ id, name, email, company }) => {
    const fila = `
      <tr data-id="${id}" tabindex="0">
        <td>${name}</td>
        <td>${email}</td>
        <td>${company.name}</td>
      </tr>
    `;
    $cuerpoTabla.append(fila);
  });

  $mensajeVacio.toggleClass('hidden', lista.length > 0);
};

const actualizarEstado = (cantidad, termino) => {
  const texto = termino
    ? `${cantidad} coincidencia${cantidad === 1 ? '' : 's'} para “${termino}”`
    : `${cantidad} usuario${cantidad === 1 ? '' : 's'} cargado${cantidad === 1 ? '' : 's'}`;

  $estado.text(texto);
};

const filtrarUsuarios = (termino) => {
  const consulta = termino.trim().toLowerCase();

  const coincidencias = usuarios.filter(({ name }) =>
    name.toLowerCase().includes(consulta)
  );

  console.log('Filtro aplicado:', {
    termino: termino.trim() || '(vacío)',
    coincidencias: coincidencias.length,
  });

  renderizarTabla(coincidencias);
  actualizarEstado(coincidencias.length, termino.trim());
};

const cerrarDetalle = () => {
  $panelDetalle.addClass('hidden');
  $fondoDetalle.addClass('hidden').attr('aria-hidden', 'true');
};

const mostrarDetalle = (usuario) => {
  const { name, phone, address } = usuario;
  const direccion = formatearDireccion(address);

  $('#detalle-nombre').text(name);
  $('#detalle-telefono').text(phone);
  $('#detalle-direccion').text(direccion);

  $panelDetalle.removeClass('hidden');
  $fondoDetalle.removeClass('hidden').attr('aria-hidden', 'false');

  console.log('Detalle del usuario seleccionado:', {
    nombre: name,
    telefono: phone,
    direccion,
    address,
  });
};

const cargarUsuarios = async () => {
  try {
    const { data } = await axios.get(API_USUARIOS);
    usuarios = data;

    const [primeraFila] = usuarios;

    console.log('Usuarios cargados:', {
      cantidad: usuarios.length,
      primeraFila,
    });

    renderizarTabla(usuarios);
    actualizarEstado(usuarios.length, '');
  } catch (error) {
    const mensaje = error.message || 'No se pudieron cargar los usuarios';
    $estado.text(`Error: ${mensaje}`);
    $mensajeVacio
      .text('No fue posible obtener el directorio. Revisa la consola.')
      .removeClass('hidden');

    console.error('Error al cargar usuarios:', {
      mensaje,
      detalle: error,
    });
  }
};

$(() => {
  cargarUsuarios();

  $filtro.on('input', ({ target }) => {
    filtrarUsuarios(target.value);
  });

  $cuerpoTabla.on('click', 'tr', ({ currentTarget }) => {
    const id = Number($(currentTarget).data('id'));
    const usuario = usuarios.find((u) => u.id === id);
    if (usuario) mostrarDetalle(usuario);
  });

  $cuerpoTabla.on('keydown', 'tr', (evento) => {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      $(evento.currentTarget).trigger('click');
    }
  });

  $('#cerrar-detalle').on('click', () => cerrarDetalle());
  $fondoDetalle.on('click', () => cerrarDetalle());

  $(document).on('keydown', ({ key }) => {
    if (key === 'Escape' && !$panelDetalle.hasClass('hidden')) {
      cerrarDetalle();
    }
  });
});
