import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Navbar from './components/Navbar';
import Usuarios from './views/Usuarios';
import Login from './pages/Login';
import Register from './pages/Register';
import Perfiles from './views/Perfiles';
import Servicios from './views/Servicios';
import Suscripciones from './views/Suscripciones';
import Pagos from './views/Pagos';
import Recordatorios from './views/Recordatorios';
import Dashboard from './views/Dashboard';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/perfiles" element={<PrivateRoute><Perfiles /></PrivateRoute>} />
          <Route path="/servicios" element={<PrivateRoute><Servicios /></PrivateRoute>} />
          <Route path="/suscripciones" element={<PrivateRoute><Suscripciones /></PrivateRoute>} />
          <Route path="/pagos" element={<PrivateRoute><Pagos /></PrivateRoute>} />
          <Route path="/recordatorios" element={<PrivateRoute><Recordatorios /></PrivateRoute>} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
