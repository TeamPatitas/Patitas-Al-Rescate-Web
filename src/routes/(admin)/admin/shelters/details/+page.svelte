<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import {
		House,
		ArrowLeft,
		MapPin,
		Users,
		Fingerprint,
		CircleCheck,
		CircleX,
		TriangleAlert,
		RefreshCw
	} from '@lucide/svelte';

	interface ShelterDetails {
		id: string;
		name: string | null;
		address: string | null;
		isAvailable: boolean;
		latitude?: number | null;
		longitude?: number | null;
		photoUrl?: string | null;
		owners?: string[] | null;
	}

	let shelterId = $derived(page.url.searchParams.get('id') ?? '');
	let shelter = $state<ShelterDetails | null>(null);
	let loading = $state(true);
	let errorMessage = $state('');
	let actionLoading = $state(false);

	async function loadDetails() {
		if (!shelterId) {
			errorMessage = 'Falta el parámetro id en la URL.';
			loading = false;
			return;
		}

		loading = true;
		errorMessage = '';

		const token = localStorage.getItem('token');
		if (!token) {
			errorMessage = 'No hay sesión activa. Iniciá sesión con un usuario Dev.';
			loading = false;
			return;
		}

		try {
			const res = await fetch(`${PUBLIC_API_URL}/shelter/${shelterId}`, {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (res.status === 401) {
				errorMessage = 'No autorizado. Tu sesión expiró o no tiene rol Dev.';
				return;
			}

			if (res.status === 404) {
				errorMessage = 'Refugio no encontrado o no visible para tu rol.';
				return;
			}

			if (!res.ok) {
				throw new Error(`La API respondió con estado ${res.status}.`);
			}

			shelter = (await res.json()) as ShelterDetails;
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'No se pudo conectar con la API.';
		} finally {
			loading = false;
		}
	}

	async function setAvailability(enable: boolean) {
		if (!shelter) return;
		const token = localStorage.getItem('token');
		if (!token) return;

		actionLoading = true;
		try {
			const action = enable ? 'enable' : 'disable';
			const res = await fetch(`${PUBLIC_API_URL}/admin/shelter/${action}/${shelter.id}`, {
				method: 'PATCH',
				headers: { Authorization: `Bearer ${token}` }
			});

			if (res.status === 429) {
				errorMessage = 'Cooldown de 5 minutos para habilitar/deshabilitar refugios.';
				return;
			}

			if (!res.ok) {
				throw new Error(`La API respondió con estado ${res.status}.`);
			}

			shelter = { ...shelter, isAvailable: enable };
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'No se pudo actualizar el refugio.';
		} finally {
			actionLoading = false;
		}
	}

	onMount(() => {
		loadDetails();
	});

	$effect(() => {
		if (shelterId) {
			loadDetails();
		}
	});
</script>

<div class="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
	<Button href={resolve('/admin/shelters')} variant="ghost" size="sm" class="mb-6 gap-2">
		<ArrowLeft class="h-4 w-4" /> Volver a refugios
	</Button>

	{#if loading && !shelter}
		<Card.Root>
			<Card.Content class="flex items-center gap-4 pt-6">
				<Skeleton class="size-32 shrink-0 rounded-2xl" />
				<div class="flex-1 space-y-3">
					<Skeleton class="h-6 w-1/2" />
					<Skeleton class="h-4 w-2/3" />
				</div>
			</Card.Content>
		</Card.Root>
	{:else if errorMessage && !shelter}
		<Card.Root class="border-destructive/30">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base text-destructive">
					<TriangleAlert class="h-5 w-5" /> No se pudieron cargar los detalles
				</Card.Title>
				<Card.Description>{errorMessage}</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button variant="outline" size="sm" onclick={loadDetails} class="gap-2">
					<RefreshCw class="h-4 w-4" /> Reintentar
				</Button>
			</Card.Footer>
		</Card.Root>
	{:else if shelter}
		<div class="mb-6 rounded-2xl border bg-card p-5 shadow-sm">
			<div class="flex flex-wrap items-center gap-4">
				{#if shelter.photoUrl}
					<img src={shelter.photoUrl} alt={shelter.name ?? 'Refugio'} class="size-32 shrink-0 rounded-2xl border object-cover" />
				{:else}
					<div class="flex size-32 shrink-0 items-center justify-center rounded-2xl border bg-muted">
						<House class="h-10 w-10 text-muted-foreground" />
					</div>
				{/if}
				<div class="flex min-w-52 flex-1 flex-wrap items-center justify-between gap-3">
					<div>
						<h1 class="text-2xl font-bold tracking-tight">{shelter.name ?? 'Sin nombre'}</h1>
						<p class="text-sm text-muted-foreground">
							Endpoint <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">GET /shelter/{`{id}`}</code>
						</p>
					</div>
					<div class="flex items-center gap-2">
						{#if shelter.isAvailable}
							<Badge class="gap-1 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25">
								<CircleCheck class="h-3 w-3" /> Habilitado
							</Badge>
							<Button variant="outline" size="sm" disabled={actionLoading} onclick={() => setAvailability(false)}>
								Deshabilitar
							</Button>
						{:else}
							<Badge variant="secondary" class="gap-1">
								<CircleX class="h-3 w-3" /> Deshabilitado
							</Badge>
							<Button size="sm" disabled={actionLoading} onclick={() => setAvailability(true)}>
								Habilitar
							</Button>
						{/if}
					</div>
				</div>
			</div>
		</div>

		{#if errorMessage}
			<p class="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
				{errorMessage}
			</p>
		{/if}

		<div class="grid gap-4 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<MapPin class="h-4 w-4 text-muted-foreground" /> Ubicación
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-2 text-sm">
					<p><span class="text-muted-foreground">Dirección: </span><span class="font-medium">{shelter.address ?? 'No especificada'}</span></p>
					<p>
						<span class="text-muted-foreground">Coordenadas: </span>
						<span class="font-mono font-medium">
							{shelter.latitude ?? '—'}, {shelter.longitude ?? '—'}
						</span>
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<Users class="h-4 w-4 text-muted-foreground" /> Dueños ({shelter.owners?.length ?? 0})
					</Card.Title>
				</Card.Header>
				<Card.Content>
					{#if shelter.owners && shelter.owners.length > 0}
						<ul class="space-y-1.5">
							{#each shelter.owners as ownerId (ownerId)}
								<li>
									<a
										href="{resolve('/admin/users/details')}?id={ownerId}"
										class="block rounded-lg bg-muted/60 px-3 py-1.5 font-mono text-xs transition-colors hover:bg-primary/10 hover:text-primary hover:underline"
										title="Ver detalle del usuario"
									>
										{ownerId}
									</a>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm text-muted-foreground">Sin dueños asignados.</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<Card.Root class="mt-4">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Fingerprint class="h-4 w-4 text-muted-foreground" /> Identificador
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="rounded-lg bg-muted/60 px-3 py-2 font-mono text-xs break-all">{shelter.id}</p>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
