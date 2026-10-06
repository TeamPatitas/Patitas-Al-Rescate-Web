<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { PetSceneContext } from './pet-scene.svelte';

	// Si hay una PetScene arriba, la mascota deambula por todo su espacio
	// y se cruza con las demás en vez de usar su propia cajita.
	const escena = getContext<PetSceneContext | null>('pet-scene') ?? null;

	const spriteModules = import.meta.glob<string>(
		'$lib/assets/pets/*/*_8fps.gif',
		{ eager: true, query: '?url', import: 'default' }
	);

	const LOCOMOTION = ['walk', 'walk_fast', 'run'];
	const IDLE_STATES = ['idle', 'lie', 'swipe', 'with_ball'];
	const SPEEDS: Record<string, number> = { walk: 2, walk_fast: 3.5, run: 5 };

	interface PetRegistry {
		[especie: string]: {
			[variante: string]: Record<string, string>;
		};
	}

	function buildRegistry(): PetRegistry {
		const registry: PetRegistry = {};
		const estados = [...LOCOMOTION, ...IDLE_STATES].sort((a, b) => b.length - a.length);

		for (const [path, url] of Object.entries(spriteModules)) {
			const file = path.split('/').pop() ?? '';
			const base = file.replace(/_8fps\.gif$/, '');
			const estado = estados.find((e) => base.endsWith(`_${e}`));
			if (!estado) continue;

			const variante = base.slice(0, base.length - estado.length - 1);
			const especie = path.split('/').at(-2) ?? 'dog';

			registry[especie] ??= {};
			registry[especie][variante] ??= {};
			registry[especie][variante][estado] = url;
		}
		return registry;
	}

	const registry = buildRegistry();

	function pick<T>(list: T[]): T {
		return list[Math.floor(Math.random() * list.length)];
	}

	function resolvePet(mascota: string): { especie: string; variante: string } {
		const especies = Object.keys(registry);
		if (mascota === 'random' || mascota === '') {
			const especie = pick(especies.length > 0 ? especies : ['dog']);
			const variantes = Object.keys(registry[especie] ?? {});
			return { especie, variante: pick(variantes.length > 0 ? variantes : ['red']) };
		}

		const [especiePedida, variantePedida] = mascota.split('/');
		const especie = registry[especiePedida] ? especiePedida : 'dog';
		const variantes = Object.keys(registry[especie] ?? {});
		const variante =
			variantePedida && registry[especie]?.[variantePedida]
				? variantePedida
				: pick(variantes.length > 0 ? variantes : ['red']);
		return { especie, variante };
	}

	let {
		// "especie/variante" (ej. "dog/red", "fox/white", "chicken/brown", "turtle/green"),
		// solo especie ("dog"), "random" o nada (aleatorio).
		mascota = 'random',
		ancho = 300,
		alto = 50
	} = $props();

	const pet = $derived(resolvePet(mascota));
	const sprites = $derived(registry[pet.especie]?.[pet.variante] ?? {});

	let x = $state(0);
	let direccion = $state<1 | -1>(1);
	let modo = $state<'walk' | 'idle'>('walk');
	let estado = $state('walk');
	let sprite = $state('');
	// Carril vertical aleatorio para que no se pisen perfecto al cruzarse.
	let carril = $state(0);

	const anchoMascota = 40;

	// Límites del espacio compartido (escena) o de la cajita propia.
	function limites() {
		const w = escena?.ancho || ancho;
		const h = escena?.alto || alto;
		return {
			maxX: Math.max(w - anchoMascota, 0),
			maxCarril: Math.max(h - anchoMascota, 0)
		};
	}

	function setEstado(next: string) {
		if (sprites[next]) {
			estado = next;
			sprite = sprites[next];
		}
	}

	// Elige un estado aleatorio entre los sprites que la variante realmente tiene
	// (ej. chicken no tiene "lie"). Si no hay ninguno, usa el primero disponible.
	function estadoAleatorio(preferidos: string[], excluir?: string) {
		const opciones = preferidos.filter((e) => sprites[e] && e !== excluir);
		if (opciones.length > 0) return pick(opciones);
		const disponibles = Object.keys(sprites);
		return disponibles.length > 0 ? pick(disponibles) : 'walk';
	}

	function empezarIdle() {
		modo = 'idle';
		// Idle aleatorio: elige un sprite de descanso distinto cada vez.
		setEstado(estadoAleatorio(IDLE_STATES, estado));
		// Se queda quieto entre 2 y 6 segundos y vuelve a caminar.
		setTimeout(() => {
			if (Math.random() < 0.35) direccion = (direccion * -1) as 1 | -1;
			modo = 'walk';
			setEstado(estadoAleatorio(LOCOMOTION));
		}, 2000 + Math.random() * 4000);
	}

	onMount(() => {
		const { maxX, maxCarril } = limites();
		x = Math.random() * maxX;
		carril = Math.random() * maxCarril;
		direccion = Math.random() < 0.5 ? 1 : -1;
		setEstado(estadoAleatorio(LOCOMOTION));

		const intervalo = setInterval(() => {
			if (modo !== 'walk') return;

			const { maxX: limite } = limites();
			x += (SPEEDS[estado] ?? 2) * direccion;

			if (x > limite) {
				x = limite;
				direccion = -1;
				// Al chocar a veces se detiene a descansar.
				if (Math.random() < 0.5) empezarIdle();
			}

			if (x < 0) {
				x = 0;
				direccion = 1;
				if (Math.random() < 0.5) empezarIdle();
			}

			// De vez en cuando se detiene a mitad del camino.
			if (Math.random() < 0.008) empezarIdle();
		}, 30);

		return () => clearInterval(intervalo);
	});
</script>

{#if escena}
	<!-- Modo escena: capa transparente sobre todo el espacio compartido. -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="absolute z-10"
			style="left: {x}px; bottom: {carril}px; transform: scaleX({direccion});"
		>
			{#if sprite}
				<img
					src={sprite}
					alt="Mascota {pet.especie} {pet.variante} ({estado})"
					class="h-10 w-10 object-contain"
					style="image-rendering: pixelated;"
				/>
			{/if}
		</div>
	</div>
{:else}
	<div
		class="relative flex items-end overflow-hidden"
		style="width: {ancho}px; height: {alto}px;"
	>
		<div
			class="pointer-events-none absolute bottom-0 z-10"
			style="transform: translateX({x}px) scaleX({direccion});"
		>
			{#if sprite}
				<img
					src={sprite}
					alt="Mascota {pet.especie} {pet.variante} ({estado})"
					class="h-10 w-10 object-contain"
					style="image-rendering: pixelated;"
				/>
			{/if}
		</div>
	</div>
{/if}
