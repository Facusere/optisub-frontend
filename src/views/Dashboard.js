import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress
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

  const gastoMensual = pagos
    .filter(p => new Date(p.fechaPago).getMonth() === new Date().getMonth())
    .reduce((acc, p) => acc + (Number(p.montoPagado) || 0), 0);

  const proximoCobro = recordatorios
    .map(r => new Date(r.fechaProgramada))
    .filter(date => date >= new Date())
    .sort((a, b) => a - b)[0];

  const suscripcionesActivas = suscripciones.filter(s => s.activa).length;

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

          <Grid item xs={12} sm={8} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Distribución por método de pago</Typography>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={8} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Pagos por mes</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mesData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="monto" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;
