import type { User } from '$lib/utils';
import { PUBLIC_API_URL } from "$env/static/public";
import { goto } from "$app/navigation";
import { resolve } from '$app/paths';

class AuthState {
    user = $state<User | null>(null);

    async init() {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
            this.user = JSON.parse(cachedUser);
        }

        const token = localStorage.getItem('token');
        if (!token) {
            this.user = null;
            return;
        }

        try {
            const res = await fetch(`${PUBLIC_API_URL}/admin/user`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const freshUser = await res.json();
                this.user = freshUser;
                localStorage.setItem('user', JSON.stringify(freshUser)); 
            } else if (res.status === 401) {
                this.logout();
            }
        } catch (error) {
            console.error("Error sincronizando usuario:", error);
        }
    }

    logout() {
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        goto(resolve('/auth/login'));
    }
}

export const auth = new AuthState();