<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { PUBLIC_API_URL } from "$env/static/public"
	import { menuItems } from '$lib/utils.js';
</script>

<div class="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 lg:py-10">
	<h1 class="mt-4 text-4xl font-extrabold tracking-tight">Documentación de la API</h1>
	<p class="mt-2 text-muted-foreground">
		Base URL <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{PUBLIC_API_URL}</code>
	</p>
	<p class="mt-2 text-sm text-muted-foreground">
		Hola pez, acá vas a encontrar toda la información de la API del proyecto "Patitas al Rescate" 
	</p>

	<div class="mt-8 grid gap-4 md:grid-cols-2">
		{#each menuItems["Principal"] as item (item.title)}
		{#if item.title != "Inicio"}
			<Card.Root class="group hover:shadow-md transition-shadow">
			<Card.Header>
				<div class="bg-orange-600 text-white flex size-9 items-center justify-center rounded-xl">
					<item.icon />
				</div>
				<Card.Title>{item.title}</Card.Title>
				<Card.Description>{item.description}</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button href={resolve('/docs/admin')} class="w-full rounded-full">Ver Detalles<ArrowRight class="ml-2 h-4 w-4" /></Button>
			</Card.Footer>
			
		</Card.Root>
		{/if}
		{/each}
		
	</div>
</div>
