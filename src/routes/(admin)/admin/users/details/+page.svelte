<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getRoleColor } from '$lib/utils.js';
	import { onMount } from 'svelte';
	import {
		UsersRound,
		ArrowLeft,
		Shield,
		Fingerprint,
		User as UserIcon,
		Mail,
		Calendar,
		House,
		CircleCheck,
		CircleX,
		TriangleAlert,
		RefreshCw
	} from '@lucide/svelte';

	interface UserResponse {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		isEmailConfirmed: boolean;
		gender: number;
		photoUrl: string;
		birthDate: string;
		roles: string[];
		shelterId?: string | null;
	}

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

	interface UserDetailsView {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string | null;
		isEmailConfirmed: boolean | null;
		gender: number | null;
		birthDate: string | null;
		roles: string[] | null;
		shelterId?: string | null;
		full: boolean;
	}

	let userId = $derived(page.url.searchParams.get('id') ?? '');
	let user = $state<UserDetailsView | null>(null);
	let loading = $state(true);
	let errorMessage = $state('');

	function fullName(u: { firstName?: string | null; lastName?: string | null }) {
		const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
		return name || 'Sin nombre';
	}

	function formatGender(gender: number | null) {
		if (gender === null || gender === undefined) return 'No disponible';
		return gender === 0 ? 'Masculino' : gender === 1 ? 'Femenino' : 'Otro';
	}

	function formatDate(dateString: string | null) {
		if (!dateString) return 'No disponible';
		return new Date(dateString).toLocaleDateString('es-PE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	async function fetchJson(url: string, token: string) {
		const res = await fetch(url, {
			headers: { Authorization: `Bearer ${token}` }
		});
		if (res.status === 401) throw new Error('UNAUTHORIZED');
		if (!res.ok) throw new Error(`La API respondió con estado ${res.status}.`);
		return await res.json();
	}

	async function findInList(id: string, token: string): Promise<UserSummary | null> {
		const pageSize = 50;
		let targetPage = 1;
		let totalPages = 1;

		while (targetPage <= totalPages) {
			const data = (await fetchJson(
				`${PUBLIC_API_URL}/admin/users?page=${targetPage}&pageSize=${pageSize}`,
				token
			)) as PagedResponse;
			totalPages = data.totalPages ?? 1;
			const found = (data.items ?? []).find((u) => u.id === id);
			if (found) return found;
			targetPage += 1;
		}
		return null;
	}

	async function loadDetails() {
		loading = true;
		errorMessage = '';
		user = null;

		const token = localStorage.getItem('token');
		if (!token) {
			errorMessage = 'No hay sesión activa. Iniciá sesión con un usuario Dev.';
			loading = false;
			return;
		}

		try {
			const url = userId
				? `${PUBLIC_API_URL}/admin/user/${encodeURIComponent(userId)}`
				: `${PUBLIC_API_URL}/admin/user`;
			const full = (await fetchJson(url, token)) as UserResponse;

			if (userId && full.id !== userId) {
				const summary = await findInList(userId, token);
				if (!summary) {
					errorMessage = 'Usuario no encontrado.';
					return;
				}
				user = {
					id: summary.id,
					firstName: summary.firstName,
					lastName: summary.lastName,
					email: null,
					isEmailConfirmed: null,
					gender: null,
					birthDate: null,
					roles: summary.roles,
					shelterId: null,
					full: false
				};
				return;
			}

			user = {
				id: full.id,
				firstName: full.firstName,
				lastName: full.lastName,
				email: full.email,
				isEmailConfirmed: full.isEmailConfirmed,
				gender: full.gender,
				birthDate: full.birthDate,
				roles: full.roles,
				shelterId: full.shelterId ?? null,
				full: true
			};
		} catch (error) {
			if (error instanceof Error && error.message === 'UNAUTHORIZED') {
				errorMessage = 'No autorizado. Tu sesión expiró o no tiene rol Dev.';
			} else {
				errorMessage =
					error instanceof Error ? error.message : 'No se pudo conectar con la API.';
			}
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadDetails();
	});

	$effect(() => {
		if (userId) {
			loadDetails();
		}
	});
</script>

<div class="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
	<Button href={resolve('/admin/users')} variant="ghost" size="sm" class="mb-6 gap-2">
		<ArrowLeft class="h-4 w-4" /> Volver a usuarios
	</Button>

	{#if loading && !user}
		<Card.Root>
			<Card.Content class="space-y-3 pt-6">
				<Skeleton class="h-6 w-1/2" />
				<Skeleton class="h-4 w-2/3" />
				<Skeleton class="h-4 w-1/3" />
			</Card.Content>
		</Card.Root>
	{:else if errorMessage && !user}
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
	{:else if user}
		<div class="mb-6 rounded-2xl border bg-card p-5 shadow-sm">
			<div class="flex flex-wrap items-center gap-4">
				<div class="bg-primary/10 text-primary flex size-16 shrink-0 items-center justify-center rounded-2xl">
					<UserIcon class="h-8 w-8" />
				</div>
				<div class="min-w-52 flex-1">
					<h1 class="text-2xl font-bold tracking-tight">{fullName(user)}</h1>
					<p class="text-sm text-muted-foreground">
						Endpoint <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">GET /admin/user</code>
					</p>
					{#if user.roles && user.roles.length > 0}
						<div class="mt-2 flex flex-wrap gap-1.5">
							{#each user.roles as rol (rol)}
								<Badge variant="secondary" class="gap-1 border-none {getRoleColor(rol)}">
									<Shield class="h-3 w-3" />
									{rol}
								</Badge>
							{/each}
						</div>
					{:else}
						<p class="mt-2 text-sm text-muted-foreground">Sin roles asignados.</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<UserIcon class="h-4 w-4 text-muted-foreground" /> Información personal
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-3 text-sm">
					<div class="space-y-1">
						<span class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<Mail class="h-4 w-4" /> Correo electrónico
						</span>
						<p class="font-medium">{user.email ?? 'No disponible'}</p>
						{#if user.isEmailConfirmed !== null}
							{#if user.isEmailConfirmed}
								<Badge class="gap-1 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25">
									<CircleCheck class="h-3 w-3" /> Verificado
								</Badge>
							{:else}
								<Badge variant="secondary" class="gap-1">
									<CircleX class="h-3 w-3" /> Sin verificar
								</Badge>
							{/if}
						{/if}
					</div>
					<div class="space-y-1">
						<span class="text-sm font-medium text-muted-foreground">Género</span>
						<p class="font-medium">{formatGender(user.gender)}</p>
					</div>
					<div class="space-y-1">
						<span class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<Calendar class="h-4 w-4" /> Fecha de nacimiento
						</span>
						<p class="font-medium">{formatDate(user.birthDate)}</p>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<UsersRound class="h-4 w-4 text-muted-foreground" /> Cuenta
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-3 text-sm">
					<div class="space-y-1">
						<span class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<Fingerprint class="h-4 w-4" /> Identificador
						</span>
						<p class="rounded-lg bg-muted/60 px-3 py-2 font-mono text-xs break-all">{user.id}</p>
					</div>
					<div class="space-y-1">
						<span class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<House class="h-4 w-4" /> Refugio asignado
						</span>
						{#if user.shelterId}
							<a
								href="{resolve('/admin/shelters/details')}?id={user.shelterId}"
								class="inline-block rounded-lg bg-muted/60 px-3 py-1.5 font-mono text-xs transition-colors hover:bg-primary/10 hover:text-primary hover:underline"
								title="Ver detalle del refugio"
							>
								{user.shelterId}
							</a>
						{:else}
							<p class="font-medium text-muted-foreground">{user.full ? 'Sin refugio' : 'No disponible'}</p>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</div>
