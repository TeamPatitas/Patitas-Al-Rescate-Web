import { PUBLIC_API_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { House, KeyRound, PawPrint, ShieldCheck } from '@lucide/svelte';

export const load: LayoutLoad = async ({ fetch }) => {
    const menuItems = [
        { title: 'Inicio', description: "", icon: null, url: "/docs" },
        { title: 'Administración', description: "Endpoints para administrar 🐒, la mayoría acá solo lo pueden usar devs.", icon: ShieldCheck, url: '/docs/admin' },
        { title: 'Autenticación', description: "El nombre lo dice, aquí hay endpoints para iniciar sesión, registrarse, etc.", icon: KeyRound, url: '/docs/auth' },
        { title: 'Mascotas', description: "Información acerca de las mascotas por cada refugios", icon: PawPrint, url: '/docs/pets' },
        { title: 'Refugios', description: "Refugios 🤌", icon: House, url: '/docs/shelters' }
    ];
    
    try {
        const res = await fetch(`${PUBLIC_API_URL}/swagger/v1/swagger.json`);

        if (!res.ok) {
            error(res.status, 'No se pudo cargar la documentación de la API');
        }

        const swaggerData = await res.json();

        return {
            swaggerData,
            menuItems
        };
    } catch (e) {
        console.warn("API inaccesible, usando fallback", e);
        const fallbackRes = await fetch('/docs-fallback.json');
        const swaggerData = await fallbackRes.json();

        return {
            swaggerData,
            menuItems
        };
    }
};