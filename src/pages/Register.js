import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack,
  Select,
  MenuItem
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';

// Maneja el formulario de registro de usuario
const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    moneda_preferida: ''
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const monedas = ['USD', 'ARS', 'EUR', 'Otro'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/register', form);

      // Guardar token y usuario
      localStorage.setItem('token', response.data.token);
      login(response.data.usuario);

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errores) {
        setError(err.response.data.errores[0]?.msg || 'Error de validación');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al registrar usuario.');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Registrarse</Typography>
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <Stack spacing={2}>
            <TextField
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Mostrar/ocultar contraseña"
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Select
              name="moneda_preferida"
              value={form.moneda_preferida}
              onChange={handleChange}
              displayEmpty
              required
            >
              <MenuItem value="" disabled>Seleccionar moneda</MenuItem>
              {monedas.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
            <Button variant="contained" type="submit">Crear cuenta</Button>
            {error && <Alert severity="error">{error}</Alert>}
            <Typography variant="body2">
              ¿Ya tenés cuenta? <Link to="/login">Ingresá aquí</Link>
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;