import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Legend
} from 'recharts';
import { TrendingUp, CalendarToday, Subscriptions, AccessAlarm, Warning } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const monedas = ['ARS', 'USD', 'EUR'];

const Dashboard = () => {
  const [pagos, setPagos] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSubsModal, setOpenSubsModal] = useState(false);
  const [openCobrosModal, setOpenCobrosModal] = useState(false);
  const [openRecordatoriosModal, setOpenRecordatoriosModal] = useState(false);
  const [openCobros7Modal, setOpenCobros7Modal] = useState(false);
  // Estados para servicios y perfiles
  const [servicios, setServicios] = useState([]);
  const [perfiles, setPerfiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pagosRes, recordatoriosRes, suscripcionesRes, serviciosRes, perfilesRes] = await Promise.all([
          api.get('/pagos'),
          api.get('/recordatorios'),
          api.get('/suscripciones'),
          api.get('/servicios'),
          api.get('/perfiles')
        ]);
        setPagos(pagosRes.data);
        setRecordatorios(recordatoriosRes.data);
        setSuscripciones(suscripcionesRes.data);
        setServicios(serviciosRes.data);
        setPerfiles(perfilesRes.data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Calcula el gasto mensual sumando los pagos del mes actual
  const gastoMensual = pagos
    .filter(p => new Date(p.fechaPago).getMonth() === new Date().getMonth())
    .reduce((acc, p) => acc + (Number(p.montoPagado) || 0), 0);

  // Calcula la fecha del próximo cobro a partir de los recordatorios
  const proximoCobro = recordatorios
    .map(r => new Date(r.fechaProgramada))
    .filter(date => date >= new Date())
    .sort((a, b) => a - b)[0];

  // Calcula la cantidad de suscripciones activas
  const suscripcionesActivasList = suscripciones.filter(s => s.activa);
  const suscripcionesActivas = suscripcionesActivasList.length;

  // Calcula el total pagado por cada método de pago
  const totalPorMetodo = pagos.reduce((acc, pago) => {
    const monto = Number(pago.montoPagado) || 0;
    acc[pago.metodoPago] = (acc[pago.metodoPago] || 0) + monto;
    return acc;
  }, {});

  const metodoData = Object.entries(totalPorMetodo).map(([metodo, monto]) => ({
    name: metodo,
    value: monto
  }));

  const pagosPorMes = pagos.reduce((acc, pago) => {
    const mes = new Date(pago.fechaPago).toLocaleString('default', { month: 'short' });
    const monto = Number(pago.montoPagado) || 0;
    acc[mes] = (acc[mes] || 0) + monto;
    return acc;
  }, {});

  // Array de meses en inglés abreviado para ordenar y mostrar todos los meses
  const mesesOrden = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Generar datos de pagos por mes y moneda, asegurando que todos los meses estén presentes y en orden
  const mesDataPorMoneda = {};
  monedas.forEach(moneda => {
    // Sumar montos por mes para la moneda
    const pagosMes = pagos
      .filter(p => p.moneda === moneda)
      .reduce((acc, pago) => {
        const mes = new Date(pago.fechaPago).toLocaleString('en-US', { month: 'short' });
        const monto = Number(pago.montoPagado) || 0;
        acc[mes] = (acc[mes] || 0) + monto;
        return acc;
      }, {});
    // Asegurar que todos los meses estén presentes
    mesDataPorMoneda[moneda] = mesesOrden.map(mes => ({
      name: mes,
      monto: pagosMes[mes] || 0
    }));
  });

  // Calcula el gasto mensual y total anual por moneda para el resumen
  const gastoMensualPorMoneda = monedas.reduce((acc, moneda) => {
    acc[moneda] = pagos
      .filter(p => p.moneda === moneda && new Date(p.fechaPago).getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + (Number(p.montoPagado) || 0), 0);
    return acc;
  }, {});
  const totalAnualPorMoneda = monedas.reduce((acc, moneda) => {
    acc[moneda] = pagos
      .filter(p => p.moneda === moneda && new Date(p.fechaPago).getFullYear() === new Date().getFullYear())
      .reduce((sum, p) => sum + (Number(p.montoPagado) || 0), 0);
    return acc;
  }, {});

  // Resumen de pagos por método de pago (mensual y anual)
  const resumenMetodoMensual = pagos.reduce((acc, pago) => {
    const mesActual = new Date().getMonth();
    const pagoMes = new Date(pago.fechaPago).getMonth();
    if (pagoMes === mesActual) {
      const metodo = pago.metodoPago || 'Otro';
      acc[metodo] = (acc[metodo] || 0) + (Number(pago.montoPagado) || 0);
    }
    return acc;
  }, {});
  const resumenMetodoAnual = pagos.reduce((acc, pago) => {
    const anioActual = new Date().getFullYear();
    const pagoAnio = new Date(pago.fechaPago).getFullYear();
    if (pagoAnio === anioActual) {
      const metodo = pago.metodoPago || 'Otro';
      acc[metodo] = (acc[metodo] || 0) + (Number(pago.montoPagado) || 0);
    }
    return acc;
  }, {});

  // Función para obtener el ícono de la moneda (placeholder, se puede reemplazar por íconos reales)
  const getMonedaIcon = (moneda) => {
    const icons = {
      ARS: '💵',
      USD: '💲',
      EUR: '💶'
    };
    return icons[moneda] || '💰';
  };

  // Función para calcular la próxima fecha de cobro según frecuencia
  const getNextDate = (fechaInicio, frecuencia) => {
    const now = new Date();
    let next = new Date(fechaInicio);
    while (next <= now) {
      switch (frecuencia?.toLowerCase()) {
        case 'mensual':
          next.setMonth(next.getMonth() + 1);
          break;
        case 'semanal':
          next.setDate(next.getDate() + 7);
          break;
        case 'anual':
          next.setFullYear(next.getFullYear() + 1);
          break;
        default:
          // Si no hay frecuencia, solo devuelve la fecha de inicio
          next = new Date(now.getTime() + 24 * 60 * 60 * 1000); // mañana
          break;
      }
    }
    return next;
  };

  // Notificaciones de cobros próximos (próximos 7 días)
  const hoy = new Date();
  const proximosCobros = suscripcionesActivasList.map(s => {
    const proximaFecha = getNextDate(s.fechaInicio, s.frecuencia);
    return {
      ...s,
      proximaFecha
    };
  }).filter(s => (s.proximaFecha - hoy) / (1000 * 60 * 60 * 24) <= 7);

  return (
    <Container>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          mb: 2,
          letterSpacing: 1,
          color: '#1976d2',
          textShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
        }}
      >
        Dashboard de Gastos
      </Typography>
      {/* Indicadores visuales mejorados */}
      <Grid
        container
        spacing={3}
        sx={{
          mb: 2,
          justifyContent: 'center',
          alignItems: 'stretch'
        }}
      >
        {/* Botones principales en una sola fila, responsivos */}
        <Grid item xs={12}>
          <Grid container spacing={3} justifyContent="center" alignItems="stretch">
            <Grid item xs={12} sm={6} md={3}>
              {/* Botón mejorado de Próximo cobro */}
              <Paper
                elevation={6}
                sx={{
                  p: 3,
                  minWidth: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #e8f5e9 60%, #c8e6c9 100%)',
                  borderRadius: 4,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.03)',
                    boxShadow: 10,
                    background: 'linear-gradient(135deg, #c8e6c9 60%, #e8f5e9 100%)'
                  },
                  cursor: 'pointer',
                  height: '100%'
                }}
                onClick={() => setOpenCobrosModal(true)}
              >
                <TrendingUp color="success" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Próximo cobro
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#388e3c' }}>
                  {proximoCobro ? proximoCobro.toLocaleDateString() : 'N/A'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {/* Botón Suscripciones activas */}
              <Paper
                elevation={6}
                sx={{
                  p: 3,
                  minWidth: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #fff3e0 60%, #ffe0b2 100%)',
                  borderRadius: 4,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.03)',
                    boxShadow: 10,
                    background: 'linear-gradient(135deg, #ffe0b2 60%, #fff3e0 100%)'
                  },
                  cursor: 'pointer',
                  height: '100%'
                }}
                onClick={() => setOpenSubsModal(true)}
              >
                <Subscriptions color="warning" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Suscripciones activas
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {suscripcionesActivas}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {/* Botón Próximos cobros (7 días) */}
              <Paper
                elevation={6}
                sx={{
                  p: 3,
                  minWidth: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #ffebee 60%, #ffcdd2 100%)',
                  borderRadius: 4,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.03)',
                    boxShadow: 10,
                    background: 'linear-gradient(135deg, #ffcdd2 60%, #ffebee 100%)'
                  },
                  cursor: 'pointer',
                  height: '100%'
                }}
                onClick={() => setOpenCobros7Modal(true)}
              >
                <AccessAlarm color="error" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Próximos cobros (7 días)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                  {proximosCobros.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {/* Botón Recordatorios */}
              <Paper
                elevation={6}
                sx={{
                  p: 3,
                  minWidth: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #e1f5fe 60%, #b3e5fc 100%)',
                  borderRadius: 4,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.03)',
                    boxShadow: 10,
                    background: 'linear-gradient(135deg, #b3e5fc 60%, #e1f5fe 100%)'
                  },
                  cursor: 'pointer',
                  height: '100%'
                }}
                onClick={() => setOpenRecordatoriosModal(true)}
              >
                <CalendarToday color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Recordatorios
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0288d1' }}>
                  {recordatorios.length}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {loading ? <CircularProgress /> : (
        <Grid container spacing={4} columns={{ xs: 4, sm: 8, md: 12 }}>
          {/* Resumen por moneda (gasto mensual y anual) */}
          <Grid item xs={12}>
            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={6}
                  sx={{
                    p: 2,
                    minWidth: 200,
                    borderRadius: 4,
                    background: 'linear-gradient(120deg, #e3f2fd 60%, #f5f5f5 100%)',
                    boxShadow: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    height: '100%',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      boxShadow: 10,
                      transform: 'scale(1.03)'
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 700, mb: 1 }}>
                    Gasto mensual por moneda
                  </Typography>
                  {Object.entries(gastoMensualPorMoneda).filter(([moneda]) => moneda && moneda !== 'null').length === 0 ? (
                    <Typography color="text.secondary">Sin pagos este mes</Typography>
                  ) : (
                    Object.entries(gastoMensualPorMoneda)
                      .filter(([moneda]) => moneda && moneda !== 'null')
                      .map(([moneda, monto]) => (
                        <Box key={moneda} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <span style={{ fontSize: 22 }}>{getMonedaIcon(moneda)}</span>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{moneda}:</Typography>
                          <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 900, fontSize: 22 }}>${monto.toFixed(2)}</Typography>
                        </Box>
                      ))
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={6}
                  sx={{
                    p: 2,
                    minWidth: 200,
                    borderRadius: 4,
                    background: 'linear-gradient(120deg, #e3f2fd 60%, #f5f5f5 100%)',
                    boxShadow: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    height: '100%',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      boxShadow: 10,
                      transform: 'scale(1.03)'
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 700, mb: 1 }}>
                    Total anual por moneda
                  </Typography>
                  {Object.entries(totalAnualPorMoneda).filter(([moneda]) => moneda && moneda !== 'null').length === 0 ? (
                    <Typography color="text.secondary">Sin pagos este año</Typography>
                  ) : (
                    Object.entries(totalAnualPorMoneda)
                      .filter(([moneda]) => moneda && moneda !== 'null')
                      .map(([moneda, monto]) => (
                        <Box key={moneda} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <span style={{ fontSize: 22 }}>{getMonedaIcon(moneda)}</span>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{moneda}:</Typography>
                          <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 900, fontSize: 22 }}>${monto.toFixed(2)}</Typography>
                        </Box>
                      ))
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={6}
                  sx={{
                    p: 2,
                    minWidth: 200,
                    borderRadius: 4,
                    background: 'linear-gradient(120deg, #e3f2fd 60%, #f5f5f5 100%)',
                    boxShadow: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    height: '100%',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      boxShadow: 10,
                      transform: 'scale(1.03)'
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 700, mb: 1 }}>
                    Pagos mensuales por método
                  </Typography>
                  {Object.entries(resumenMetodoMensual).length === 0 ? (
                    <Typography color="text.secondary">Sin pagos este mes</Typography>
                  ) : (
                    Object.entries(resumenMetodoMensual).map(([metodo, monto]) => (
                      <Box key={metodo} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{metodo}:</Typography>
                        <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 900, fontSize: 22 }}>${monto.toFixed(2)}</Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={6}
                  sx={{
                    p: 2,
                    minWidth: 200,
                    borderRadius: 4,
                    background: 'linear-gradient(120deg, #e3f2fd 60%, #f5f5f5 100%)',
                    boxShadow: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    height: '100%',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      boxShadow: 10,
                      transform: 'scale(1.03)'
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 700, mb: 1 }}>
                    Pagos anuales por método
                  </Typography>
                  {Object.entries(resumenMetodoAnual).length === 0 ? (
                    <Typography color="text.secondary">Sin pagos este año</Typography>
                  ) : (
                    Object.entries(resumenMetodoAnual).map(([metodo, monto]) => (
                      <Box key={metodo} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{metodo}:</Typography>
                        <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 900, fontSize: 22 }}>${monto.toFixed(2)}</Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          {/* Gráficos de barras para ARS, USD y EUR alineados en la misma fila */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'stretch',
                mb: 3
              }}
            >
              {['ARS', 'USD', 'EUR'].map((moneda) => {
                let data = mesDataPorMoneda[moneda] || [];
                const mesesOrden = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                data = data.sort((a, b) => mesesOrden.indexOf(a.name) - mesesOrden.indexOf(b.name));
                return (
                  <Paper
                    key={moneda}
                    elevation={6}
                    sx={{
                      p: 3,
                      flex: '1 1 340px',
                      minWidth: 320,
                      maxWidth: 400,
                      borderRadius: 4,
                      background: 'linear-gradient(120deg, #f5f5f5 60%, #e3f2fd 100%)',
                      boxShadow: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      '&:hover': {
                        boxShadow: 10,
                        transform: 'scale(1.03)'
                      }
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 700 }}>
                      Costos mensuales en {moneda}
                    </Typography>
                    {data.length === 0 ? (
                      <Typography color="text.secondary">No hay pagos registrados en {moneda}.</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                          <XAxis dataKey="name" stroke="#1976d2" />
                          <YAxis stroke="#1976d2" />
                          <Tooltip
                            contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #1976d2' }}
                            labelStyle={{ color: '#1976d2', fontWeight: 600 }}
                          />
                          <Bar dataKey="monto" fill="#1976d2" radius={[8, 8, 0, 0]} />
                          <Legend />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Paper>
                );
              })}
            </Box>
          </Grid>

          {/* Distribución por método de pago separada por moneda (ARS, USD, EUR) */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'stretch',
                mb: 3
              }}
            >
              {['ARS', 'USD', 'EUR'].map((moneda) => {
                const totalPorMetodo = pagos
                  .filter(p => p.moneda === moneda)
                  .reduce((acc, pago) => {
                    const monto = Number(pago.montoPagado) || 0;
                    acc[pago.metodoPago] = (acc[pago.metodoPago] || 0) + monto;
                    return acc;
                  }, {});
                const metodoData = Object.entries(totalPorMetodo).map(([metodo, monto]) => ({
                  name: metodo,
                  value: monto
                }));
                return (
                  <Paper
                    key={moneda}
                    elevation={6}
                    sx={{
                      p: 3,
                      flex: '1 1 340px',
                      minWidth: 320,
                      maxWidth: 400,
                      borderRadius: 4,
                      background: 'linear-gradient(120deg, #f5f5f5 60%, #fffde7 100%)',
                      boxShadow: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      '&:hover': {
                        boxShadow: 10,
                        transform: 'scale(1.03)'
                      }
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ color: '#ff9800', fontWeight: 700 }}>
                      Distribución por método de pago en {moneda}
                    </Typography>
                    {metodoData.length === 0 ? (
                      <Typography color="text.secondary">No hay pagos registrados en {moneda}.</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            dataKey="value"
                            data={metodoData}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label
                          >
                            {metodoData.map((entry, index) => (
                              <Cell key={`cell-${moneda}-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #ff9800' }}
                            labelStyle={{ color: '#ff9800', fontWeight: 600 }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Paper>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Modal de próximo cobro */}
      <Dialog open={openCobrosModal} onClose={() => setOpenCobrosModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Próximos cobros
          <IconButton
            aria-label="close"
            onClick={() => setOpenCobrosModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {suscripcionesActivasList.length === 0 ? (
            <Typography color="text.secondary">No hay próximos cobros.</Typography>
          ) : (
            <List>
              {suscripcionesActivasList
                .map((s, idx) => {
                  const servicio = servicios.find(serv => serv.id === s.servicioId);
                  const perfil = perfiles.find(per => per.id === s.perfilId);
                  const nombreServicio = servicio?.nombre || servicio?.titulo || servicio?.descripcion || `Servicio ${s.servicioId}`;
                  const nombrePerfil = perfil?.nombre || perfil?.titulo || perfil?.descripcion || `Perfil ${s.perfilId}`;
                  const proximaFecha = getNextDate(s.fechaInicio, s.frecuencia);
                  return {
                    s,
                    idx,
                    nombreServicio,
                    nombrePerfil,
                    proximaFecha
                  };
                })
                .sort((a, b) => a.proximaFecha - b.proximaFecha)
                .map(({ s, idx, nombreServicio, nombrePerfil, proximaFecha }) => (
                  <ListItem key={s.id || idx} alignItems="flex-start">
                    <ListItemText
                      primary={proximaFecha.toLocaleDateString()}
                      secondary={`${nombreServicio} (${nombrePerfil})`}
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de recordatorios */}
      <Dialog open={openRecordatoriosModal} onClose={() => setOpenRecordatoriosModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Recordatorios
          <IconButton
            aria-label="close"
            onClick={() => setOpenRecordatoriosModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {recordatorios.length === 0 ? (
            <Typography color="text.secondary">No hay recordatorios.</Typography>
          ) : (
            <List>
              {recordatorios
                .map((r, idx) => {
                  const suscripcion = suscripciones.find(s => s.id === r.suscripcionId);
                  const servicio = suscripcion ? servicios.find(serv => serv.id === suscripcion.servicioId) : null;
                  const perfil = suscripcion ? perfiles.find(per => per.id === suscripcion.perfilId) : null;
                  const nombreServicio = servicio?.nombre || servicio?.titulo || servicio?.descripcion || '';
                  const nombrePerfil = perfil?.nombre || perfil?.titulo || perfil?.descripcion || '';
                  let detalle = '';
                  if (r.descripcion || r.titulo) {
                    detalle = r.descripcion || r.titulo;
                  } else if (nombreServicio || nombrePerfil) {
                    detalle = `${nombreServicio}${nombreServicio && nombrePerfil ? ' - ' : ''}${nombrePerfil}`;
                  }
                  return {
                    r,
                    idx,
                    detalle,
                    fecha: new Date(r.fechaProgramada)
                  };
                })
                .sort((a, b) => a.fecha - b.fecha)
                .map(({ r, idx, detalle, fecha }) => (
                  <ListItem key={r.id || idx} alignItems="flex-start">
                    <ListItemText
                      primary={detalle}
                      secondary={fecha.toLocaleDateString()}
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de próximos cobros (7 días) con alerta */}
      <Dialog open={openCobros7Modal} onClose={() => setOpenCobros7Modal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Próximos cobros (7 días)
          <IconButton
            aria-label="close"
            onClick={() => setOpenCobros7Modal(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {proximosCobros.length === 0 ? (
            <Typography color="text.secondary">No hay próximos cobros en los próximos 7 días.</Typography>
          ) : (
            <>
              <Paper elevation={2} sx={{ p: 2, mb: 3, background: '#fffde7', borderLeft: '6px solid #ffa000', display: 'flex', alignItems: 'center', gap: 2, animation: 'fadeIn 1s' }}>
                <Warning color="warning" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="subtitle1" color="warning.main" sx={{ fontWeight: 700 }}>¡Atención! Tienes cobros próximos en los próximos 7 días:</Typography>
                  {proximosCobros
                    .slice()
                    .sort((a, b) => a.proximaFecha - b.proximaFecha)
                    .map((s, idx) => {
                      const servicio = servicios.find(serv => serv.id === s.servicioId);
                      const perfil = perfiles.find(per => per.id === s.perfilId);
                      const nombreServicio = servicio?.nombre || servicio?.titulo || servicio?.descripcion || `Servicio ${s.servicioId}`;
                      const nombrePerfil = perfil?.nombre || perfil?.titulo || perfil?.descripcion || `Perfil ${s.perfilId}`;
                      return (
                        <Typography key={s.id || idx} variant="body2" color="text.secondary">
                          {nombreServicio} ({nombrePerfil}) - {s.proximaFecha.toLocaleDateString()}
                        </Typography>
                      );
                    })}
                </Box>
              </Paper>
              <List>
                {proximosCobros
                  .slice()
                  .sort((a, b) => a.proximaFecha - b.proximaFecha)
                  .map((s, idx) => {
                    const servicio = servicios.find(serv => serv.id === s.servicioId);
                    const perfil = perfiles.find(per => per.id === s.perfilId);
                    const nombreServicio = servicio?.nombre || servicio?.titulo || servicio?.descripcion || `Servicio ${s.servicioId}`;
                    const nombrePerfil = perfil?.nombre || perfil?.titulo || perfil?.descripcion || `Perfil ${s.perfilId}`;
                    return (
                      <ListItem key={s.id || idx} alignItems="flex-start">
                        <ListItemText
                          primary={s.proximaFecha.toLocaleDateString()}
                          secondary={`${nombreServicio} (${nombrePerfil})`}
                        />
                      </ListItem>
                    );
                  })}
              </List>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de suscripciones activas (único y correcto) */}
      <Dialog open={openSubsModal} onClose={() => setOpenSubsModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Suscripciones activas
          <IconButton
            aria-label="close"
            onClick={() => setOpenSubsModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {suscripcionesActivasList.length === 0 ? (
            <Typography color="text.secondary">No hay suscripciones activas.</Typography>
          ) : (
            <List>
              {suscripcionesActivasList.map((s, idx) => {
                const servicio = servicios.find(serv => serv.id === s.servicioId);
                const perfil = perfiles.find(per => per.id === s.perfilId);
                const nombreServicio = servicio?.nombre || servicio?.titulo || servicio?.descripcion || `Servicio ${s.servicioId}`;
                const nombrePerfil = perfil?.nombre || perfil?.titulo || perfil?.descripcion || `Perfil ${s.perfilId}`;
                const proximaFecha = getNextDate(s.fechaInicio, s.frecuencia);
                return (
                  <ListItem key={s.id || idx} alignItems="flex-start">
                    <ListItemText
                      primary={`${nombreServicio} (${nombrePerfil})`}
                      secondary={`Próximo cobro: ${proximaFecha.toLocaleDateString()}`}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Dashboard;