<script lang="ts">
    import { onMount } from 'svelte';

    const config = {
        stands: [
            {
                name: 'Lower Stand Circle',
                innerRadius: 80,
                outerRadius: 140,
                sectors: [
                    { label: 'A lower', color: 'rgba(144, 238, 144, 0.54)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'A lower',url:'https://frigate.mcc.edu.tw/cameras/10.1.1.10/snapshot.jpg'}]},
                    { label: 'B lower', color: 'rgba(144, 238, 144, 0.58)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'C lower', color: 'rgba(144, 238, 144, 0.62)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'D lower', color: 'rgba(144, 238, 144, 0.66)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'E lower', color: 'rgba(144, 238, 144, 0.70)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'F lower', color: 'rgba(144, 238, 144, 0.74)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'G lower', color: 'rgba(144, 238, 144, 0.78)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'H lower', color: 'rgba(144, 238, 144, 0.82)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'I lower', color: 'rgba(144, 238, 144, 0.86)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'J lower', color: 'rgba(144, 238, 144, 0.90)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'K lower', color: 'rgba(144, 238, 144, 0.94)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'MCC stand', color: 'rgba(144, 238, 144, 0.98)', hovered: false ,snapshot_urls:[],frigate_urls:[]}
                ]
            },
            {
                name: 'Upper Stand Circle',
                innerRadius: 90,
                outerRadius: 140,
                sectors: [
                    { label: 'A upper', color: 'rgba(173, 216, 230, 0.54)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'B upper', color: 'rgba(173, 216, 230, 0.58)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'C upper', color: 'rgba(173, 216, 230, 0.62)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'D upper', color: 'rgba(173, 216, 230, 0.66)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'E upper', color: 'rgba(173, 216, 230, 0.70)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'F upper', color: 'rgba(173, 216, 230, 0.74)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'G upper', color: 'rgba(173, 216, 230, 0.78)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'H upper', color: 'rgba(173, 216, 230, 0.82)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'I upper', color: 'rgba(173, 216, 230, 0.86)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'J upper', color: 'rgba(173, 216, 230, 0.90)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'K upper', color: 'rgba(173, 216, 230, 0.94)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'MCC stand', color: 'rgba(173, 216, 230, 0.98)', hovered: false ,snapshot_urls:[],frigate_urls:[]}
                ]
            },
            {
                name: 'Concourse',
                innerRadius: 140,
                outerRadius: 180,
                sectors: [
                    { label: 'A concourse', color: 'rgba(240, 128, 128, 0.54)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'B concourse', color: 'rgba(240, 128, 128, 0.58)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'C concourse', color: 'rgba(240, 128, 128, 0.62)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'D concourse', color: 'rgba(240, 128, 128, 0.66)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'E concourse', color: 'rgba(240, 128, 128, 0.70)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'F concourse', color: 'rgba(240, 128, 128, 0.74)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'G concourse', color: 'rgba(240, 128, 128, 0.78)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'H concourse', color: 'rgba(240, 128, 128, 0.82)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'I concourse', color: 'rgba(240, 128, 128, 0.86)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'J concourse', color: 'rgba(240, 128, 128, 0.90)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'K concourse', color: 'rgba(240, 128, 128, 0.94)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'MCC stand', color: 'rgba(240, 128, 128, 0.98)', hovered: false ,snapshot_urls:[],frigate_urls:[]}
                ]
            }
        ],
        labels: [
            'MCC Section',
            ' A Stand',
            ' B Stand',
            ' C Stand',
            ' D Stand',
            ' E Stand',
            ' F Stand',
            ' G Stand',
            ' H Stand',
            ' I Stand',
            ' J Stand',
            ' K Stand'
        ]
    };

    let floor = 'ground'; // toggle for floor
    let currentSector = null; // Track the currently hovered sector

    const toggleFloor = () => {
        floor = floor === 'ground' ? 'first' : 'ground';
    };

    // Ensure the correct stands are displayed based on the selected floor
    const displayedStands = () => {
        return floor === 'ground' ? [config.stands[0], config.stands[2]] : [config.stands[1], config.stands[2]];
    };

    // Handle sector hover
    const handleSectorHover = (sector, isHovered) => {
        sector.hovered = isHovered;
        if (isHovered) {
            currentSector = sector;
        } else if (currentSector === sector) {
            currentSector = null;
        }
    };
</script>

<main>
    <div class="container">
        <div class="left-panel">
            <div on:click={toggleFloor} class="button" style="position: relative; width: 40%; z-index: 10; cursor: pointer; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; text-align: center; margin-bottom: 10px;">
                Toggle Floor: {floor}
            </div>
            <svg width="100%" height="100%" viewBox="-200 -200 400 400" style="position: relative; pointer-events: none;">
                {#each displayedStands() as stand, index}
                    <g>
                        {#each stand.sectors as sector, i}
                            {#if stand.name === 'Concourse'}
                                <text 
                                    x="{(stand.outerRadius  ) * Math.cos(((i * Math.PI) - (Math.PI * 0.4)) / 6)}" 
                                    y="{(stand.outerRadius ) * Math.sin(((i * Math.PI) -(Math.PI * 0.4))/ 6) }" 
                                    text-anchor="middle" 
                                    fill="rgba(255, 255, 255, 0.7)" 
                                    font-weight="normal" 
                                    font-size="0.8em">
                                    {config.labels[i]}
                                </text>
                            {/if}
                            <path d="M {stand.outerRadius * Math.cos((i * Math.PI) / 6)} {stand.outerRadius * Math.sin((i * Math.PI) / 6)} 
                                    A {stand.outerRadius} {stand.outerRadius} 0 0 1 
                                    {stand.outerRadius * Math.cos(((i + 1) * Math.PI) / 6)} {stand.outerRadius * Math.sin(((i + 1) * Math.PI) / 6)} 
                                    L {stand.innerRadius * Math.cos(((i + 1) * Math.PI) / 6)} {stand.innerRadius * Math.sin(((i + 1) * Math.PI) / 6)} 
                                    A {stand.innerRadius} {stand.innerRadius} 0 0 0 
                                    {stand.innerRadius * Math.cos((i * Math.PI) / 6)} {stand.innerRadius * Math.sin((i * Math.PI) / 6)} Z" 
                                fill={sector.color} stroke={sector.color} stroke-width="2" class="stand-path" 
                                on:mouseover={() => handleSectorHover(sector, true)} 
                                on:mouseout={() => handleSectorHover(sector, false)} 
                                style="pointer-events: auto; opacity: {sector.hovered ? 1 : 0.5};" />
                        {/each}
                        {#each stand.sectors as sector, i}
                            {#if sector.hovered}
                                <text 
                                    x="{(stand.innerRadius + (stand.outerRadius - stand.innerRadius) / 2) * Math.cos((i * Math.PI) / 6)}" 
                                    y="{(stand.innerRadius + (stand.outerRadius - stand.innerRadius) / 2) * Math.sin((i * Math.PI) / 6)}" 
                                    text-anchor="middle" 
                                    dominant-baseline="middle" 
                                    fill="white" 
                                    font-weight="bold"
                                    style="pointer-events: none; filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.7));"
                                >
                                    {sector.label}
                                </text>
                            {/if}
                        {/each}
                        <!-- Add sector lines -->
                        {#each Array(12) as _, i}
                            <line x1="0" y1="0" 
                                x2="{stand.outerRadius * Math.cos((i * Math.PI) / 6)}" 
                                y2="{stand.outerRadius * Math.sin((i * Math.PI) / 6)}" 
                                stroke="white" stroke-width="0.05" />
                        {/each}
                    </g>
                {/each}
            </svg>
        </div>
        
        <div class="right-panel">
            {#if currentSector && currentSector.snapshot_urls.length > 0}
                <div class="snapshot-container">
                    <h3>{currentSector.label} Snapshots</h3>
                    <div class="snapshot-grid">
                        {#each currentSector.snapshot_urls as url}
                            <div class="snapshot-item">
                                <img src={url} alt="Snapshot from {currentSector.label}" />
                            </div>
                        {/each}
                    </div>
                </div>
            {:else if currentSector}
                <div class="no-snapshots">
                    <p>No snapshots available for {currentSector.label}</p>
                </div>
            {:else}
                <div class="instructions">
                    <p>Hover over a sector to view available snapshots</p>
                </div>
            {/if}
        </div>
    </div>
</main>

<style>
    main {
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }
    .container {
        display: flex;
        width: 100%;
        height: 100%;
    }
    .left-panel {
        width: 50%;
        height: 100%;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .right-panel {
        width: 50%;
        height: 100%;
        padding: 20px;
        background-color: rgba(0, 0, 0, 0.05);
        overflow-y: auto;
    }
    .stand-path {
        transition: opacity 0.3s;
        cursor: pointer;
    }
    .snapshot-container {
        padding: 10px;
    }
    .snapshot-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 15px;
    }
    .snapshot-item {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .snapshot-item img {
        width: 100%;
        height: auto;
        display: block;
    }
    .no-snapshots, .instructions {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 8px;
        color: #666;
    }
    h3 {
        margin-top: 0;
        color: #333;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
    }
</style>
