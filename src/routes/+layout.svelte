<script lang="ts">
	import './layout.css';
	import '../app.css';
	import { auth } from '$lib/auth.svelte';
	import favicon from '$lib/assets/favicon.ico';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';


    let { children } = $props();
	onMount(() => {
        auth.init();
    });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
	<link rel="manifest" href="site.webmanifest">
</svelte:head>
<ModeWatcher disableTransitions={false} />

{@render children()}