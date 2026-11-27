import '@fontsource-variable/nunito'
import { createRoot } from 'react-dom/client'
import MaintenanceView from '@/components/MaintenanceView'

const container = document.getElementById('maintenance-root')

if (container) {
  createRoot(container).render(<MaintenanceView />)
}
