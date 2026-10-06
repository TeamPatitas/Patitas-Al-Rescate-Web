<script lang="ts">
	import { onDestroy } from 'svelte';

	let {
		/** Texto a escribir letra por letra. */
		texto = '',
		/** Milisegundos por caracter. */
		velocidad = 50
	} = $props();

	let visible = $state('');
	let intervalo: ReturnType<typeof setInterval> | null = null;

	function escribir() {
		if (intervalo) clearInterval(intervalo);
		visible = '';
		let i = 0;
		intervalo = setInterval(() => {
			i += 1;
			visible = texto.slice(0, i);
			if (i >= texto.length && intervalo) {
				clearInterval(intervalo);
				intervalo = null;
			}
		}, Math.max(velocidad, 1));
	}

	$effect(() => {
		// Se reinicia la animación cada vez que cambia el texto o la velocidad.
		void texto;
		void velocidad;
		escribir();
	});

	onDestroy(() => {
		if (intervalo) clearInterval(intervalo);
	});
</script>

<span class="font-minecraft" aria-label={texto}>
	{visible}<span class="cursor-minecraft" aria-hidden="true">▌</span>
</span>

<style>
	.cursor-minecraft {
		animation: minecraft-blink 1s steps(1) infinite;
	}
	@keyframes minecraft-blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}
</style>
