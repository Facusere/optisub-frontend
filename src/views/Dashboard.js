import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Box
} from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';

const Dashboard = () => {
  const [pagos, setPagos] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hook de efecto para cargar datos de pagos, recordatorios y suscripciones al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pagosRes, recordatoriosRes, suscripcionesRes] = await Promise.all([
          api.get('/pagos'),
          api.get('/recordatorios'),
          api.get('/suscripciones')
        ]);
        setPagos(pagosRes.data);
        setRecordatorios(recordatoriosRes.data);
        setSuscripciones(suscripcionesRes.data);
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
  const suscripcionesActivas = suscripciones.filter(s => s.activa).length;

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

  const mesData = Object.entries(pagosPorMes).map(([mes, monto]) => ({
    name: mes,
    monto
  }));

  // Agrupa los pagos por moneda
  const monedas = Array.from(new Set(pagos.map(p => p.moneda)));
  const pagosPorMesYMoneda = {};
  monedas.forEach(moneda => {
    pagosPorMesYMoneda[moneda] = pagos.filter(p => p.moneda === moneda).reduce((acc, pago) => {
      const mes = new Date(pago.fechaPago).toLocaleString('default', { month: 'short' });
      const monto = Number(pago.montoPagado) || 0;
      acc[mes] = (acc[mes] || 0) + monto;
      return acc;
    }, {});
  });
  const mesDataPorMoneda = {};
  monedas.forEach(moneda => {
    mesDataPorMoneda[moneda] = Object.entries(pagosPorMesYMoneda[moneda]).map(([mes, monto]) => ({
      name: mes,
      monto
    }));
  });

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Dashboard de Gastos</Typography>

      {loading ? <CircularProgress /> : (
        <Grid container spacing={4} columns={{ xs: 4, sm: 8, md: 12 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">Resumen</Typography>
              <Typography>💰 Gasto mensual: ${gastoMensual.toFixed(2)}</Typography>
              <Typography>📅 Próximo cobro: {proximoCobro ? proximoCobro.toLocaleDateString() : 'N/A'}</Typography>
              <Typography>📦 Suscripciones activas: {suscripcionesActivas}</Typography>
            </Paper>
          </Grid>

          {/* Gráficos de barras para ARS, USD y EUR alineados en la misma fila */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['ARS', 'USD', 'EUR'].map((moneda) => {
                // Asegura que los datos estén ordenados por mes real (enero, febrero, ...)
                let data = mesDataPorMoneda[moneda] || [];
                const mesesOrden = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                data = data.sort((a, b) => mesesOrden.indexOf(a.name) - mesesOrden.indexOf(b.name));
                return (
                  <Paper key={moneda} sx={{ p: 2, flex: '1 1 300px', minWidth: 300, maxWidth: 400 }}>
                    <Typography variant="h6" gutterBottom>Costos mensuales en {moneda}</Typography>
                    {data.length === 0 ? (
                      <Typography color="text.secondary">No hay pagos registrados en {moneda}.</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="monto" fill="#1976d2" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {/* DEBUG: log data para ver si hay pagos en esta moneda */}
                    {console.log('Pagos en', moneda, data)}
                  </Paper>
                );
              })}
            </Box>
          </Grid>

          {/* Distribución por método de pago separada por moneda (ARS, USD, EUR) */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['ARS', 'USD', 'EUR'].map((moneda) => {
                // Usa la misma lógica que el gráfico global pero filtrando por moneda
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
                  <Paper key={moneda} sx={{ p: 2, flex: '1 1 300px', minWidth: 300, maxWidth: 400 }}>
                    <Typography variant="h6" gutterBottom>Distribución por método de pago en {moneda}</Typography>
                    {metodoData.length === 0 ? (
                      <Typography color="text.secondary">No hay pagos registrados en {moneda}.</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            dataKey="value"
                            data={metodoData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {metodoData.map((entry, index) => (
                              <Cell key={`cell-${moneda}-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
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
    </Container>
  );
};

export default Dashboard;
