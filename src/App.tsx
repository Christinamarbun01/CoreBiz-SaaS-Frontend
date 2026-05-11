import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { KanbanBoard } from './components/kanban/KanbanBoard'


function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">{title}</h2>
        <p className="text-gray-400">Halaman ini sedang dalam pengembangan.</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route path="/orders" element={<KanbanBoard />} />
          <Route path="/stock" element={<PlaceholderPage title="Stock" />} />
          <Route path="/customer" element={<PlaceholderPage title="Customer" />} />
          <Route path="/team" element={<PlaceholderPage title="Management Team" />} />
          <Route path="/whatsapp" element={<PlaceholderPage title="Whatsapp Config" />} />
          <Route path="/tenant" element={<PlaceholderPage title="Tenant Management" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
