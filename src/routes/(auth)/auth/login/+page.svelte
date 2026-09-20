<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    
    import { goto } from "$app/navigation";
    import { PUBLIC_API_URL } from "$env/static/public"; // Ajusta según tus variables de entorno
	import { resolve } from "$app/paths";
	import { ArrowLeft } from "@lucide/svelte";
	import { auth } from "$lib/auth.svelte";

    // Estado reactivo (Svelte 5)
    let email = $state("");
    let password = $state("");
    let loading = $state(false);
    let errorMessage = $state("");

    async function handleLogin(event: Event) {
        event.preventDefault();
        loading = true;
        errorMessage = "";

        try {
            const res = await fetch(`${PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                throw new Error("Correo o contraseña incorrectos.");
            }

            const data = await res.json();
            
            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            await auth.init();
            goto(resolve("/user")); 

        } catch (error) {
            if(error instanceof Error) errorMessage = error.message || "Ocurrió un error al intentar iniciar sesión.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-muted/30 p-4">
    <Card.Root class="w-full max-w-md shadow-lg">
        <Card.Header class="space-y-1 text-center">
            <Button 
                href={resolve("/")} 
                variant="ghost" 
                size="icon" 
                class="absolute left-4 top-4 h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Volver al inicio"
            >
                <ArrowLeft class="h-4 w-4" />
            </Button>
            <Card.Title class="text-2xl font-bold tracking-tight">Iniciar Sesión</Card.Title>
        </Card.Header>
        
        <Card.Content>
            <form onsubmit={handleLogin} class="space-y-4">
                
                {#if errorMessage}
                    <div class="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
                        {errorMessage}
                    </div>
                {/if}

                <div class="space-y-2">
                    <Label for="email">Correo Electrónico</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="hola@xd.com" 
                        bind:value={email} 
                        required 
                        disabled={loading}
                    />
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <Label for="password">Contraseña</Label>
                    </div>
                    <Input 
                        id="password" 
                        type="password" 
                        bind:value={password} 
                        required 
                        disabled={loading}
                    />
                </div>

                <Button type="submit" class="w-full mt-4" disabled={loading}>
                    {#if loading}
                        <span class="animate-pulse">Iniciando sesión...</span>
                    {:else}
                        Ingresar
                    {/if}
                </Button>
                
            </form>
        </Card.Content>
        
        <Card.Footer class="flex justify-center text-sm text-muted-foreground">
            ¿No tienes una cuenta? &nbsp;
            <a href={resolve("/auth/register")} class="text-primary hover:underline font-medium">
                Regístrate
            </a>
        </Card.Footer>
    </Card.Root>

</div>