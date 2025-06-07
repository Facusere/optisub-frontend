import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Container, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hook de efecto para cargar usuarios al montar el componente
  useEffect(() => {
    // Obtiene la lista de usuarios desde la API y la guarda en el estado
    const fetchUsuarios = async () => {
      try {
        const response = await api.get('/usuarios');
        setUsuarios(response.data);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Usuarios</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {usuarios.map((usuario) => (
            <ListItem key={usuario.id} divider>
              <ListItemText primary={usuario.nombre} secondary={usuario.email} />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default Usuarios;