<!-- Start Generation Here -->
<script lang="ts">
	import { json } from "stream/consumers";

    export let title: string;
    export let data: any[];
    export let mediaBaseUrl: string;
</script>

<div class="flex items-center justify-center h-screen">
    <h1 class="text-3xl font-bold">{title}</h1>
    <p>{JSON.stringify(data)}</p>
    <p>{JSON.stringify(mediaBaseUrl)}</p>
</div>
<!-- End Generation Here -->
