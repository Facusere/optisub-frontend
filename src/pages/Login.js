import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack
} from '@mui/material';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });

      localStorage.setItem('token', response.data.token);
      login(response.data.usuario);

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al iniciar sesión.');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Iniciar sesión</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button variant="contained" type="submit">Ingresar</Button>
            {error && <Alert severity="error">{error}</Alert>}
            <Typography variant="body2">
              ¿No tenés cuenta? <Link to="/register">Registrate</Link>
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;