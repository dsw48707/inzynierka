import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // To mówi: każde zapytanie zaczynające się od /api 
      // przesyłaj do naszego serwera w folderze api (na port 3000)
      '/api': 'http://localhost:3000'
    }
  }
})