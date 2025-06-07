import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Hook personalizado para acceder fácilmente al contexto de autenticación
const useAuth = () => useContext(AuthContext);

export default useAuth;

