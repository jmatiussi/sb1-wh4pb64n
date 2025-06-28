import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PlantProvider } from './contexts/PlantContext';
import { ClassificationProvider } from './contexts/ClassificationContext';
import { ConfigProvider } from './contexts/ConfigContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CadastroPlanta from './pages/CadastroPlanta';
import DetalhesPlanta from './pages/DetalhesPlanta';
import Busca from './pages/Busca';
import EditarPlanta from './pages/EditarPlanta';
import PDFViewer from './pages/PDFViewer';
import Classificacoes from './pages/Classificacoes';

function App() {
  return (
    <ConfigProvider>
      <ClassificationProvider>
        <PlantProvider>
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <Layout>
                    <Home />
                  </Layout>
                }
              />
              <Route
                path="/cadastro"
                element={
                  <Layout>
                    <CadastroPlanta />
                  </Layout>
                }
              />
              <Route
                path="/planta/:id"
                element={
                  <Layout>
                    <DetalhesPlanta />
                  </Layout>
                }
              />
              <Route
                path="/editar/:id"
                element={
                  <Layout>
                    <EditarPlanta />
                  </Layout>
                }
              />
              <Route
                path="/busca"
                element={
                  <Layout>
                    <Busca />
                  </Layout>
                }
              />
              <Route
                path="/pdf/:id"
                element={
                  <Layout>
                    <PDFViewer />
                  </Layout>
                }
              />
              <Route
                path="/classificacoes"
                element={
                  <Layout>
                    <Classificacoes />
                  </Layout>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </PlantProvider>
      </ClassificationProvider>
    </ConfigProvider>
  );
}

export default App;