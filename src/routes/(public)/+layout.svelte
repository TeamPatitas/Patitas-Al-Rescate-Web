
<script lang="ts">
	import Navbar from '$lib/components/navbar.svelte';

	let { children } = $props();
</script>
<svelte:head>
	<title>Patitas al Rescate</title>
</svelte:head>

<Navbar />

<main class="container mx-auto p-4">
	{@render children()}
</main>
