<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	/* eslint-disable svelte/require-each-key */
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	let { data } = $props();

	let schemasList = $derived(() => {
		const swagger = data.swaggerData;
		const schemas = swagger.components?.schemas || {};
		const paths = swagger.paths || {};

		return Object.entries(schemas).map(([schemaName, schemaDetails]: [string, any]) => {
			const usages: { method: string; path: string }[] = [];
			const refString = `#/components/schemas/${schemaName}`;

			for (const [pathUrl, methods] of Object.entries(paths)) {
				for (const [method, methodDetails] of Object.entries(methods as object)) {
					if (JSON.stringify(methodDetails).includes(refString)) {
						usages.push({ method: method.toUpperCase(), path: pathUrl });
					}
				}
			}

			let properties: { name: string; type: string; required: boolean }[] = [];

			if (schemaDetails.properties) {
				properties = Object.entries(schemaDetails.properties).map(
					([propName, propVal]: [string, any]) => {
						let type = propVal.type;
						if (propVal.$ref) {
							type = propVal.$ref.replace('#/components/schemas/', '');
						} else if (propVal.type === 'array' && propVal.items?.$ref) {
							type = `Array<${propVal.items.$ref.replace('#/components/schemas/', '')}>`;
						} else if (propVal.type === 'array' && propVal.items?.type) {
							type = `Array<${propVal.items.type}>`;
						}

						if (propVal.format) type += ` (${propVal.format})`;
						const isRequired = schemaDetails.required?.includes(propName) ?? false;
						return { name: propName, type, required: isRequired };
					}
				);
			} else if (schemaDetails.enum) {
				properties = [
					{
						name: 'Valores permitidos',
						type: schemaDetails.enum.join(', '),
						required: true
					}
				];
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
	<div class="mb-6 gap-3 flex items-center">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Schemas</h1>
		</div>
	</div>

	{#each schemasList() as schema}
		<Card.Root class="my-6 scroll-mt-20" id={schema.name}>
			<Card.CardHeader>
				<Card.CardTitle class="text-xl text-primary">{schema.name}</Card.CardTitle>
			</Card.CardHeader>

			<Card.CardContent>
				<div>
					<h3 class="text-sm font-semibold text-muted-foreground mb-3 tracking-wider uppercase">
						USOS
					</h3>
					{#if schema.usages.length > 0}
						<div class="gap-2 flex flex-wrap">
							{#each schema.usages as usage}
								<Badge variant="secondary" class="font-mono text-xs">
									<span class="font-bold mr-2">{usage.method}</span>
									{usage.path}
								</Badge>
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
							<Table.TableHeader>
								<Table.TableRow>
									<Table.TableHead class="w-[30%]">Atributo</Table.TableHead>
									<Table.TableHead class="w-[40%]">Tipo</Table.TableHead>
									<Table.TableHead class="text-right">Requerido</Table.TableHead>
								</Table.TableRow>
							</Table.TableHeader>
							<Table.TableBody>
								{#each schema.properties as prop}
									<Table.TableRow>
										<Table.TableCell class="font-medium font-mono text-sm">
											{prop.name}
										</Table.TableCell>
										<Table.TableCell class="text-muted-foreground">
											{prop.type}
										</Table.TableCell>
										<Table.TableCell class="text-right">
											{#if prop.required}
												<Badge
													variant="default"
													class="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none"
													>Sí</Badge
												>
											{:else}
												<Badge variant="outline" class="text-muted-foreground border-dashed"
													>Opcional</Badge
												>
											{/if}
										</Table.TableCell>
									</Table.TableRow>
								{/each}
							</Table.TableBody>
						</Table.Root>
					</div>
				</div>
			</Card.CardContent>
		</Card.Root>
	{/each}
</div>
