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
  Select,
  MenuItem,
  Box,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Recordatorios = () => {
  const [recordatorios, setRecordatorios] = useState([]);
  const [suscripciones, setSuscripciones] = useState([]);
  const [perfiles, setPerfiles] = useState([]); // Nuevo: perfiles
  const [servicios, setServicios] = useState([]); // Nuevo: servicios
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: null,
    suscripcionId: '',
    tipo: '',
    fechaProgramada: ''
  });

  const tipos = ['Notificación', 'Email', 'SMS'];

  // Hook de efecto para cargar recordatorios, suscripciones, perfiles y servicios al montar el componente
  useEffect(() => {
    fetchAllData();
  }, []);

  // Obtiene la lista de recordatorios, suscripciones, perfiles y servicios desde la API
  const fetchAllData = async () => {
    try {
      const [recordatoriosRes, suscripcionesRes, perfilesRes, serviciosRes] = await Promise.all([
        api.get('/recordatorios'),
        api.get('/suscripciones'),
        api.get('/perfiles'),
        api.get('/servicios')
      ]);
      setRecordatorios(recordatoriosRes.data);
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

  // Carga los datos de un recordatorio en el formulario para editar
  const handleEdit = (r) => {
    setForm({
      id: r.id,
      suscripcionId: r.suscripcionId,
      tipo: r.tipo,
      fechaProgramada: r.fechaProgramada
    });
  };

  // Elimina un recordatorio seleccionado tras confirmación
  const handleDelete = async (id) => {
    if (window.confirm('¿Deseás eliminar este recordatorio?')) {
      try {
        await api.delete(`/recordatorios/${id}`);
        fetchAllData();
      } catch (error) {
        console.error('Error al eliminar recordatorio:', error);
      }
    }
  };

  // Envía el formulario para crear o actualizar un recordatorio
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validación: debe haber una suscripción seleccionada
    if (!form.suscripcionId) {
      alert('Seleccioná una suscripción.');
      return;
    }
    // Validación: debe haber tipo y fecha
    if (!form.tipo || !form.fechaProgramada) {
      alert('Completá todos los campos.');
      return;
    }
    // Asegura que el ID sea numérico
    const suscripcionIdNum = parseInt(form.suscripcionId);
    if (isNaN(suscripcionIdNum)) {
      alert('Suscripción inválida.');
      return;
    }
    const payload = {
      suscripcionId: suscripcionIdNum,
      tipo: form.tipo,
      fechaProgramada: form.fechaProgramada
    };

    try {
      if (form.id) {
        await api.put(`/recordatorios/${form.id}`, payload);
      } else {
        await api.post('/recordatorios', payload);
      }

      setForm({ id: null, suscripcionId: '', tipo: '', fechaProgramada: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error al guardar recordatorio:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else if (error.response?.data?.errores) {
        alert(error.response.data.errores[0]?.msg || 'Error de validación');
      } else {
        alert('Error al guardar recordatorio.');
      }
    }
  };

  // Calcula la fecha sugerida de recordatorio: un día antes de la fecha de pago sugerida
  const getFechaRecordatorioSugerida = (suscripcion) => {
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
    // Un día antes
    fecha.setDate(fecha.getDate() - 1);
    return fecha.toISOString().slice(0, 10);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Recordatorios</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Stack spacing={2}>
          {/* Selector de suscripción mostrando nombre de perfil y servicio */}
          <Select
            name="suscripcionId"
            value={form.suscripcionId}
            onChange={handleChange}
            displayEmpty
            required
          >
            <MenuItem value="" disabled>Seleccionar suscripción</MenuItem>
            {suscripciones.map((s) => {
              const perfil = perfiles.find(p => p.id === s.perfilId);
              const servicio = servicios.find(serv => serv.id === s.servicioId);
              return (
                <MenuItem key={s.id} value={s.id}>
                  {perfil ? perfil.nombre : 'Perfil'} - {servicio ? servicio.nombre : 'Servicio'} (${s.monto})
                </MenuItem>
              );
            })}
          </Select>
          <Select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            displayEmpty
            required
          >
            <MenuItem value="" disabled>Seleccionar tipo</MenuItem>
            {tipos.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
          <TextField
            label="Fecha programada"
            name="fechaProgramada"
            type="date"
            value={form.fechaProgramada || (() => {
              const suscripcion = suscripciones.find(s => s.id === parseInt(form.suscripcionId));
              return getFechaRecordatorioSugerida(suscripcion);
            })()}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <Button type="submit" variant="contained">
            {form.id ? 'Actualizar' : 'Agregar'} Recordatorio
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {recordatorios.map((r) => {
            // Opcional: mostrar nombres en la lista de recordatorios
            const suscripcion = suscripciones.find(s => s.id === r.suscripcionId);
            const perfil = perfiles.find(p => p.id === (suscripcion ? suscripcion.perfilId : null));
            const servicio = servicios.find(sv => sv.id === (suscripcion ? suscripcion.servicioId : null));
            return (
              <ListItem key={r.id} divider
                secondaryAction={
                  <>
                    <IconButton onClick={() => handleEdit(r)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(r.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={`${r.tipo} - ${r.fechaProgramada ? r.fechaProgramada.split('T')[0] : ''}`}
                  secondary={`Suscripción: ${perfil ? perfil.nombre : 'Perfil'} - ${servicio ? servicio.nombre : 'Servicio'}${suscripcion ? ` ($${suscripcion.monto})` : ''}`}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Container>
  );
};

export default Recordatorios;
