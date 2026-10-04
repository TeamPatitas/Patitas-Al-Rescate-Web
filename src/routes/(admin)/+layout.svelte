<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount, setContext } from 'svelte';
    import * as Sidebar from '$lib/components/ui/sidebar';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { Moon, Sun, User as UserIcon } from '@lucide/svelte';
	import { mode, toggleMode } from 'mode-watcher';
	import { scale } from 'svelte/transition';
	import logo from '$lib/assets/icon.png';
	import { adminPanelItems, getMenuItemByUrl, type Headeroptions } from '$lib/utils.js';

	let { children } = $props();
	let authorized = $state(false);
    let headerOptions: Headeroptions = $state(adminPanelItems.Principal[0]);

	onMount(async () => {
		if (!auth.user) {
			await auth.init();
		}

		if (!auth.user?.roles?.includes('Dev')) {
			await goto(resolve('/user'));
			return;
		}

		authorized = true;
	});

    setContext("header-options", headerOptions);
	afterNavigate((navigation) => {
        const actualPath = navigation.to?.url.pathname ?? "/admin/health";

		let element = getMenuItemByUrl(actualPath, adminPanelItems)!;
		headerOptions.icon = element.icon;
		headerOptions.title = element.title;
    });
</script>
<svelte:head>
	<title>Admin Panel</title>
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
									<span class="truncate font-semibold">Panel Admin</span>
								</div>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>

		<Sidebar.Content>
            {#each Object.entries(adminPanelItems) as [groupName, items](groupName)}
                <Sidebar.Group>
                    <Sidebar.GroupLabel>{groupName}</Sidebar.GroupLabel>
                    <Sidebar.GroupContent>
                        <Sidebar.Menu>
                            {#each items as item (item.title)}
                                <Sidebar.MenuItem>
                                    <Sidebar.MenuButton class="px-3" tooltipContent={item.title}>
                                        {#snippet child({ props })}
                                            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve-->
                                            <a href={item.url} {...props} >
                                                <item.icon class="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </a>
                                        {/snippet}
                                    </Sidebar.MenuButton>
                                </Sidebar.MenuItem>
                            {/each}
                        </Sidebar.Menu>
                    </Sidebar.GroupContent>
                </Sidebar.Group>
            {/each}
        </Sidebar.Content>

		<Sidebar.Footer>
			<div class="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
				Patitas Al Rescate Admin
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
					<headerOptions.icon class="h-4 w-4 text-orange-600" />
					<span class="font-semibold">{headerOptions.title}</span>
				</div>
			</div>
			<div class="flex shrink-0 items-center gap-2">
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
				<a
					href={resolve('/user')}
					class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-muted transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background"
					title="Ir a mi perfil"
				>
					{#if auth.user?.photoUrl}
						<img src={auth.user.photoUrl} alt="Perfil" class="h-full w-full object-cover" />
					{:else}
						<UserIcon class="h-5 w-5 text-muted-foreground" />
					{/if}
				</a>
			</div>
		</header>
		<div class="flex flex-1 flex-col">
			{#if authorized}
                {@render children()}
            {/if}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>