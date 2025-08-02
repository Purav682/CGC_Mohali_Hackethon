import DatabaseAdminPanel from '@/components/admin/database-admin-panel'
import { Header } from '@/components/layout/header'

export default function DatabaseAdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <DatabaseAdminPanel />
      </main>
    </div>
  )
}
