import { Navigate, createBrowserRouter } from 'react-router'
import { PaginaBusca } from '@/features/busca/pages/PaginaBusca'
import { PaginaVeiculo } from '@/features/veiculo/pages/PaginaVeiculo'
import { Layout } from '../layout/Layout'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/busca" replace /> },
      { path: '/busca', element: <PaginaBusca /> },
      { path: '/veiculo/:id', element: <PaginaVeiculo /> },
    ],
  },
])
