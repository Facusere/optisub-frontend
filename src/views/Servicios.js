import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    id: null,
    nombre: '',
    categoriaId: ''
  });

  const categorias = [
    { id: 1, nombre: 'Streaming' },
    { id: 2, nombre: 'Almacenamiento' },
    { id: 3, nombre: 'Educación' },
    { id: 4, nombre: 'Productividad y Software' },
    { id: 5, nombre: 'Apps y Servicios Digitales' },
    { id: 6, nombre: 'Compras' },
    { id: 7, nombre: 'Fitness y Salud' },
    { id: 8, nombre: 'Finanzas y Criptomonedas' },
    { id: 9, nombre: 'Creatividad y Pasatiempos' },
    { id: 10, nombre: 'Otros' }
  ];

  // Lista de servicios populares para sugerir
  const serviciosPopulares = [
    'Netflix',
    'Spotify',
    'Amazon Prime Video',
    'Disney+',
    'YouTube Premium',
    'HBO Max',
    'Apple Music',
    'Dropbox',
    'Google Drive',
    'Microsoft 365',
    'PlayStation Plus',
    'Xbox Game Pass',
    'Paramount+',
    'Star+',
    'Deezer',
    'Crunchyroll',
    'Audible',
    'Zoom',
    'Adobe Creative Cloud',
    'LinkedIn Premium',
    'Otro'
  ];

  // Hook de efecto para cargar servicios al montar el componente
  useEffect(() => {
    fetchServicios();
  }, []);

  // Obtiene la lista de servicios desde la API y la guarda en el estado
  const fetchServicios = async () => {
    try {
      const res = await api.get('/servicios');
      setServicios(res.data);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Carga los datos de un servicio en el formulario para editar
  const handleEdit = (servicio) => {
    setForm({
      id: servicio.id,
      nombre: servicio.nombre,
      categoriaId: servicio.categoriaId
    });
  };

  // Elimina un servicio seleccionado tras confirmación
  const handleDelete = async (id) => {
    if (window.confirm('¿Deseás eliminar este servicio?')) {
      try {
        await api.delete(`/servicios/${id}`);
        fetchServicios();
      } catch (error) {
        console.error('Error al eliminar servicio:', error);
        alert('No se pudo eliminar el servicio.');
      }
    }
  };

  // Envía el formulario para crear o actualizar un servicio
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombre || !form.categoriaId) {
      setError('Completá al menos el nombre y la categoría.');
      return;
    }

    const categoriaIdNum = parseInt(form.categoriaId);
    if (isNaN(categoriaIdNum)) {
      setError('Seleccioná una categoría válida.');
      return;
    }

    const payload = {
      nombre: form.nombre,
      categoriaId: categoriaIdNum
    };

    try {
      if (form.id) {
        await api.put(`/servicios/${form.id}`, payload);
      } else {
        await api.post('/servicios', payload);
      }

      setForm({ id: null, nombre: '', categoriaId: '' });
      fetchServicios();
    } catch (error) {
      console.error('Error al guardar servicio:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.errores) {
        setError(error.response.data.errores[0]?.msg || 'Error de validación');
      } else {
        setError('Error al guardar servicio.');
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Servicios</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Stack spacing={2}>
          <Select
            label="Servicio popular"
            name="nombre"
            value={serviciosPopulares.includes(form.nombre) ? form.nombre : 'Otro'}
            onChange={e => {
              const value = e.target.value;
              setForm(f => ({ ...f, nombre: value === 'Otro' ? '' : value }));
            }}
            displayEmpty
            required
          >
            <MenuItem value="" disabled>Seleccionar servicio popular</MenuItem>
            {serviciosPopulares.map((nombre) => (
              <MenuItem key={nombre} value={nombre}>{nombre}</MenuItem>
            ))}
          </Select>
          {/* Si elige "Otro", muestra el campo para ingresar el nombre manualmente */}
          {(!serviciosPopulares.includes(form.nombre) || form.nombre === 'Otro') && (
            <TextField
              label="Nombre del servicio"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          )}
          <Select
            name="categoriaId"
            value={form.categoriaId}
            onChange={handleChange}
            displayEmpty
            required
          >
            <MenuItem value="" disabled>Seleccionar categoría</MenuItem>
            {categorias.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>
            ))}
          </Select>
          <Button type="submit" variant="contained">
            {form.id ? 'Actualizar' : 'Agregar'} Servicio
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {servicios.map((servicio) => {
            const categoria = categorias.find((c) => c.id === servicio.categoriaId);
            return (
              <ListItem key={servicio.id} divider
                secondaryAction={
                  <>
                    <IconButton onClick={() => handleEdit(servicio)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(servicio.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={`${servicio.nombre}`}
                  secondary={`Categoría: ${categoria?.nombre || 'Sin categoría'}`}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Container>
  );
};

export default Servicios;
