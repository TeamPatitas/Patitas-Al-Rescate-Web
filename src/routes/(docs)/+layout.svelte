<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { BookOpen, Moon, Sun } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { mode, toggleMode } from 'mode-watcher';
	import { scale } from 'svelte/transition';
	import logo from '$lib/assets/icon.png';

	let { data, children } = $props();
	const items = $derived(data.menuItems);
</script>

<svelte:head>
	<title>API Docs</title>
</svelte:head>

<Sidebar.Provider>
	<Sidebar.Root collapsible="icon">
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg" tooltipContent="Patitas al Rescate">
						{#snippet child({ props })}
							<a href={resolve('/')} {...props} class="flex items-center gap-2">
								<img src={logo} alt="Patitas al Rescate" class="size-8 rounded-lg object-contain" />
								<div class="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
									<span class="truncate font-semibold">API REST Docs</span>
								</div>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>

		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Principal</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each items as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton class="px-5" tooltipContent={item.title}>
									{#snippet child({ props })}
										<a href={item.url} {...props}>
											<span>{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>

			<Sidebar.Group>
				<Sidebar.GroupLabel>Otros</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton class="px-5" tooltipContent="Shemas">
								{#snippet child({ props })}
									<a href={resolve("/docs/schemas")} {...props}>
										<span>Schemas</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>

		<Sidebar.Footer>
			<div class="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
				Patitas al Rescate API REST
			</div>
		</Sidebar.Footer>

		<Sidebar.Rail />
	</Sidebar.Root>

	<Sidebar.Inset>
		<header class="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 backdrop-blur">
			<div class="flex items-center gap-2">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4" />
				<div class="flex items-center gap-2">
					<BookOpen class="h-4 w-4 text-orange-600" />
					<span class="font-semibold">Documentación</span>
				</div>
			</div>
			<Button variant="outline" size="icon" onclick={toggleMode} aria-label="Cambiar tema" class="rounded-full shrink-0">
				{#key mode.current}
					<span in:scale={{ duration: 220, start: 0.6 }} out:scale={{ duration: 140, start: 0.6 }} class="inline-flex">
						{#if mode.current === 'dark'}
							<Sun class="h-4 w-4 text-amber-500" />
						{:else}
							<Moon class="h-4 w-4 text-orange-600" />
						{/if}
					</span>
				{/key}
			</Button>
		</header>
		<div class="flex flex-1 flex-col">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
