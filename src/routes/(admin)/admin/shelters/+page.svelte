<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		House,
		RefreshCw,
		ChevronLeft,
		ChevronRight,
		TriangleAlert,
		CircleCheck,
		CircleX,
		Eye,
		ListChecks,
		X
	} from '@lucide/svelte';

	interface ShelterSummary {
		id: string;
		name: string | null;
		isAvailable: boolean;
		photoUrl?: string | null;
	}

	interface PagedResponse {
		items: ShelterSummary[];
		page: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	}

	let items = $state<ShelterSummary[]>([]);
	let page = $state(1);
	let pageSize = $state(12);
	let totalCount = $state(0);
	let totalPages = $state(1);
	let loading = $state(true);
	let errorMessage = $state('');
	let actionId = $state<string | null>(null);
	let selectionMode = $state(false);
	let selectedIds = $state<string[]>([]);
	let bulkLoading = $state(false);

	let allSelected = $derived(
		items.length > 0 && items.every((s) => selectedIds.includes(s.id))
	);
	let someSelected = $derived(
		selectedIds.length > 0 && !allSelected
	);

	function toggleSelectionMode() {
		selectionMode = !selectionMode;
		selectedIds = [];
	}

	function toggleOne(id: string, checked: boolean) {
		selectedIds = checked
			? [...selectedIds, id]
			: selectedIds.filter((s) => s !== id);
	}

	function toggleAll(checked: boolean) {
		selectedIds = checked ? items.map((s) => s.id) : [];
	}

	function authHeaders() {
		const token = localStorage.getItem('token');
		return {
			token,
			headers: { Authorization: `Bearer ${token}` }
		};
	}

	async function loadShelters(targetPage = page) {
		loading = true;
		errorMessage = '';

		const { token, headers } = authHeaders();
		if (!token) {
			errorMessage = 'No hay sesión activa. Iniciá sesión con un usuario Dev.';
			loading = false;
			return;
		}

		try {
			const res = await fetch(
				`${PUBLIC_API_URL}/shelter?page=${targetPage}&pageSize=${pageSize}`,
				{ headers }
			);

			if (res.status === 401) {
				errorMessage = 'No autorizado. Tu sesión expiró o no tiene rol Dev.';
				return;
			}

			if (res.status === 429) {
				errorMessage = 'Demasiadas consultas. Esperá antes de reintentar.';
				return;
			}

			if (!res.ok) {
				throw new Error(`La API respondió con estado ${res.status}.`);
			}

			const data = (await res.json()) as PagedResponse;
			items = data.items ?? [];
			page = data.page ?? targetPage;
			totalCount = data.totalCount ?? 0;
			totalPages = data.totalPages ?? 1;
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'No se pudo conectar con la API.';
		} finally {
			loading = false;
		}
	}

	async function setAvailability(shelter: ShelterSummary, enable: boolean) {
		const { token, headers } = authHeaders();
		if (!token) return;

		actionId = shelter.id;
		try {
			const action = enable ? 'enable' : 'disable';
			const res = await fetch(`${PUBLIC_API_URL}/admin/shelter/${action}/${shelter.id}`, {
				method: 'PATCH',
				headers
			});

			if (res.status === 429) {
				errorMessage = 'Cooldown de 5 minutos para habilitar/deshabilitar refugios.';
				return;
			}

			if (!res.ok) {
				throw new Error(`La API respondió con estado ${res.status}.`);
			}

			items = items.map((s) =>
				s.id === shelter.id ? { ...s, isAvailable: enable } : s
			);
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'No se pudo actualizar el refugio.';
		} finally {
			actionId = null;
		}
	}

	async function setAvailabilityById(id: string, enable: boolean) {
		const { headers } = authHeaders();
		const action = enable ? 'enable' : 'disable';
		const res = await fetch(`${PUBLIC_API_URL}/admin/shelter/${action}/${id}`, {
			method: 'PATCH',
			headers
		});

		if (res.status === 429) {
			throw new Error('Cooldown de 5 minutos para habilitar/deshabilitar refugios.');
		}

		if (!res.ok) {
			throw new Error(`La API respondió con estado ${res.status}.`);
		}
	}

	async function bulkSetAvailability(enable: boolean) {
		if (selectedIds.length === 0) return;
		bulkLoading = true;
		errorMessage = '';
		try {
			for (const id of selectedIds) {
				await setAvailabilityById(id, enable);
			}
			const selected = new Set(selectedIds);
			items = items.map((s) =>
				selected.has(s.id) ? { ...s, isAvailable: enable } : s
			);
			selectedIds = [];
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'No se pudo actualizar la selección.';
		} finally {
			bulkLoading = false;
		}
	}

	function goTo(target: number) {
		if (target < 1 || target > totalPages || target === page) return;
		selectedIds = [];
		loadShelters(target);
	}

	onMount(() => {
		loadShelters(1);
	});
</script>

<div class="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
	<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<div class="bg-orange-600 flex size-9 items-center justify-center rounded-xl text-white">
				<House class="size-5" />
			</div>
			<div>
				<h1 class="text-2xl font-bold tracking-tight">Administrar refugios</h1>
				<p class="text-sm text-muted-foreground">
					Endpoint <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">GET /shelter?page&pageSize</code>
					· {totalCount} en total
				</p>
			</div>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button
				variant={selectionMode ? 'default' : 'outline'}
				size="sm"
				onclick={toggleSelectionMode}
				class="gap-2"
			>
				<ListChecks class="h-4 w-4" />
				{selectionMode ? 'Salir de selección' : 'Selección múltiple'}
			</Button>
			<Button variant="outline" size="sm" onclick={() => loadShelters(page)} disabled={loading} class="gap-2">
				<RefreshCw class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
				{loading ? 'Cargando...' : 'Actualizar'}
			</Button>
		</div>
	</div>

	{#if selectionMode && selectedIds.length > 0}
		<div class="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 shadow-sm">
			<Badge variant="secondary">{selectedIds.length} seleccionados</Badge>
			<Button size="sm" disabled={bulkLoading} onclick={() => bulkSetAvailability(true)}>
				Habilitar selección
			</Button>
			<Button size="sm" variant="outline" disabled={bulkLoading} onclick={() => bulkSetAvailability(false)}>
				Deshabilitar selección
			</Button>
			<Button size="sm" variant="ghost" disabled={bulkLoading} onclick={() => (selectedIds = [])} class="gap-1">
				<X class="h-4 w-4" /> Limpiar
			</Button>
		</div>
	{/if}

	{#if loading && items.length === 0}
		<Card.Root>
			<Card.Content class="space-y-3 pt-6">
				<Skeleton class="h-10 w-full" />
				<Skeleton class="h-10 w-full" />
				<Skeleton class="h-10 w-full" />
			</Card.Content>
		</Card.Root>
	{:else if errorMessage && items.length === 0}
		<Card.Root class="border-destructive/30">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base text-destructive">
					<TriangleAlert class="h-5 w-5" /> No se pudieron cargar los refugios
				</Card.Title>
				<Card.Description>{errorMessage}</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button variant="outline" size="sm" onclick={() => loadShelters(1)} class="gap-2">
					<RefreshCw class="h-4 w-4" /> Reintentar
				</Button>
			</Card.Footer>
		</Card.Root>
	{:else}
		{#if errorMessage}
			<p class="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
				{errorMessage}
			</p>
		{/if}

		<Card.Root>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						{#if selectionMode}
							<Table.Head class="w-10">
								<Checkbox
									checked={allSelected}
									indeterminate={someSelected}
									onCheckedChange={toggleAll}
									aria-label="Seleccionar todos"
								/>
							</Table.Head>
						{/if}
						<Table.Head class="w-14">Foto</Table.Head>
						<Table.Head>Nombre</Table.Head>
						<Table.Head class="w-36">Estado</Table.Head>
						<Table.Head class="w-64 text-right">Acciones</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each items as shelter (shelter.id)}
						<Table.Row data-selected={selectedIds.includes(shelter.id) || undefined}>
							{#if selectionMode}
								<Table.Cell>
									<Checkbox
										checked={selectedIds.includes(shelter.id)}
										onCheckedChange={(v) => toggleOne(shelter.id, v)}
										aria-label={`Seleccionar ${shelter.name ?? shelter.id}`}
									/>
								</Table.Cell>
							{/if}
							<Table.Cell>
								<div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border bg-muted">
									{#if shelter.photoUrl}
										<img src={shelter.photoUrl} alt={shelter.name ?? 'Refugio'} class="h-full w-full object-cover" />
									{:else}
										<House class="h-5 w-5 text-muted-foreground" />
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<p class="font-medium">{shelter.name ?? 'Sin nombre'}</p>
								<p class="font-mono text-xs text-muted-foreground">{shelter.id.slice(0, 8)}…</p>
							</Table.Cell>
							<Table.Cell>
								{#if shelter.isAvailable}
									<Badge class="gap-1 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25">
										<CircleCheck class="h-3 w-3" /> Habilitado
									</Badge>
								{:else}
									<Badge variant="secondary" class="gap-1">
										<CircleX class="h-3 w-3" /> Deshabilitado
									</Badge>
								{/if}
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-2">
									<Button
										href="{resolve('/admin/shelters/details')}?id={shelter.id}"
										variant="ghost"
										size="sm"
										class="gap-1"
									>
										<Eye class="h-4 w-4" /> Detalles
									</Button>
									{#if shelter.isAvailable}
										<Button
											variant="outline"
											size="sm"
											disabled={actionId === shelter.id}
											onclick={() => setAvailability(shelter, false)}
										>
											{actionId === shelter.id ? '...' : 'Deshabilitar'}
										</Button>
									{:else}
										<Button
											size="sm"
											disabled={actionId === shelter.id}
											onclick={() => setAvailability(shelter, true)}
										>
											{actionId === shelter.id ? '...' : 'Habilitar'}
										</Button>
									{/if}
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Root>

		{#if items.length === 0}
			<p class="mt-6 text-center text-sm text-muted-foreground">No hay refugios para mostrar.</p>
		{/if}

		<div class="mt-4 flex items-center justify-between gap-3 text-sm">
			<p class="text-muted-foreground">Página {page} de {totalPages}</p>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" disabled={page <= 1 || loading} onclick={() => goTo(page - 1)} class="gap-1">
					<ChevronLeft class="h-4 w-4" /> Anterior
				</Button>
				<Button variant="outline" size="sm" disabled={page >= totalPages || loading} onclick={() => goTo(page + 1)} class="gap-1">
					Siguiente <ChevronRight class="h-4 w-4" />
				</Button>
			</div>
		</div>
	{/if}
</div>
