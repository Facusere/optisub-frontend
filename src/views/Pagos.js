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

  const [form, setForm] = useState({
    id: null,
    suscripcionId: '',
    fechaPago: '',
    montoPagado: '',
    metodoPago: 'Tarjeta de crédito',
    metodoPagoOtro: ''
  });

  const fetchData = async () => {
    try {
      const [pagosRes, suscripcionesRes] = await Promise.all([
        api.get('/pagos'),
        api.get('/suscripciones')
      ]);
      setPagos(pagosRes.data);
      setSuscripciones(suscripcionesRes.data);
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      suscripcionId: parseInt(form.suscripcionId),
      fechaPago: form.fechaPago,
      montoPagado: parseFloat(form.montoPagado),
      metodoPago: form.metodoPago === 'Otro' ? form.metodoPagoOtro : form.metodoPago
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
    }
  };

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
              {suscripciones.map((s) => (
                <MenuItem key={s.id} value={s.id}>ID #{s.id} - {s.moneda} {s.monto}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Fecha de Pago"
            name="fechaPago"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.fechaPago}
            onChange={handleChange}
            required
          />

          <TextField
            label="Monto Pagado"
            name="montoPagado"
            value={form.montoPagado}
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
          {pagos.map((p) => (
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
                primary={`Monto: ${p.montoPagado} | Método: ${p.metodoPago}`}
                secondary={`Fecha: ${p.fechaPago} | Suscripción ID: ${p.suscripcionId}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default Pagos;
