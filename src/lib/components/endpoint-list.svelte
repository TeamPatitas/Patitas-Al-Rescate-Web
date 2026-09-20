<script lang="ts">
    /* eslint-disable svelte/require-each-key */
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import { Badge } from "$lib/components/ui/badge";
    import { getMethodColor, type EndpointInfo } from "$lib/utils";
	import { resolve } from "$app/paths";

    let { 
        endpoints, 
        filterName = "esta sección"
    }: { 
        endpoints: EndpointInfo[];
        filterName?: string;
    } = $props();
</script>

<div class="max-w-4xl px-4 py-8 md:px-6 mx-auto w-full">
    {#each endpoints as ep}
        <Card.Root class="my-10 scroll-mt-20" id={ep.id}>
            <Card.Header class="border-b">
                <div class="flex items-center gap-3">
                    <Badge variant="outline" class="text-sm font-bold border-none {getMethodColor(ep.method)}">
                        {ep.method}
                    </Badge>
                    <Card.Title class="text-xl font-mono text-primary tracking-tight">
                        {ep.path}
                    </Card.Title>
                </div>
            </Card.Header>
            
            <Card.Content class="pt-2 gap-8">
                <div class="space-y-6">
                    <div>
                        <p class="text"><span class="font-bold">Nombre en API:</span> {ep.apiname}</p>
                    </div>

                    {#if ep.description}
                    <div>
                        <p class="text-muted-foreground">{ep.description}</p>
                    </div>
                    {/if}

                    {#if ep.cooldown}
                        <div>
                            <h4 class="text-xs font-semibold uppercase text-muted-foreground mb-2">
                                Cooldown
                            </h4>
                            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                                <p class="text">
                                    {ep.cooldown} entre cada petición.
                                </p>
                            </div>
                        </div>
                    {/if}

                    {#if ep.roles}
                        <div>
                            <h4 class="text-xs font-semibold uppercase text-muted-foreground mb-2">Política de Roles</h4>
                            <Badge variant="secondary">{ep.roles}</Badge>
                        </div>
                    {/if}

                    {#if ep.parameters.length > 0}
                        <div>
                            <h4 class="text-xs font-semibold uppercase text-muted-foreground mb-2">Parámetros</h4>
                            <div class="border rounded-md">
                                <Table.Root>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.Head>Nombre</Table.Head>
                                            <Table.Head>Ubicación</Table.Head>
                                            <Table.Head class="text-right">Condición</Table.Head>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {#each ep.parameters as param}
                                            <Table.Row>
                                                <Table.Cell class="font-mono text-sm">{param.name}</Table.Cell>
                                                <Table.Cell class="text-muted-foreground text-xs uppercase">{param.in}</Table.Cell>
                                                <Table.Cell class="text-right">
                                                    {#if param.required}
                                                        <span class="text-red-500 text-xs font-semibold">REQUIRED</span>
                                                    {:else}
                                                        <span class="text-muted-foreground text-xs">OPTIONAL</span>
                                                    {/if}
                                                </Table.Cell>
                                            </Table.Row>
                                        {/each}
                                    </Table.Body>
                                </Table.Root>
                            </div>
                        </div>
                    {/if}
                    
                    {#if ep.reqSchema || ep.resSchema}
                        <div class="grid grid-cols-1 gap-4 bg-muted/20 p-4 rounded-lg border">
                            {#if ep.reqSchema}
                                <div>
                                    <span class="text-xs font-semibold text-muted-foreground block">RequestBody:</span>
                                    <a href={resolve(`/docs/schemas#${ep.reqSchema}`)} class="text-sm font-mono text-primary hover:underline flex items-center gap-1 mt-1">
                                        {ep.reqSchema}
                                    </a>
                                </div>
                            {/if}

                            {#if ep.resSchema}
                                <div>
                                    <span class="text-xs font-semibold text-muted-foreground block">ResponseBody (200 OK):</span>
                                    <a href={resolve(`/docs/schemas#${ep.resSchema}`)} class="text-sm font-mono text-primary hover:underline flex items-center gap-1 mt-1">
                                        {ep.resSchema}
                                    </a>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            </Card.Content>
        </Card.Root>
    {/each}

    {#if endpoints.length === 0}
        <div class="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            No se encontraron endpoints para la sección "{filterName}".
        </div>
    {/if}
</div>