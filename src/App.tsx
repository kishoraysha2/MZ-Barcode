import React, { useEffect } from 'react';
import { MainLayout } from './renderer/layouts/MainLayout';
import { DashboardPage } from './renderer/pages/DashboardPage';
import { GeneratorPage } from './renderer/pages/GeneratorPage';
import { HistoryPage } from './renderer/pages/HistoryPage';
import { DesignerPage } from './renderer/pages/DesignerPage';
import { UsersPage } from './renderer/pages/UsersPage';
import { SettingsPage } from './renderer/pages/SettingsPage';
import { LicensePage } from './renderer/pages/LicensePage';
import { BackupPage } from './renderer/pages/BackupPage';
import { ProductsPage } from './renderer/pages/ProductsPage';
import { MasterPage } from './renderer/components/master/MasterPage';
import { BarcodeScannerView } from './views/BarcodeScannerView';
import { OwnerConsoleView } from './views/OwnerConsoleView';
import { useApplicationStatusStore } from './renderer/stores/applicationStatusStore';
import { useThemeStore } from './renderer/stores/themeStore';
import { electronBridge } from './preload/bridge';

export function App() {
  const { edition, activeView } = useApplicationStatusStore();
  const { darkMode } = useThemeStore();

  // Initialize theme class and electron IPC bridge on startup
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Ping IPC Foundation Database Status
    electronBridge.getDatabaseStatus().then((res) => {
      console.log('[MZ Foundation] IPC Database Status:', res);
    });
  }, [darkMode]);

  return (
    <MainLayout>
      {edition === 'customer' ? (
        <>
          {activeView === 'dashboard' && <DashboardPage />}
          {activeView === 'products' && <ProductsPage />}
          {activeView === 'master_categories' && <MasterPage moduleName="categories" />}
          {activeView === 'master_units' && <MasterPage moduleName="units" />}
          {activeView === 'master_brands' && <MasterPage moduleName="brands" />}
          {activeView === 'master_warehouses' && <MasterPage moduleName="warehouses" />}
          {activeView === 'master_suppliers' && <MasterPage moduleName="suppliers" />}
          {activeView === 'scanner' && <BarcodeScannerView />}
          {activeView === 'generator' && <GeneratorPage />}
          {activeView === 'history' && <HistoryPage />}
          {activeView === 'designer' && <DesignerPage />}
          {activeView === 'users' && <UsersPage />}
          {activeView === 'backup' && <BackupPage />}
          {activeView === 'settings' && <SettingsPage />}
          {activeView === 'license' && <LicensePage />}
        </>
      ) : (
        <OwnerConsoleView />
      )}
    </MainLayout>
  );
}

export default App;
