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
  IconButton,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Perfiles = () => {
  const [perfiles, setPerfiles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    id: null,
    nombre: '',
    tipo: '',
    usuarioId: ''
  });

  // ✅ Eliminamos "Otro" para evitar error con isIn
  const tipos = ['Principal', 'Secundario', 'Niños'];

  useEffect(() => {
    fetchPerfiles();
    fetchUsuarios();
  }, []);

  const fetchPerfiles = async () => {
    try {
      const res = await api.get('/perfiles');
      setPerfiles(res.data);
    } catch (error) {
      console.error('Error al obtener perfiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (perfil) => {
    setForm({
      id: perfil.id,
      nombre: perfil.nombre,
      tipo: perfil.tipo,
      usuarioId: perfil.usuarioId
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseás eliminar este perfil?')) {
      try {
        await api.delete(`/perfiles/${id}`);
        fetchPerfiles();
      } catch (error) {
        console.error('Error al eliminar perfil:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombre || !form.tipo || !form.usuarioId) {
      setError('Por favor completá todos los campos.');
      return;
    }

    const payload = {
      nombre: form.nombre,
      tipo: form.tipo,
      usuarioId: parseInt(form.usuarioId)
    };

    try {
      if (form.id) {
        await api.put(`/perfiles/${form.id}`, payload);
      } else {
        await api.post('/perfiles', payload);
      }

      setForm({ id: null, nombre: '', tipo: '', usuarioId: '' });
      fetchPerfiles();
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.errores) {
        setError(error.response.data.errores[0]?.msg || 'Error de validación');
      } else {
        setError('Error al guardar perfil.');
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Perfiles</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Stack spacing={2}>
          <TextField
            label="Nombre del perfil"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
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
          <Select
            name="usuarioId"
            value={form.usuarioId}
            onChange={handleChange}
            displayEmpty
            required
          >
            <MenuItem value="" disabled>Seleccionar usuario</MenuItem>
            {usuarios.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.nombre} ({u.email})
              </MenuItem>
            ))}
          </Select>
          <Button type="submit" variant="contained">
            {form.id ? 'Actualizar' : 'Agregar'} Perfil
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {perfiles.map((perfil) => {
            const usuario = usuarios.find((u) => u.id === perfil.usuarioId);
            return (
              <ListItem key={perfil.id} divider
                secondaryAction={
                  <>
                    <IconButton onClick={() => handleEdit(perfil)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(perfil.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={`${perfil.nombre} (${perfil.tipo})`}
                  secondary={
                    usuario
                      ? `Usuario: ${usuario.nombre} (${usuario.email})`
                      : `Usuario ID: ${perfil.usuarioId}`
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Container>
  );
};

export default Perfiles;

