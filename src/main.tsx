import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import 'katex/dist/katex.min.css'
import './index.css'
import App from './App.tsx'
import { problemGroups } from './problems'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/grid100/addition" replace /> },
      ...problemGroups.flatMap((group) =>
        group.operators.map((op) => ({
          path: `${group.id}/${op.operator}`,
          element: <op.Component />,
          handle: { groupLabel: group.label, opLabel: op.label },
        }))
      ),
    ],
  },
], { basename: import.meta.env.BASE_URL })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
