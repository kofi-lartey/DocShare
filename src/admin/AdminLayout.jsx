import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import CommandPalette from './components/CommandPalette';
import { useAdminStore } from './store';

const META = {
  '/admin/users': { title: 'User Management', subtitle: 'Create, read, update and delete user accounts' },
  '/admin/coupons': { title: 'Marketing & Coupons', subtitle: 'Generate, manage and track discount coupons' },
  '/admin/analytics': { title: 'Analytics', subtitle: 'Key performance indicators & system metrics' },
  '/admin/security': { title: 'Security & Audit', subtitle: 'Audit trail, MFA method and access controls' },
};

export default function AdminLayout() {
  const location = useLocation();
  const meta = META[location.pathname] || { title: 'Admin Console', subtitle: '' };
  const { mobileNavOpen, closeMobileNav } = useAdminStore();

  return (
    <div className="flex h-screen bg-admin-50 dark:bg-admin-950 text-admin-900 dark:text-admin-100 overflow-hidden">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileNav}
              className="lg:hidden fixed inset-0 z-40 bg-admin-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50"
            >
              <AdminSidebar variant="drawer" onNavigate={closeMobileNav} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
