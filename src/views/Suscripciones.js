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
  FormControlLabel,
  Checkbox,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Suscripciones = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perfiles, setPerfiles] = useState([]);
  const [servicios, setServicios] = useState([]);

  const [form, setForm] = useState({
    id: null,
    perfilId: '',
    servicioId: '',
    monto: '',
    moneda: 'ARS',
    frecuencia: 'Mensual',
    fechaInicio: '',
    activa: true
  });

  const fetchData = async () => {
    try {
      const [suscripcionesRes, perfilesRes, serviciosRes] = await Promise.all([
        api.get('/suscripciones'),
        api.get('/perfiles'),
        api.get('/servicios')
      ]);
      setSuscripciones(suscripcionesRes.data);
      setPerfiles(perfilesRes.data);
      setServicios(serviciosRes.data);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      perfilId: parseInt(form.perfilId),
      servicioId: parseInt(form.servicioId),
      monto: parseFloat(form.monto),
      moneda: form.moneda,
      frecuencia: form.frecuencia,
      fechaInicio: form.fechaInicio,
      activa: form.activa
    };

    try {
      if (form.id) {
        await api.put(`/suscripciones/${form.id}`, payload);
      } else {
        await api.post('/suscripciones', payload);
      }
      setForm({
        id: null,
        perfilId: '',
        servicioId: '',
        monto: '',
        moneda: 'ARS',
        frecuencia: 'Mensual',
        fechaInicio: '',
        activa: true
      });
      fetchData();
    } catch (error) {
      console.error('Error al guardar suscripción:', error);
    }
  };

  const handleEdit = (s) => {
    setForm({
      id: s.id,
      perfilId: s.perfilId,
      servicioId: s.servicioId,
      monto: s.monto,
      moneda: s.moneda,
      frecuencia: s.frecuencia,
      fechaInicio: s.fechaInicio,
      activa: s.activa
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta suscripción?')) {
      try {
        await api.delete(`/suscripciones/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error al eliminar suscripción:', error);
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Suscripciones</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Perfil</InputLabel>
            <Select name="perfilId" value={form.perfilId} label="Perfil" onChange={handleChange} required>
              {perfiles.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Servicio</InputLabel>
            <Select name="servicioId" value={form.servicioId} label="Servicio" onChange={handleChange} required>
              {servicios.map(s => (
                <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="Monto" name="monto" value={form.monto} onChange={handleChange} required />

          <FormControl fullWidth>
            <InputLabel>Moneda</InputLabel>
            <Select name="moneda" value={form.moneda} label="Moneda" onChange={handleChange} required>
              <MenuItem value="ARS">ARS</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Frecuencia</InputLabel>
            <Select name="frecuencia" value={form.frecuencia} label="Frecuencia" onChange={handleChange} required>
              <MenuItem value="Anual">Anual</MenuItem>
              <MenuItem value="Mensual">Mensual</MenuItem>
              <MenuItem value="Semanal">Semanal</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Fecha de Inicio"
            name="fechaInicio"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.fechaInicio}
            onChange={handleChange}
            required
          />

          <FormControlLabel
            control={<Checkbox name="activa" checked={form.activa} onChange={handleChange} />}
            label="Activa"
          />

          <Button type="submit" variant="contained">
            {form.id ? 'Actualizar Suscripción' : 'Agregar Suscripción'}
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {suscripciones.map((s) => (
            <ListItem key={s.id} divider
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton onClick={() => handleEdit(s)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(s.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={`Monto: ${s.monto} ${s.moneda}`}
                secondary={`Frecuencia: ${s.frecuencia}, Activa: ${s.activa ? 'Sí' : 'No'}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default Suscripciones;
