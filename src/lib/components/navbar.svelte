<script lang="ts">
	import logo from '$lib/assets/icon.png';
	import { Button } from '$lib/components/ui/button';
	import NavigationMenu from '$lib/components/ui/navigation-menu/navigation-menu.svelte';
	import NavigationMenuItem from '$lib/components/ui/navigation-menu/navigation-menu-item.svelte';
	import NavigationMenuLink from '$lib/components/ui/navigation-menu/navigation-menu-link.svelte';
	import NavigationMenuList from '$lib/components/ui/navigation-menu/navigation-menu-list.svelte';
	import { mode, toggleMode } from 'mode-watcher';
	import { Moon, Sun } from '@lucide/svelte';
	import { resolve } from "$app/paths"
</script>

<header class="sticky top-0 z-50 w-full border-b bg-card shadow-sm dark:bg-card">
	<div class="container mx-auto flex h-16 items-center justify-between px-4">
		<!-- Left: Logo + Navigation -->
		<div class="flex items-center gap-6">
			<a href="{resolve("/")}" class="flex items-center gap-2">
				<img src={logo} alt="Patitas al Rescate" class="h-8 w-auto" />
				<span class="hidden text-lg font-semibold sm:inline-block">Patitas al Rescate</span>
			</a>

			<NavigationMenu viewport={false}>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuLink href="/">Inicio</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink href={resolve("/docs")}>
							Documentación
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
		</div>

		<!-- Right: Theme Button + Login -->
		<div class="flex items-center gap-4">
			<Button
				variant="outline"
				size="icon"
				onclick={toggleMode}
				aria-label="Cambiar tema"
				class="rounded-full"
			>
				{#if mode.current === 'dark'}
					<Sun class="h-4 w-4" />
				{:else}
					<Moon class="h-4 w-4" />
				{/if}
			</Button>

			<Button variant="default">Iniciar sesión</Button>
		</div>
	</div>
</header>
