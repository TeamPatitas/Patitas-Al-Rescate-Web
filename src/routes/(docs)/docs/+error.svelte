<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="px-4 flex min-h-[50vh] flex-col items-center justify-center text-center">
	<h1 class="text-6xl font-bold text-destructive mb-4">
		{page.status}
	</h1>

	<h2 class="text-2xl font-semibold mb-2">¡Ups! Algo salió mal</h2>

	<p class="text-muted-foreground mb-8">
		{page.error?.message ?? 'Error desconocido al conectar con la API.'}
	</p>
</div>
