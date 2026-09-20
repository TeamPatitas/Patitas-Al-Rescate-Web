import { Book, House, KeyRound, LayoutList, PawPrint, ShieldCheck, SquareText } from "@lucide/svelte";
import type { Component } from "svelte";

export { cn } from "cn";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export interface EndpointInfo {
    id: string;
    apiname: string;
    path: string;
    method: string;
    description: string | undefined;
    roles?: string;
    cooldown: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters: any[];
    reqSchema: string | null;
    resSchema: string | null;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractEndpoints(swaggerData: any, filterPrefix: string): EndpointInfo[] {
    const paths = swaggerData?.paths || {};
    const list: EndpointInfo[] = [];
    
    for (const [pathUrl, methods] of Object.entries(paths)) {
        
        if (!pathUrl.toLowerCase().startsWith(filterPrefix.toLowerCase())) {
            continue;
        }

        for (const [methodName, details] of Object.entries(methods as object)) {
            
            let reqSchema = null;
            if (details.requestBody?.content) {
                const content = details.requestBody.content;
                const mediaType = content['application/json'] || content['multipart/form-data'] || content['application/x-www-form-urlencoded'];
                if (mediaType?.schema?.$ref) {
                    reqSchema = mediaType.schema.$ref.replace('#/components/schemas/', '');
                }
            }

            let resSchema = null;
            if (details.responses?.['200']?.content) {
                const content = details.responses['200'].content;
                const mediaType = content['application/json'] || content['text/plain'];
                
                if (mediaType?.schema?.$ref) {
                    resSchema = mediaType.schema.$ref.replace('#/components/schemas/', '');
                } else if (mediaType?.schema?.type === 'array' && mediaType.schema.items?.$ref) {
                    resSchema = `Array de ${mediaType.schema.items.$ref.replace('#/components/schemas/', '')}`;
                } else if (mediaType?.schema?.type === 'string') {
                    resSchema = 'Texto plano (String)';
                }
            }

            list.push({
                id: `${methodName}-${pathUrl}`.replace(/[^a-zA-Z0-9]/g, '-'),
                apiname: details.operationId,
                path: pathUrl,
                method: methodName.toUpperCase(),
                description: details.description,
                roles: details['x-roles-policy'],
                cooldown: details['x-cooldown'],
                parameters: details.parameters || [],
                reqSchema,
                resSchema
            });
        }
    }
    return list;
}

export function getMethodColor(method: string): string {
    const colors: Record<string, string> = {
        GET: 'bg-green-500/10 text-green-600 hover:bg-green-500/20',
        POST: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
        PATCH: 'bg-teal-500/10 text-teal-600 hover:bg-teal-500/20',
        DELETE: 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
    };
    return colors[method] || 'bg-gray-500/10 text-gray-600';
}

export interface User {
    firstName?: string;
    lastName?: string;
    email?: string;
    photoUrl?: string; 
    birthDate?: string;
    gender?: number;
    isEmailConfirmed: boolean;
    roles?: string[];
}

export interface Headeroptions {
    title: string,
    icon: Component
}

export const menuItems = {
    "Principal":[
        { title: 'Inicio', description: "", icon: Book, url: "/docs" },
        { title: 'Administración', description: "Endpoints para administrar 🐒, la mayoría acá solo lo pueden usar devs.", icon: ShieldCheck, url: '/docs/admin' },
        { title: 'Autenticación', description: "El nombre lo dice, aquí hay endpoints para iniciar sesión, registrarse, etc.", icon: KeyRound, url: '/docs/auth' },
        { title: 'Mascotas', description: "Información acerca de las mascotas por cada refugios", icon: PawPrint, url: '/docs/pets' },
        { title: 'Refugios', description: "Refugios 🤌", icon: House, url: '/docs/shelters' }
    ],
    "Otros":[
        { title: 'Schemas', description: "", icon: LayoutList, url: "/docs/schemas" },
        { title: 'Enums', description: "", icon: SquareText, url: "/docs/enums"}
    ]
};

export function getMenuItemByUrl(path: string) {
    for (const groupItems of Object.values(menuItems)) {
        const foundItem = groupItems.find(item => item.url === path);
        if (foundItem) {
            return foundItem;
        }
    }
    
    return null;
}