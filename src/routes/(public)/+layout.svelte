
<script lang="ts">
	import NavBar from '$lib/components/feed/navbar.svelte';

	let { children } = $props();
</script>
<svelte:head>
	<title>Patitas al Rescate</title>
</svelte:head>

<NavBar />

<main class="container mx-auto p-4">
	{@render children()}
</main>
