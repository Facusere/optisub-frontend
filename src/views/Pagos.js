import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  TextField,
  Button,
  Stack,
  Box,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suscripciones, setSuscripciones] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [servicios, setServicios] = useState([]);

  const [form, setForm] = useState({
    id: null,
    suscripcionId: '',
    fechaPago: '',
    montoPagado: '',
    metodoPago: 'Tarjeta de crédito',
    metodoPagoOtro: ''
  });

  // Hook de efecto para cargar pagos y suscripciones al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  // Obtiene la lista de pagos y suscripciones desde la API
  const fetchData = async () => {
    try {
      const [pagosRes, suscripcionesRes, perfilesRes, serviciosRes] = await Promise.all([
        api.get('/pagos'),
        api.get('/suscripciones'),
        api.get('/perfiles'),
        api.get('/servicios')
      ]);
      setPagos(pagosRes.data);
      setSuscripciones(suscripcionesRes.data);
      setPerfiles(perfilesRes.data);
      setServicios(serviciosRes.data);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Envía el formulario para crear o actualizar un pago
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validación extra: si no hay suscripción seleccionada, no enviar
    if (!form.suscripcionId) {
      alert('Seleccioná una suscripción.');
      return;
    }
    const suscripcion = suscripciones.find(s => s.id === parseInt(form.suscripcionId));
    if (!suscripcion) {
      alert('La suscripción seleccionada no existe.');
      return;
    }
    // Validación de fecha de pago
    if (!esFechaPagoValida(form.fechaPago, suscripcion)) {
      alert('No se puede registrar un pago antes de la fecha de inicio de la suscripción.');
      return;
    }
    // Validación extra: monto debe ser un número válido
    const montoPagado = form.montoPagado || suscripcion.monto;
    if (!montoPagado || isNaN(parseFloat(montoPagado))) {
      alert('El monto es inválido.');
      return;
    }
    const payload = {
      suscripcionId: parseInt(form.suscripcionId),
      fechaPago: form.fechaPago,
      montoPagado: parseFloat(montoPagado),
      metodoPago: form.metodoPago === 'Otro' ? form.metodoPagoOtro : form.metodoPago,
      // Agregar moneda del pago según la suscripción
      moneda: suscripcion.moneda
    };

    try {
      if (form.id) {
        await api.put(`/pagos/${form.id}`, payload);
      } else {
        await api.post('/pagos', payload);
      }
      setForm({ id: null, suscripcionId: '', fechaPago: '', montoPagado: '', metodoPago: 'Tarjeta de crédito', metodoPagoOtro: '' });
      fetchData();
    } catch (error) {
      console.error('Error al guardar pago:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else if (error.response?.data?.errores) {
        alert(error.response.data.errores[0]?.msg || 'Error de validación');
      } else {
        alert('Error al guardar pago.');
      }
    }
  };

  // Carga los datos de un pago en el formulario para editar
  const handleEdit = (p) => {
    setForm({
      id: p.id,
      suscripcionId: p.suscripcionId,
      fechaPago: p.fechaPago,
      montoPagado: p.montoPagado,
      metodoPago: ['Tarjeta de crédito', 'Débito automático', 'MercadoPago'].includes(p.metodoPago) ? p.metodoPago : 'Otro',
      metodoPagoOtro: ['Tarjeta de crédito', 'Débito automático', 'MercadoPago'].includes(p.metodoPago) ? '' : p.metodoPago
    });
  };

  // Elimina un pago seleccionado tras confirmación
  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este pago?')) {
      try {
        await api.delete(`/pagos/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error al eliminar pago:', error);
      }
    }
  };

  // Calcula la fecha sugerida de pago según la fecha de inicio de la suscripción y la frecuencia
  const getFechaPagoSugerida = (suscripcion) => {
    if (!suscripcion || !suscripcion.fechaInicio) return '';
    const inicio = new Date(suscripcion.fechaInicio);
    const hoy = new Date();
    let fecha = new Date(inicio);
    while (fecha < hoy) {
      if (suscripcion.frecuencia === 'Mensual') {
        fecha.setMonth(fecha.getMonth() + 1);
      } else if (suscripcion.frecuencia === 'Anual') {
        fecha.setFullYear(fecha.getFullYear() + 1);
      } else if (suscripcion.frecuencia === 'Semanal') {
        fecha.setDate(fecha.getDate() + 7);
      } else {
        break;
      }
    }
    // Si la fecha calculada es mayor a hoy, retrocede un periodo
    if (fecha > hoy) {
      if (suscripcion.frecuencia === 'Mensual') {
        fecha.setMonth(fecha.getMonth() - 1);
      } else if (suscripcion.frecuencia === 'Anual') {
        fecha.setFullYear(fecha.getFullYear() - 1);
      } else if (suscripcion.frecuencia === 'Semanal') {
        fecha.setDate(fecha.getDate() - 7);
      }
    }
    // Devuelve en formato yyyy-mm-dd
    return fecha.toISOString().slice(0, 10);
  };

  // Devuelve true si la fecha de pago es válida para la suscripción
  const esFechaPagoValida = (fechaPago, suscripcion) => {
    if (!fechaPago || !suscripcion || !suscripcion.fechaInicio) return false;
    // Comparar solo yyyy-mm-dd como string para evitar problemas de zona horaria
    const inicioStr = new Date(suscripcion.fechaInicio).toISOString().slice(0, 10);
    const pagoStr = new Date(fechaPago).toISOString().slice(0, 10);
    return pagoStr >= inicioStr;
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Pagos</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Suscripción</InputLabel>
            <Select
              name="suscripcionId"
              value={form.suscripcionId}
              label="Suscripción"
              onChange={handleChange}
              required
            >
              {suscripciones.map((s) => {
                // Busca el perfil y servicio asociados a la suscripción
                const perfil = perfiles?.find(pf => pf.id === s.perfilId);
                const servicio = servicios?.find(sv => sv.id === s.servicioId);
                return (
                  <MenuItem key={s.id} value={s.id}>
                    {perfil ? perfil.nombre : 'Perfil'} - {servicio ? servicio.nombre : 'Servicio'} (${s.monto})
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <TextField
            label="Fecha de Pago"
            name="fechaPago"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.fechaPago || (() => {
              const suscripcion = suscripciones.find(s => s.id === parseInt(form.suscripcionId));
              // Si hay suscripción, usar la fecha de inicio
              return suscripcion ? suscripcion.fechaInicio?.slice(0, 10) : '';
            })()}
            onChange={handleChange}
            required
          />

          <TextField
            label="Monto Pagado"
            name="montoPagado"
            value={form.montoPagado || (() => {
              const suscripcion = suscripciones.find(s => s.id === parseInt(form.suscripcionId));
              return suscripcion ? suscripcion.monto : '';
            })()}
            onChange={handleChange}
            required
          />

          <FormControl fullWidth>
            <InputLabel>Método de Pago</InputLabel>
            <Select
              name="metodoPago"
              value={form.metodoPago}
              label="Método de Pago"
              onChange={handleChange}
              required
            >
              <MenuItem value="Tarjeta de crédito">Tarjeta de crédito</MenuItem>
              <MenuItem value="Débito automático">Débito automático</MenuItem>
              <MenuItem value="MercadoPago">MercadoPago</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </Select>
          </FormControl>

          {form.metodoPago === 'Otro' && (
            <TextField
              label="Otro método de pago"
              name="metodoPagoOtro"
              value={form.metodoPagoOtro}
              onChange={handleChange}
            />
          )}

          <Button type="submit" variant="contained">
            {form.id ? 'Actualizar Pago' : 'Agregar Pago'}
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {pagos.map((p) => {
            const suscripcion = suscripciones.find((s) => s.id === p.suscripcionId);
            const perfilObj = perfiles.find(pf => pf.id === (suscripcion ? suscripcion.perfilId : null));
            const servicioObj = servicios.find(sv => sv.id === (suscripcion ? suscripcion.servicioId : null));
            const perfilNombre = perfilObj ? perfilObj.nombre : 'Perfil';
            const servicioNombre = servicioObj ? servicioObj.nombre : 'Servicio';
            return (
              <ListItem key={p.id} divider
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => handleEdit(p)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(p.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText
                  primary={`${perfilNombre} - ${servicioNombre} ($${p.montoPagado}) | Método: ${p.metodoPago}`}
                  secondary={`Fecha: ${p.fechaPago}`}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Container>
  );
};

export default Pagos;
