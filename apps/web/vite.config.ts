import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Vite consumes the workspace packages (@ai-agent-desk/shared, mock-ai) directly
// as TS source via their `exports` field — no separate build step (PRD §14 Step 1).
export default defineConfig({
  plugins: [react()],
});
