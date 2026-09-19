
<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import Navbar from '$lib/components/navbar.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
	<link rel="manifest" href="site.webmanifest">
	<title>Patitas al Rescate</title>
</svelte:head>


<ModeWatcher disableTransitions={false} />
<Navbar />

<main class="container mx-auto p-4">
	{@render children()}
</main>
