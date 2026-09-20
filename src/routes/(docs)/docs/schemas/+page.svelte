<script>
	import SchemasList from "$lib/components/schemas-list.svelte";
    let { data } = $props();
</script>

<SchemasList data={data} />