<script lang="ts">
    import { auth } from '$lib/auth.svelte';
    import { goto } from '$app/navigation';
    import * as Card from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { Badge } from '$lib/components/ui/badge';
    import { Skeleton } from '$lib/components/ui/skeleton';
    
    import { 
        Mail, Calendar, User as UserIcon, Shield, 
        LogOut,
		TriangleAlert
    } from '@lucide/svelte';
	import { resolve } from '$app/paths';

    $effect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            goto(resolve('/auth/login'));
            return;
        }

        if (!auth.user) {
            auth.init();
        }
    });

    const formatGender = (genderValue?: number) => {
        if (genderValue === undefined) return "No especificado";
        return genderValue === 0 ? "Masculino" : genderValue === 1 ? "Femenino" : "Otro";
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No especificada';
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
</script>

<div class="container mx-auto max-w-5xl px-4 py-8 space-y-6">
    
    <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        {#if auth.user}
            <Button variant="destructive" size="sm" onclick={() => auth.logout()} class="gap-2">
                <LogOut class="h-4 w-4" />
                Cerrar Sesión
            </Button>
        {/if}
    </div>

    {#if !auth.user}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card.Root class="md:col-span-1">
                <Card.Content class="pt-6 flex flex-col items-center space-y-4">
                    <Skeleton class="h-32 w-32 rounded-full" />
                    <Skeleton class="h-6 w-3/4" />
                    <Skeleton class="h-4 w-1/2" />
                </Card.Content>
            </Card.Root>
            <Card.Root class="md:col-span-2">
                <Card.Content class="pt-6 space-y-4">
                    <Skeleton class="h-8 w-1/3 mb-6" />
                    <Skeleton class="h-12 w-full" />
                    <Skeleton class="h-12 w-full" />
                </Card.Content>
            </Card.Root>
        </div>
    {:else}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <Card.Root class="lg:col-span-1 border-t-4 border-t-primary shadow-sm h-fit">
                <Card.Content class="pt-8 flex flex-col items-center text-center">
                    
                    <div class="relative mb-4">
                        <div class="h-32 w-32 rounded-full border-4 border-background shadow-md overflow-hidden bg-muted flex items-center justify-center">
                            {#if auth.user.photoUrl}
                                <img src={auth.user.photoUrl} alt="Foto de {auth.user.firstName}" class="h-full w-full object-cover" />
                            {:else}
                                <span class="text-4xl font-bold text-primary">
                                    {auth.user.firstName?.charAt(0) || ""}{auth.user.lastName?.charAt(0) || ""}
                                </span>
                            {/if}
                        </div>
                    </div>
                    
                    <Card.Title class="text-2xl font-bold mb-1">
                        {auth.user.firstName} {auth.user.lastName}
                    </Card.Title>
                    <Card.Description class="flex items-center gap-2 mb-4 text-sm">
                        <Mail class="h-4 w-4" /> {auth.user.email}
                    </Card.Description>

                    {#if auth.user.roles && auth.user.roles.length > 0}
                        <div class="flex flex-wrap justify-center gap-2 mb-6">
                            {#each auth.user.roles as rol (rol)}
                                <Badge variant="secondary" class="gap-1 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                    <Shield class="h-3 w-3" />
                                    {rol}
                                </Badge>
                            {/each}
                        </div>
                    {/if}
                </Card.Content>
            </Card.Root>

            <div class="lg:col-span-2 space-y-6">
                
                <Card.Root class="shadow-sm">
                    <Card.Header>
                        <Card.Title class="text-lg flex items-center gap-2">
                            <UserIcon class="h-5 w-5 text-muted-foreground" />
                            Información Personal
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            
                            <div class="space-y-1">
                                <span class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <UserIcon class="h-4 w-4" /> Nombres
                                </span>
                                <p class="font-medium text-foreground">{auth.user.firstName}</p>
                            </div>

                            <div class="space-y-1">
                                <span class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <UserIcon class="h-4 w-4" /> Apellidos
                                </span>
                                <p class="font-medium text-foreground">{auth.user.lastName}</p>
                            </div>

                            <div class="space-y-1">
                                <span class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Calendar class="h-4 w-4" /> Fecha de Nacimiento
                                </span>
                                <p class="font-medium text-foreground">{formatDate(auth.user.birthDate)}</p>
                            </div>

                            <div class="space-y-1">
                                <span class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <UserIcon class="h-4 w-4" /> Género
                                </span>
                                <p class="font-medium text-foreground">{formatGender(auth.user.gender)}</p>
                            </div>
                        </div>

                        {#if auth.user.isEmailConfirmed === false}
                            <div class="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-600 dark:text-amber-500">
                                <TriangleAlert class="h-5 w-5 shrink-0 mt-0.5" />
                                <div class="space-y-1">
                                    <h4 class="text-sm font-semibold">Verifica tu correo electrónico</h4>
                                </div>
                            </div>
                        {/if}
                    </Card.Content>
                </Card.Root>
            </div>
        </div>
    {/if}
</div>