import React from 'react';
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Componente de barra de navegación superior con enlaces a las distintas secciones
const Navbar = () => {
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
          <Button color="inherit" component={RouterLink} to="/usuarios">Usuarios</Button>
          <Button color="inherit" component={RouterLink} to="/perfiles">Perfiles</Button>
          <Button color="inherit" component={RouterLink} to="/servicios">Servicios</Button>
          <Button color="inherit" component={RouterLink} to="/suscripciones">Suscripciones</Button>
          <Button color="inherit" component={RouterLink} to="/pagos">Pagos</Button>
          <Button color="inherit" component={RouterLink} to="/recordatorios">Recordatorios</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
