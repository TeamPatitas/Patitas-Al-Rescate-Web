<script lang="ts">
	import EndpointList from "$lib/components/endpoint-list.svelte";
	import { extractEndpoints } from "$lib/utils.js";

    let { data } = $props();

    const pageFilter = "/shelter";

    let endpointsList = $derived(extractEndpoints(data.swaggerData, pageFilter));
</script>

<EndpointList 
    endpoints={endpointsList} 
    filterName={pageFilter} 
/>