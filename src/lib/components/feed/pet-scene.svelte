<script module lang="ts">
	export interface PetSceneContext {
		readonly ancho: number;
		readonly alto: number;
	}
</script>

<script lang="ts">
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';

	let {
		background = 'transparent',
		ancho = '100%',
		alto = 50,
		children
	}: {
		background?: string;
		ancho?: string | number;
		alto?: number;
		children?: Snippet;
	} = $props();

	const width = $derived(typeof ancho === 'number' ? `${ancho}px` : ancho);

	let medidoAncho = $state(0);
	let medidoAlto = $state(0);

	setContext<PetSceneContext>('pet-scene', {
		get ancho() {
			return medidoAncho;
		},
		get alto() {
			return medidoAlto;
		}
	});
</script>

<div
	class="relative overflow-hidden"
	style="width: {width}; height: {alto}px; background: {background};"
	bind:clientWidth={medidoAncho}
	bind:clientHeight={medidoAlto}
>
	{@render children?.()}
</div>
