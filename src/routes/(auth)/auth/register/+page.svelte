<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    
    import { goto } from "$app/navigation";
    import { PUBLIC_API_URL } from "$env/static/public";
    import { resolve } from "$app/paths";
    import { ArrowLeft, Eye, EyeOff } from "@lucide/svelte"; 

    let firstName = $state("");
    let lastName = $state("");
    let email = $state("");
    let password = $state("");
    let confirmPassword = $state("");
    let birthDate = $state("");
    let gender = $state(0);

    let photoFiles = $state<FileList | undefined>(undefined);

    let loading = $state(false);
    let errorMessage = $state("");
    let successMessage = $state("");

    // Estados para mostrar/ocultar contraseñas
    let showPassword = $state(false);
    let showConfirmPassword = $state(false);

    async function handleRegister(event: Event) {
        event.preventDefault();
        loading = true;
        errorMessage = "";
        successMessage = "";

        // Validación de contraseñas
        if (password !== confirmPassword) {
            errorMessage = "Las contraseñas no coinciden.";
            loading = false;
            return;
        }

        try {
            const formData = new FormData();
            formData.append("firstName", firstName);
            formData.append("lastName", lastName);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("birthDate", birthDate);
            formData.append("gender", gender.toString());

            if (photoFiles && photoFiles.length > 0) {
                formData.append("photo", photoFiles[0]);
            }

            const res = await fetch(`${PUBLIC_API_URL}/auth/register`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.message || "Error al registrar el usuario. Revisa los datos.");
            }

            successMessage = "¡Registro exitoso! Redirigiendo al inicio de sesión...";
            
            setTimeout(() => {
                goto(resolve("/auth/login"));
            }, 2000);

        } catch (error) {
            if(error instanceof Error) errorMessage = error.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-12">
    
    <Card.Root class="w-full max-w-lg shadow-lg">
        <Card.Header class="relative space-y-1 text-center">
            <Button 
                href={resolve("/")} 
                variant="ghost" 
                size="icon" 
                class="absolute left-4 top-4 h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Volver al inicio"
            >
                <ArrowLeft class="h-4 w-4" />
            </Button>
            <Card.Title class="text-2xl font-bold tracking-tight mt-2">Crear Cuenta</Card.Title>
        </Card.Header>
        
        <Card.Content>
            <form onsubmit={handleRegister} class="space-y-4">
                
                {#if errorMessage}
                    <div class="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
                        {errorMessage}
                    </div>
                {/if}
                {#if successMessage}
                    <div class="p-3 text-sm text-green-600 bg-green-500/10 rounded-md border border-green-500/20">
                        {successMessage}
                    </div>
                {/if}

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="firstName">Nombre(s) *</Label>
                        <Input id="firstName" bind:value={firstName} required disabled={loading} placeholder="Juan" />
                    </div>
                    <div class="space-y-2">
                        <Label for="lastName">Apellidos *</Label>
                        <Input id="lastName" bind:value={lastName} required disabled={loading} placeholder="Pérez" />
                    </div>
                </div>

                <div class="space-y-2">
                    <Label for="email">Correo Electrónico *</Label>
                    <Input id="email" type="email" bind:value={email} required disabled={loading} placeholder="juan@ejemplo.com" />
                </div>

                <!-- Contraseñas en Grid (2 columnas) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Contraseña Principal -->
                    <div class="space-y-2">
                        <Label for="password">Contraseña *</Label>
                        <div class="relative">
                            <Input 
                                id="password" 
                                type={showPassword ? "text" : "password"} 
                                bind:value={password} 
                                required 
                                disabled={loading} 
                                class="pr-10" 
                            />
                            <button 
                                type="button" 
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                onclick={() => showPassword = !showPassword}
                            >
                                {#if showPassword}
                                    <EyeOff class="h-4 w-4" />
                                {:else}
                                    <Eye class="h-4 w-4" />
                                {/if}
                            </button>
                        </div>
                    </div>

                    <!-- Confirmar Contraseña -->
                    <div class="space-y-2">
                        <Label for="confirmPassword">Confirmar Contraseña *</Label>
                        <div class="relative">
                            <Input 
                                id="confirmPassword" 
                                type={showConfirmPassword ? "text" : "password"} 
                                bind:value={confirmPassword} 
                                required 
                                disabled={loading} 
                                class="pr-10" 
                            />
                            <button 
                                type="button" 
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                onclick={() => showConfirmPassword = !showConfirmPassword}
                            >
                                {#if showConfirmPassword}
                                    <EyeOff class="h-4 w-4" />
                                {:else}
                                    <Eye class="h-4 w-4" />
                                {/if}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="birthDate">Fecha de Nacimiento *</Label>
                        <Input id="birthDate" type="date" bind:value={birthDate} required disabled={loading} />
                    </div>
                    
                    <div class="space-y-2">
                        <Label for="gender">Género *</Label>
                        <select 
                            id="gender" 
                            bind:value={gender} 
                            disabled={loading}
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value={0}>Masculino</option>
                            <option value={1}>Femenino</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label for="photo">Foto de perfil (Opcional)</Label>
                    <Input 
                        id="photo" 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp" 
                        bind:files={photoFiles} 
                        disabled={loading} 
                    />
                </div>

                <Button type="submit" class="w-full mt-6" disabled={loading}>
                    {#if loading}
                        <span class="animate-pulse">Creando cuenta...</span>
                    {:else}
                        Registrarse
                    {/if}
                </Button>
                
            </form>
        </Card.Content>
        
        <Card.Footer class="flex justify-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta? &nbsp;
            <a href={resolve("/auth/login")} class="text-primary hover:underline font-medium">
                Inicia sesión aquí
            </a>
        </Card.Footer>
    </Card.Root>

</div>