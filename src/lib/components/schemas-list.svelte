<script lang="ts">
    /* eslint-disable @typescript-eslint/no-explicit-any */
    /* eslint-disable svelte/require-each-key */
    import Badge from '$lib/components/ui/badge/badge.svelte';
    import * as Card from '$lib/components/ui/card';
    import * as Table from '$lib/components/ui/table';
    
    import DOMPurify from 'isomorphic-dompurify';
    import { replaceDecorators } from '$lib/utils.js';

    let { data } = $props();

    let schemasList = $derived(() => {
        const swagger = data.swaggerData;
        const schemas = swagger.components?.schemas || {};
        const paths = swagger.paths || {};

        return Object.entries(schemas)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, schemaDetails]: [string, any]) => !schemaDetails.enum)
            .map(([schemaName, schemaDetails]: [string, any]) => {
                
                const usages: { method: string; path: string; link: string }[] = [];
                const refString = `#/components/schemas/${schemaName}`;

                for (const [pathUrl, methods] of Object.entries(paths)) {
                    for (const [method, methodDetails] of Object.entries(methods as object)) {
                        if (JSON.stringify(methodDetails).includes(refString)) {
                            
                            const id = `${method}-${pathUrl}`.replace(/[^a-zA-Z0-9]/g, '-');
                            const section = pathUrl.split('/')[1] || '';
                            let docPage = '/docs';
                            if (section === 'admin') docPage = '/docs/admin';
                            else if (section === 'auth') docPage = '/docs/auth';
                            else if (section === 'pet') docPage = '/docs/pets';
                            else if (section === 'shelter') docPage = '/docs/shelters';

                            usages.push({ 
                                method: method.toUpperCase(), 
                                path: pathUrl,
                                link: `${docPage}#${id}`
                            });
                        }
                    }
                }

                let properties: { 
                    name: string; 
                    type: string; 
                    required: boolean;
                    enumRef: string | null;
                    schemaRef: string | null;
                    description: string | null;
                }[] = [];

                if (schemaDetails.properties) {
                    properties = Object.entries(schemaDetails.properties).map(
                        ([propName, propVal]: [string, any]) => {
                            let type = propVal.type;
                            let enumRef = null;
                            let schemaRef = null;

                            if (propVal.$ref) {
                                const refName = propVal.$ref.replace('#/components/schemas/', '');
                                type = refName;
                                
                                if (schemas[refName]?.enum) enumRef = refName;
                                else schemaRef = refName;

                            } else if (propVal.type === 'array' && propVal.items?.$ref) {
                                const refName = propVal.items.$ref.replace('#/components/schemas/', '');
                                type = `Array<${refName}>`;
                                
                                if (schemas[refName]?.enum) enumRef = refName;
                                else schemaRef = refName;

                            } else if (propVal.type === 'array' && propVal.items?.type) {
                                type = `Array<${propVal.items.type}>`;
                            }

                            if (propVal.format) type += ` (${propVal.format})`;
                            const isRequired = schemaDetails.required?.includes(propName) ?? false;
                            
                            return { 
                                name: propName, 
                                type, 
                                required: isRequired, 
                                enumRef, 
                                schemaRef,
                                description: propVal.description || null
                            };
                        }
                    );
                }

                return {
                    name: schemaName,
                    properties,
                    usages
                };
            });
    });
</script>

<div class="max-w-4xl px-4 py-8 md:px-6 mx-auto w-full">
    {#each schemasList() as schema}
        <Card.Root class="my-6 scroll-mt-20" id={schema.name}>
            <Card.Header>
                <Card.Title class="text-xl text-primary">{schema.name}</Card.Title>
            </Card.Header>

            <Card.Content>
                <div class="mb-8">
                    <h3 class="text-sm font-semibold text-muted-foreground mb-3 tracking-wider uppercase">
                        USOS
                    </h3>
                    {#if schema.usages.length > 0}
                        <div class="gap-2 flex flex-wrap">
                            {#each schema.usages as usage}
                                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                                <a href={usage.link} class="hover:opacity-80 transition-opacity">
                                    <Badge variant="secondary" class="font-mono text-xs cursor-pointer hover:bg-secondary/80">
                                        <span class="font-bold mr-2">{usage.method}</span>
                                        {usage.path}
                                    </Badge>
                                </a>
                            {/each}
                        </div>
                    {:else}
                        <p class="text-sm text-muted-foreground italic">
                            No hay referencias directas en los endpoints.
                        </p>
                    {/if}
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-muted-foreground mb-3 tracking-wider uppercase">
                        Atributos
                    </h3>
                    <div class="rounded-md border">
                        <Table.Root>
                            <Table.Header>
                                <Table.Row>
                                    <Table.Head class="w-[30%]">Atributo</Table.Head>
                                    <Table.Head class="w-[30%]">Tipo</Table.Head>
                                    <Table.Head class="w-[40%]">Nota</Table.Head>
                                    <Table.Head class="text-right w-[10%]">Condición</Table.Head>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {#each schema.properties as prop}
                                    <Table.Row>
                                        <Table.Cell class="font-medium font-mono text-sm">
                                            {prop.name}
                                        </Table.Cell>
                                        
                                        <Table.Cell class="text-muted-foreground">
                                            {#if prop.enumRef}
                                                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                                                <a href="/docs/enums#{prop.enumRef}" class="text-primary hover:underline font-mono">
                                                    {prop.type}
                                                </a>
                                            {:else if prop.schemaRef}
                                                <a href="#{prop.schemaRef}" class="text-primary hover:underline font-mono">
                                                    {prop.type}
                                                </a>
                                            {:else}
                                                {prop.type}
                                            {/if}
                                        </Table.Cell>

                                        <Table.Cell class="text-muted-foreground text-sm">
                                            {#if prop.description}
                                                <div class="prose prose-sm dark:prose-invert">
                                                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                                    {@html DOMPurify.sanitize(replaceDecorators(prop.description))}
                                                </div>
                                            {:else}
                                                <span class="italic opacity-50">Sin nota</span>
                                            {/if}
                                        </Table.Cell>

                                        <Table.Cell class="text-right">
                                            {#if prop.required}
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
            </Card.Content>
        </Card.Root>
    {/each}
</div>