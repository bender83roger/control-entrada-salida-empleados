import { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Reports from './pages/Reports'
import { Clock, Users, FileText } from 'lucide-react'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${apiUrl}/api/employees`)
      setEmployees(response.data.data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📋 Control de Asistencia</h1>
          <div className="flex gap-4">
            <button onClick={() => setCurrentPage('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded ${currentPage === 'dashboard' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}> 
              <Clock size={20} /> Dashboard 
            </button>
            <button onClick={() => setCurrentPage('employees')} className={`flex items-center gap-2 px-4 py-2 rounded ${currentPage === 'employees' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}> 
              <Users size={20} /> Empleados 
            </button>
            <button onClick={() => setCurrentPage('reports')} className={`flex items-center gap-2 px-4 py-2 rounded ${currentPage === 'reports' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}> 
              <FileText size={20} /> Reportes 
            </button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-6">
        {currentPage === 'dashboard' && <Dashboard employees={employees} apiUrl={apiUrl} />}
        {currentPage === 'employees' && <Employees employees={employees} onRefresh={fetchEmployees} apiUrl={apiUrl} />}
        {currentPage === 'reports' && <Reports employees={employees} apiUrl={apiUrl} />}
      </main>
    </div>
  )
}

export default App