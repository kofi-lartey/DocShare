import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import CommandPalette from './components/CommandPalette';

const META = {
  '/admin/users': { title: 'User Management', subtitle: 'Create, read, update and delete user accounts' },
  '/admin/coupons': { title: 'Marketing & Coupons', subtitle: 'Generate, manage and track discount coupons' },
  '/admin/analytics': { title: 'Analytics', subtitle: 'Key performance indicators & system metrics' },
  '/admin/security': { title: 'Security & Audit', subtitle: 'Audit trail, MFA method and access controls' },
};

export default function AdminLayout() {
  const location = useLocation();
  const meta = META[location.pathname] || { title: 'Admin Console', subtitle: '' };

  return (
    <div className="flex h-screen bg-admin-50 dark:bg-admin-950 text-admin-900 dark:text-admin-100 overflow-hidden">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="max-w-[1400px] mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
