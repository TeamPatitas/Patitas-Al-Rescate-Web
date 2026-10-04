<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { onMount } from 'svelte';
	import {
		Activity,
		RefreshCw,
		CircleCheck,
		CircleX,
		Server,
		Database,
		HardDrive,
		Mail,
		TriangleAlert
	} from '@lucide/svelte';

	interface HealthServiceResult {
		status: string;
		latencyMs: number;
		error?: string | null;
	}

	interface HealthResponse {
		status: string;
		services: Record<string, HealthServiceResult>;
	}

	let health = $state<HealthResponse | null>(null);
	let loading = $state(true);
	let errorMessage = $state('');
	let lastUpdated = $state<Date | null>(null);
	let usingCache = $state(false);

	const HEALTH_CACHE_KEY = 'admin-health-cache';
	const HEALTH_CACHE_TTL_MS = 5 * 60 * 1000;

	interface HealthCache {
		data: HealthResponse;
		fetchedAt: number;
	}

	function readHealthCache(): HealthCache | null {
		try {
			const raw = localStorage.getItem(HEALTH_CACHE_KEY);
			if (!raw) return null;
			const parsed = JSON.parse(raw) as HealthCache;
			if (!parsed?.data?.services || typeof parsed.fetchedAt !== 'number') return null;
			return parsed;
		} catch {
			return null;
		}
	}

	function writeHealthCache(data: HealthResponse) {
		try {
			const payload: HealthCache = { data, fetchedAt: Date.now() };
			localStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify(payload));
		} catch {
			// Si el storage falla, se sigue mostrando el dato en memoria.
		}
	}

	const serviceIcons: Record<string, typeof Server> = {
		api: Server,
		database: Database,
		storage: HardDrive,
		email: Mail
	};

	function getServiceIcon(name: string) {
		return serviceIcons[name.toLowerCase()] ?? Activity;
	}

	function isUp(status?: string) {
		return status?.toUpperCase() === 'UP';
	}

	async function loadHealth(force = false) {
		// Si hay un dato de hace menos de 5 minutos y no es refresh manual, reusarlo.
		if (!force) {
			const cached = readHealthCache();
			if (cached && Date.now() - cached.fetchedAt < HEALTH_CACHE_TTL_MS) {
				health = cached.data;
				lastUpdated = new Date(cached.fetchedAt);
				usingCache = true;
				loading = false;
				return;
			}
		}

		loading = true;
		errorMessage = '';
		usingCache = false;

		const token = localStorage.getItem('token');
		if (!token) {
			errorMessage = 'No hay sesión activa. Iniciá sesión con un usuario Dev.';
			loading = false;
			return;
		}

		try {
			const res = await fetch(`${PUBLIC_API_URL}/admin/health`, {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (res.status === 401) {
				errorMessage = 'No autorizado. Tu sesión expiró o no tiene rol Dev.';
				return;
			}

			if (res.status === 429) {
				errorMessage = 'Demasiadas consultas. Esperá 30 segundos (cooldown del endpoint).';
				return;
			}

			let payload: HealthResponse | null = null;
			try {
				payload = (await res.json()) as HealthResponse;
			} catch {
				payload = null;
			}

			if (payload && payload.services) {
				health = payload;
				lastUpdated = new Date();
				writeHealthCache(payload);
				if (!res.ok && res.status !== 503) {
					errorMessage = `La API respondió con estado ${res.status}.`;
				}
				return;
			}

			throw new Error(`La API respondió con estado ${res.status}.`);
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'No se pudo conectar con la API.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadHealth();
	});
</script>

<div class="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
	<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<div class="bg-orange-600 flex size-9 items-center justify-center rounded-xl text-white">
				<Activity class="size-5" />
			</div>
			<div>
				<h1 class="text-2xl font-bold tracking-tight">Estado general de la API</h1>
				<p class="text-sm text-muted-foreground">
					Endpoint <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">GET /admin/health</code>
					{#if lastUpdated}
						· Actualizado {lastUpdated.toLocaleTimeString('es-PE')}{usingCache ? ' (caché 5 min)' : ''}
					{/if}
				</p>
			</div>
		</div>
		<Button variant="outline" size="sm" onclick={() => loadHealth(true)} disabled={loading} class="gap-2">
			<RefreshCw class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
			{loading ? 'Consultando...' : 'Actualizar'}
		</Button>
	</div>

	{#if loading && !health}
		<div class="grid gap-4 md:grid-cols-2">
			<Card.Root><Card.Content class="space-y-3 pt-6"><Skeleton class="h-6 w-1/3" /><Skeleton class="h-4 w-2/3" /></Card.Content></Card.Root>
			<Card.Root><Card.Content class="space-y-3 pt-6"><Skeleton class="h-6 w-1/3" /><Skeleton class="h-4 w-2/3" /></Card.Content></Card.Root>
		</div>
	{:else if errorMessage && !health}
		<Card.Root class="border-destructive/30">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base text-destructive">
					<TriangleAlert class="h-5 w-5" /> No se pudo obtener el estado
				</Card.Title>
				<Card.Description>{errorMessage}</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button variant="outline" size="sm" onclick={() => loadHealth(true)} class="gap-2">
					<RefreshCw class="h-4 w-4" /> Reintentar
				</Button>
			</Card.Footer>
		</Card.Root>
	{:else if health}
		<Card.Root
			class="mb-6 border-l-4 {isUp(health.status)
				? 'border-l-emerald-500'
				: 'border-l-red-500'}"
		>
			<Card.Header class="pb-2">
				<div class="flex flex-wrap items-center gap-3">
					{#if isUp(health.status)}
						<CircleCheck class="h-6 w-6 text-emerald-500" />
					{:else}
						<CircleX class="h-6 w-6 text-red-500" />
					{/if}
					<Card.Title class="text-xl">
						API {isUp(health.status) ? 'operativa' : 'con problemas'}
					</Card.Title>
					<Badge
						class={isUp(health.status)
							? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25'
							: 'bg-red-500/15 text-red-600 hover:bg-red-500/25'}
					>
						{health.status}
					</Badge>
				</div>
				<Card.Description>
					{Object.values(health.services ?? {}).filter((s) => isUp(s.status)).length}
					de {Object.keys(health.services ?? {}).length} servicios en UP
				</Card.Description>
			</Card.Header>
		</Card.Root>

		{#if errorMessage}
			<p class="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
				{errorMessage}
			</p>
		{/if}

		<div class="grid gap-4 sm:grid-cols-2">
			{#each Object.entries(health.services ?? {}) as [name, service] (name)}
				{@const Icon = getServiceIcon(name)}
				<Card.Root>
					<Card.Header class="pb-3">
						<div class="flex items-center justify-between gap-2">
							<Card.Title class="flex items-center gap-2 text-base capitalize">
								<Icon class="h-4 w-4 text-muted-foreground" />
								{name}
							</Card.Title>
							<Badge
								class={isUp(service.status)
									? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25'
									: 'bg-red-500/15 text-red-600 hover:bg-red-500/25'}
							>
								{service.status}
							</Badge>
						</div>
					</Card.Header>
					<Card.Content class="space-y-1 text-sm">
						<p class="text-muted-foreground">
							Latencia: <span class="font-mono font-medium text-foreground">{service.latencyMs} ms</span>
						</p>
						{#if service.error}
							<p class="rounded-md bg-red-500/10 p-2 font-mono text-xs text-red-600">
								{service.error}
							</p>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
