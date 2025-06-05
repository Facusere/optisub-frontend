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
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: null,
    suscripcionId: '',
    tipo: '',
    fechaProgramada: ''
  });

  const tipos = ['Notificación', 'Email', 'SMS'];

  useEffect(() => {
    fetchRecordatorios();
    fetchSuscripciones();
  }, []);

  const fetchRecordatorios = async () => {
    try {
      const res = await api.get('/recordatorios');
      setRecordatorios(res.data);
    } catch (error) {
      console.error('Error al obtener recordatorios:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuscripciones = async () => {
    try {
      const res = await api.get('/suscripciones');
      setSuscripciones(res.data);
    } catch (error) {
      console.error('Error al obtener suscripciones:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (r) => {
    setForm({
      id: r.id,
      suscripcionId: r.suscripcionId,
      tipo: r.tipo,
      fechaProgramada: r.fechaProgramada
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseás eliminar este recordatorio?')) {
      try {
        await api.delete(`/recordatorios/${id}`);
        fetchRecordatorios();
      } catch (error) {
        console.error('Error al eliminar recordatorio:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      suscripcionId: parseInt(form.suscripcionId),
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
      fetchRecordatorios();
    } catch (error) {
      console.error('Error al guardar recordatorio:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Recordatorios</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Stack spacing={2}>
          <Select
            name="suscripcionId"
            value={form.suscripcionId}
            onChange={handleChange}
            displayEmpty
            required
          >
            <MenuItem value="" disabled>Seleccionar suscripción</MenuItem>
            {suscripciones.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {`Servicio ID: ${s.servicioId} / Perfil ID: ${s.perfilId}`}
              </MenuItem>
            ))}
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
            value={form.fechaProgramada}
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
          {recordatorios.map((r) => (
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
                primary={`${r.tipo} - ${r.fechaProgramada}`}
                secondary={`Suscripción ID: ${r.suscripcionId}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default Recordatorios;
