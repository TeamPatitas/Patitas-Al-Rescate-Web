<script>
	import SchemasList from "$lib/components/docs/schemas-list.svelte";
    let { data } = $props();
</script>

<SchemasList data={data} />