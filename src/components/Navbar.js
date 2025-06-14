import React from 'react';
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componente de barra de navegación superior con enlaces a las distintas secciones
const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Solo el nombre de la app en login y register
  if (location.pathname === '/login' || location.pathname === '/register') {
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/dashboard"
            sx={{ flexGrow: 1, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
          >
            OptiSub
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  // Barra completa en las demás rutas
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/dashboard"
          sx={{ flexGrow: 1, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
        >
          OptiSub
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button color={location.pathname === '/usuarios' ? 'primary' : 'inherit'} component={RouterLink} to="/usuarios">Usuarios</Button>
          <Button color={location.pathname === '/perfiles' ? 'primary' : 'inherit'} component={RouterLink} to="/perfiles">Perfiles</Button>
          <Button color={location.pathname === '/servicios' ? 'primary' : 'inherit'} component={RouterLink} to="/servicios">Servicios</Button>
          <Button color={location.pathname === '/suscripciones' ? 'primary' : 'inherit'} component={RouterLink} to="/suscripciones">Suscripciones</Button>
          <Button color={location.pathname === '/pagos' ? 'primary' : 'inherit'} component={RouterLink} to="/pagos">Pagos</Button>
          <Button color={location.pathname === '/recordatorios' ? 'primary' : 'inherit'} component={RouterLink} to="/recordatorios">Recordatorios</Button>
          {user && (
            <Button color="inherit" onClick={logout} sx={{ ml: 2 }}>
              Salir
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;