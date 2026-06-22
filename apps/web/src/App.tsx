import { WorkbenchLayout } from './features/workbench/WorkbenchLayout';

// App root — composes the workbench. Providers (Query / AntD) are applied in
// main.tsx; routing is defined in app/router.tsx.
export default function App() {
  return <WorkbenchLayout />;
}
