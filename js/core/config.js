// js/core/config.js
// Configuración única de Supabase para todas las páginas.
// Debe cargarse DESPUÉS del CDN de Supabase y ANTES de los módulos de página.
(function () {
    'use strict';

    const config = {
        supabaseUrl: 'https://umncnddwzmjxgmvisvqz.supabase.co',
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbmNuZGR3em1qeGdtdmlzdnF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NDIyNzksImV4cCI6MjA3ODExODI3OX0.ODvus28cTCTD8gGewQ2sAZ8PcXbEe4CIy_zv6bip8J0'
    };

    window.HelicopiasConfig = config;

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        console.warn('[config] El CDN de Supabase no está cargado; se omite la creación del cliente.');
        return;
    }

    if (!window.supabaseClient) {
        window.supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
    }

    // Alias histórico: el resto del código usa `supabase.from(...)`.
    window.supabase = window.supabaseClient;
})();
