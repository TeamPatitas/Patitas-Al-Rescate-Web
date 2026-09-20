import { PUBLIC_API_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
    
    try {
        const res = await fetch(`${PUBLIC_API_URL}/swagger/v1/swagger.json`);

        if (!res.ok) {
            error(res.status, 'No se pudo cargar la documentación de la API');
        }

        const swaggerData = await res.json();

        return {
            swaggerData
        };
    } catch (e) {
        console.warn("API inaccesible, usando fallback", e);
        const fallbackRes = await fetch('/docs-fallback.json');
        const swaggerData = await fallbackRes.json();

        return {
            swaggerData
        };
    }
};