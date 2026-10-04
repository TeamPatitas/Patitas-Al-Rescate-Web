<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { resolve } from '$app/paths';
	import { getRoleColor } from '$lib/utils.js';
	import { onMount } from 'svelte';
	import {
		UsersRound,
		RefreshCw,
		ChevronLeft,
		ChevronRight,
		TriangleAlert,
		Shield,
		Eye,
		X,
		Plus,
		Save
	} from '@lucide/svelte';

	const ALL_ROLES = ['Dev', 'ShelterOwner', 'User'];

	interface UserSummary {
		id: string;
		firstName: string | null;
		lastName: string | null;
		roles: string[] | null;
	}

	interface PagedResponse {
		items: UserSummary[];
		page: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	}

	let items = $state<UserSummary[]>([]);
	let page = $state(1);
	let pageSize = $state(12);
	let totalCount = $state(0);
	let totalPages = $state(1);
	let loading = $state(true);
	let errorMessage = $state('');
	let successMessage = $state('');

	// Cambios de roles por usuario, aún no guardados: userId -> roles editados.
	let draftRoles = $state<Record<string, string[]>>({});
	let saving = $state(false);

	let dirtyCount = $derived(Object.keys(draftRoles).length);

	function editedRoles(user: UserSummary) {
		return draftRoles[user.id] ?? user.roles ?? [];
	}

	function toggleRole(user: UserSummary, role: string) {
		const current = editedRoles(user);
		const next = current.includes(role)
			? current.filter((r) => r !== role)
			: [...current, role];

		const original = [...(user.roles ?? [])].sort();
		if (JSON.stringify([...next].sort()) === JSON.stringify(original)) {
			const { [user.id]: _, ...rest } = draftRoles;
			draftRoles = rest;
		} else {
			draftRoles = { ...draftRoles, [user.id]: next };
		}
	}

	function discardAll() {
		draftRoles = {};
	}

	async function patchRoles(userId: string, endpoint: 'add-roles' | 'remove-roles', roles: string[]) {
		const token = localStorage.getItem('token');
		const res = await fetch(`${PUBLIC_API_URL}/admin/${endpoint}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ userId, roles })
		});
		if (!res.ok) {
			let detail = `estado ${res.status}`;
			try {
				const body = await res.json();
				if (body?.message) detail = body.message;
			} catch {
				// Se mantiene el detalle por defecto.
			}
			throw new Error(detail);
		}
	}

	async function saveAll() {
		if (dirtyCount === 0 || saving) return;
		saving = true;
		errorMessage = '';
		successMessage = '';

		const failed: string[] = [];
		const applied: Record<string, string[]> = {};

		for (const [userId, nextRoles] of Object.entries(draftRoles)) {
			const original = items.find((u) => u.id === userId)?.roles ?? [];
			const toAdd = nextRoles.filter((r) => !original.includes(r));
			const toRemove = original.filter((r) => !nextRoles.includes(r));

			try {
				// Una sola solicitud por endpoint y por usuario, con el array de roles.
				if (toAdd.length > 0) await patchRoles(userId, 'add-roles', toAdd);
				if (toRemove.length > 0) await patchRoles(userId, 'remove-roles', toRemove);
				applied[userId] = nextRoles;
			} catch (error) {
				failed.push(
					`${userId.slice(0, 8)}…: ${error instanceof Error ? error.message : 'error desconocido'}`
				);
			}
		}

		if (Object.keys(applied).length > 0) {
			items = items.map((u) =>
				applied[u.id] ? { ...u, roles: applied[u.id] } : u
			);
			const remaining = { ...draftRoles };
			for (const id of Object.keys(applied)) delete remaining[id];
			draftRoles = remaining;
			successMessage = `Roles actualizados en ${Object.keys(applied).length} usuario(s).`;
		}

		if (failed.length > 0) {
			errorMessage = `No se pudieron guardar ${failed.length} cambio(s): ${failed.join(' · ')}`;
		}

		saving = false;
	}

	function fullName(user: UserSummary) {
		const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
		return name || 'Sin nombre';
	}

	async function loadUsers(targetPage = page) {
		loading = true;
		errorMessage = '';

		const token = localStorage.getItem('token');
		if (!token) {
			errorMessage = 'No hay sesión activa. Iniciá sesión con un usuario Dev.';
			loading = false;
			return;
		}

		try {
			const res = await fetch(
				`${PUBLIC_API_URL}/admin/users?page=${targetPage}&pageSize=${pageSize}`,
				{ headers: { Authorization: `Bearer ${token}` } }
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

	function goTo(target: number) {
		if (target < 1 || target > totalPages || target === page) return;
		draftRoles = {};
		loadUsers(target);
	}

	onMount(() => {
		loadUsers(1);
	});
</script>

<div class="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
	<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<div class="bg-orange-600 flex size-9 items-center justify-center rounded-xl text-white">
				<UsersRound class="size-5" />
			</div>
			<div>
				<h1 class="text-2xl font-bold tracking-tight">Usuarios</h1>
				<p class="text-sm text-muted-foreground">
					Endpoint <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">GET /admin/users?page&pageSize</code>
					· {totalCount} en total
				</p>
			</div>
		</div>
		<Button variant="outline" size="sm" onclick={() => loadUsers(page)} disabled={loading} class="gap-2">
			<RefreshCw class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
			{loading ? 'Cargando...' : 'Actualizar'}
		</Button>
	</div>

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
					<TriangleAlert class="h-5 w-5" /> No se pudieron cargar los usuarios
				</Card.Title>
				<Card.Description>{errorMessage}</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button variant="outline" size="sm" onclick={() => loadUsers(1)} class="gap-2">
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

		{#if successMessage}
			<p class="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
				{successMessage}
			</p>
		{/if}

		{#if dirtyCount > 0}
			<div class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 shadow-sm">
				<p class="text-sm font-medium text-amber-800 dark:text-amber-300">
					Tenés cambios sin guardar en {dirtyCount} usuario(s). Recién se envían al guardar.
				</p>
				<div class="flex gap-2">
					<Button variant="ghost" size="sm" disabled={saving} onclick={discardAll}>
						Descartar
					</Button>
					<Button size="sm" disabled={saving} onclick={saveAll} class="gap-2">
						<Save class="h-4 w-4" />
						{saving ? 'Guardando...' : 'Guardar cambios'}
					</Button>
				</div>
			</div>
		{/if}

		<Card.Root>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Nombre</Table.Head>
						<Table.Head>Roles</Table.Head>
						<Table.Head class="w-32 text-right">Acciones</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each items as user (user.id)}
						<Table.Row>
							<Table.Cell>
								<p class="font-medium">{fullName(user)}</p>
								<p class="font-mono text-xs text-muted-foreground">{user.id.slice(0, 8)}…</p>
							</Table.Cell>
							<Table.Cell>
								{@const roles = editedRoles(user)}
								<div class="flex flex-wrap items-center gap-1.5">
									{#each roles as rol (rol)}
										<Badge variant="secondary" class="gap-1 border-none py-1 {getRoleColor(rol)}">
											<Shield class="h-3 w-3" />
											{rol}
											<button
												type="button"
												onclick={() => toggleRole(user, rol)}
												disabled={saving}
												class="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary/20"
												aria-label="Quitar rol {rol}"
												title="Quitar rol (se guarda al confirmar)"
											>
												<X class="h-3 w-3" />
											</button>
										</Badge>
									{/each}
									{#if roles.length === 0}
										<span class="text-sm text-muted-foreground">Sin roles</span>
									{/if}
									<DropdownMenu.Root>
										<DropdownMenu.Trigger
											disabled={saving}
											class="flex size-6 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
											title="Agregar o quitar roles (se guarda al confirmar)"
										>
											<Plus class="h-3.5 w-3.5" />
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="start" class="w-48">
											<DropdownMenu.Label>Roles</DropdownMenu.Label>
											<DropdownMenu.Separator />
											{#each ALL_ROLES as rol (rol)}
												<DropdownMenu.CheckboxItem
													checked={roles.includes(rol)}
													onCheckedChange={() => toggleRole(user, rol)}
													disabled={saving}
												>
													{rol}
												</DropdownMenu.CheckboxItem>
											{/each}
										</DropdownMenu.Content>
									</DropdownMenu.Root>
									{#if user.id in draftRoles}
										<Badge variant="outline" class="border-amber-500/50 text-amber-700 dark:text-amber-400">
											Pendiente
										</Badge>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell class="text-right">
								<Button
									href="{resolve('/admin/users/details')}?id={user.id}"
									variant="ghost"
									size="sm"
									class="gap-1"
								>
									<Eye class="h-4 w-4" /> Detalles
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Root>

		{#if items.length === 0}
			<p class="mt-6 text-center text-sm text-muted-foreground">No hay usuarios para mostrar.</p>
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
