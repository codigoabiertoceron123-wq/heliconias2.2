// js/core/data.js
// Acceso a datos centralizado. Evita repetir consultas y normalizaciones.
(function () {
    'use strict';

    function client() {
        return window.supabaseClient || window.supabase || null;
    }

    function assertClient() {
        const db = client();
        if (!db || typeof db.from !== 'function') {
            throw new Error('El cliente de Supabase no está disponible.');
        }
        return db;
    }

    async function fetchTable(table, options) {
        const opts = Object.assign({ select: '*', order: null, ascending: true, limit: null }, options || {});
        let query = assertClient().from(table).select(opts.select);
        if (opts.order) query = query.order(opts.order, { ascending: opts.ascending });
        if (opts.limit) query = query.limit(opts.limit);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async function fetchParticipantes(options) {
        return fetchTable('participantes', Object.assign({ order: 'fecha_registro', ascending: false }, options || {}));
    }

    function normalizeText(value) {
        return String(value ?? '').trim();
    }

    function normalizeParticipante(row) {
        const item = Object.assign({}, row);
        item.nombre = normalizeText(item.nombre);
        item.ciudad = normalizeText(item.ciudad);
        item.institucion = normalizeText(item.institucion);
        item.genero = normalizeText(item.genero);
        item.nacionalidad = normalizeText(item.nacionalidad);
        return item;
    }

    function countBy(items, keyFn) {
        return items.reduce((acc, item) => {
            const key = keyFn(item) || 'Sin dato';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }

    function toSortedEntries(counts) {
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }

    window.HData = {
        client, fetchTable, fetchParticipantes,
        normalizeText, normalizeParticipante, countBy, toSortedEntries
    };
})();
