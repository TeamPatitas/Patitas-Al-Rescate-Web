<script lang="ts">
    /* eslint-disable @typescript-eslint/no-explicit-any */
    /* eslint-disable svelte/require-each-key */
    import Badge from '$lib/components/ui/badge/badge.svelte';
    import * as Card from '$lib/components/ui/card';
    import * as Table from '$lib/components/ui/table';
    
    let { data } = $props();

    let enumsList = $derived(() => {
        const swagger = data.swaggerData;
        const schemas = swagger.components?.schemas || {};

        return Object.entries(schemas)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, schemaDetails]: [string, any]) => schemaDetails.enum)
            .map(([enumName, enumDetails]: [string, any]) => {
                
                const usedInSchemas: { name: string; link: string }[] = [];
                const refString = `#/components/schemas/${enumName}`;

                for (const [schemaName, otherSchemaDetails] of Object.entries(schemas)) {
                    if (schemaName !== enumName && JSON.stringify(otherSchemaDetails).includes(refString)) {
                        usedInSchemas.push({ 
                            name: schemaName, 
                            link: `/docs/schemas#${schemaName}` 
                        });
                    }
                }
                
                let typeText = enumDetails.type || 'desconocido';
                if (enumDetails.format) typeText += ` (${enumDetails.format})`;

                return {
                    name: enumName,
                    type: typeText,
                    values: enumDetails.enum,
                    usedInSchemas
                };
            });
    });
</script>

<div class="max-w-4xl px-4 py-8 md:px-6 mx-auto w-full">
    <div class="mb-6 gap-3 flex items-center">
        <div>
            <h1 class="text-2xl font-bold tracking-tight">Enums</h1>
            <p class="text-muted-foreground text-sm mt-1">
                Catálogos y valores fijos permitidos por la API.
            </p>
        </div>
    </div>

    {#each enumsList() as enumItem}
        <Card.Root class="my-6 scroll-mt-20" id={enumItem.name}>
            <Card.Header>
                <div class="flex items-center justify-between">
                    <Card.Title class="text-xl text-primary">{enumItem.name}</Card.Title>
                    <Badge variant="outline" class="font-mono text-xs">{enumItem.type}</Badge>
                </div>
            </Card.Header>

            <Card.Content>
                <div class="mb-8">
                    <h3 class="text-sm font-semibold text-muted-foreground mb-3 tracking-wider uppercase">
                        Usado en (Esquemas)
                    </h3>
                    {#if enumItem.usedInSchemas.length > 0}
                        <div class="gap-2 flex flex-wrap">
                            {#each enumItem.usedInSchemas as usage}
                                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                                <a href={usage.link} class="hover:opacity-80 transition-opacity">
                                    <Badge variant="secondary" class="font-mono text-xs cursor-pointer hover:bg-secondary/80">
                                        {usage.name}
                                    </Badge>
                                </a>
                            {/each}
                        </div>
                    {:else}
                        <p class="text-sm text-muted-foreground italic">
                            No hay esquemas que referencien este enum directamente.
                        </p>
                    {/if}
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-muted-foreground mb-3 tracking-wider uppercase">
                        Valores Permitidos
                    </h3>
                    <div class="rounded-md border">
                        <Table.Root>
                            <Table.Header>
                                <Table.Row>
                                    <Table.Head >Índice</Table.Head>
                                    <Table.Head>Valor</Table.Head>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {#each enumItem.values as val, i}
                                    <Table.Row>
                                        <Table.Cell class="font-bold font-mono text-base">
                                            {i}
                                        </Table.Cell>
                                        <Table.Cell class="font-bold font-mono text-base">
                                            {val}
                                        </Table.Cell>
                                    </Table.Row>
                                {/each}
                            </Table.Body>
                        </Table.Root>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>
    {/each}

    {#if enumsList().length === 0}
        <div class="text-center py-12 text-muted-foreground border border-dashed rounded-lg mt-8">
            No se encontraron Enums definidos en la documentación de Swagger.
        </div>
    {/if}
</div>