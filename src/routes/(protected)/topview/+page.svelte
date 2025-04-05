<script lang="ts">
    import { onMount } from 'svelte';

    const config = {
        stands: [
            {
                name: 'Lower Stand Circle',
                innerRadius: 80,
                outerRadius: 140,
                sectors: [
                    { label: 'A lower', color: 'rgba(144, 238, 144, 0.54)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'B lower', color: 'rgba(144, 238, 144, 0.58)', hovered: false ,snapshot_urls:[],frigate_urls:[]},
                    { label: 'C lower', color: 'rgba(144, 238, 144, 0.62)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'C lower entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_C_STAND_LOWER_ENTRY2'}]},
                    { label: 'D lower', color: 'rgba(144, 238, 144, 0.66)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'D lower entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_D_STAND_LOWER_ENTRY4'}]},
                    { label: 'E lower', color: 'rgba(144, 238, 144, 0.70)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'E lower entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_E_STAND_LOWER_ENTRY6'}]},
                    { label: 'F lower', color: 'rgba(144, 238, 144, 0.74)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'F lower entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_F_STAND_LOWER_ENTRY8'}]},
                    { label: 'G lower', color: 'rgba(144, 238, 144, 0.78)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'G lower entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_G_STAND_LOWER_ENTRY10'}]},
                    { label: 'H lower', color: 'rgba(144, 238, 144, 0.82)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'H lower entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_H_STAND_LOWER_ENTRY12'}]},
                    { label: 'I lower', color: 'rgba(144, 238, 144, 0.86)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'I lower entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_I_STAND_LOWER_ENTRY14'}]},
                    { label: 'J lower', color: 'rgba(144, 238, 144, 0.90)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'J lower entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_J_STAND_LOWER_ENTRY16'}]},
                    { label: 'K lower', color: 'rgba(144, 238, 144, 0.94)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'K lower entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_K_STAND_LOWER_ENTRY18'}]},
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
                    { label: 'C upper', color: 'rgba(173, 216, 230, 0.62)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'C upper entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_C_STAND_UPPER_ENTRY1'}]},
                    { label: 'D upper', color: 'rgba(173, 216, 230, 0.66)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'D upper entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_D_STAND_UPPER_ENTRY3'}]},
                    { label: 'E upper', color: 'rgba(173, 216, 230, 0.70)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'E upper entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_E_STAND_UPPER_ENTRY5'}]},
                    { label: 'F upper', color: 'rgba(173, 216, 230, 0.74)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'F upper entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_F_STAND_UPPER_ENTRY7'}]},
                    { label: 'G upper', color: 'rgba(173, 216, 230, 0.78)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'G upper entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_G_STAND_UPPER_ENTRY9'}]},
                    { label: 'H upper', color: 'rgba(173, 216, 230, 0.82)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'H upper entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_H_STAND_UPPER_ENTRY11'}]},
                    { label: 'I upper', color: 'rgba(173, 216, 230, 0.86)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'I upper entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_I_STAND_UPPER_ENTRY13'}]},
                    { label: 'J upper', color: 'rgba(173, 216, 230, 0.90)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'J upper entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_J_STAND_UPPER_ENTRY15'}]},
                    { label: 'K upper', color: 'rgba(173, 216, 230, 0.94)', hovered: false ,snapshot_urls:[],frigate_urls:[{label:'K upper entry',url:'http://107.170.54.225:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_K_STAND_UPPER_ENTRY17'}]},
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
    let showFrigatePopup = false; // Control visibility of frigate popup
    let selectedSector = null; // Track the clicked sector for frigate links
    let showNoFrigateDialog = false; // Control visibility of no frigate dialog
    let activeTab = 'snapshots'; // Track active tab: 'snapshots' or 'frigate'

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

    // Handle sector click for frigate links
    const handleSectorClick = (sector) => {
        if (sector.frigate_urls.length === 0) {
            // No frigate links available
            showNoFrigateDialog = true;
            setTimeout(() => {
                showNoFrigateDialog = false;
            }, 3000);
        } else if (sector.frigate_urls.length === 1) {
            // Only one frigate link, redirect directly
            window.open(sector.frigate_urls[0].url, '_blank');
        } else {
            // Multiple frigate links, show popup
            selectedSector = sector;
            showFrigatePopup = true;
        }
    };

    // Open frigate link in new tab
    const openFrigateLink = (url) => {
        window.open(url, '_blank');
        showFrigatePopup = false;
    };

    // Close frigate popup
    const closeFrigatePopup = () => {
        showFrigatePopup = false;
    };

    // Switch between tabs
    const switchTab = (tab) => {
        activeTab = tab;
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
                                on:click={() => handleSectorClick(sector)}
                                style="pointer-events: auto; opacity: {sector.hovered ? 1 : 0.5}; cursor: pointer;" />
                            {#if sector.hovered}
                                <text 
                                    x="{(stand.innerRadius + (stand.outerRadius - stand.innerRadius) / 2) * Math.cos(((i + 0.5) * Math.PI) / 6)}" 
                                    y="{(stand.innerRadius + (stand.outerRadius - stand.innerRadius) / 2) * Math.sin(((i + 0.5) * Math.PI) / 6)}" 
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
            <div class="tabs">
                <div class={`tab ${activeTab === 'snapshots' ? 'active' : ''}`} on:click={() => switchTab('snapshots')} style={`color: ${activeTab !== 'snapshots' ? 'black' : 'white'}`}>
                    Snapshots
                </div>
                <div class={`tab ${activeTab === 'frigate' ? 'active' : ''}`} on:click={() => switchTab('frigate')} style={`color: ${activeTab !== 'frigate' ? 'black' : 'white'}`}>
                    Live CCTV
                </div>
            </div>
            
            {#if activeTab === 'snapshots'}
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
                        <p>Click on a sector to access live CCTV cameras (if available)</p>
                    </div>
                {/if}
            {:else if activeTab === 'frigate'}
                {#if currentSector && currentSector.frigate_urls.length > 0}
                    <div class="frigate-container">
                        <h3>{currentSector.label} Live CCTV</h3>
                        <div class="frigate-grid">
                            {#each currentSector.frigate_urls as camera}
                                <div class="frigate-item">
                                    <h4>{camera.label}</h4>
                                    <iframe 
                                        src={camera.url} 
                                        title={camera.label} 
                                        frameborder="0" 
                                        allowfullscreen
                                    ></iframe>
                                    <button class="open-button" on:click={() => openFrigateLink(camera.url)}>
                                        Open in New Tab
                                    </button>
                                </div>
                            {/each}
                        </div>
                    </div>
                {:else if currentSector}
                    <div class="no-frigate">
                        <p>No live CCTV cameras available for {currentSector.label}</p>
                    </div>
                {:else}
                    <div class="instructions">
                        <p>Hover over a sector to view available live CCTV cameras</p>
                        <p>Click on a sector to open cameras in a new tab</p>
                    </div>
                {/if}
            {/if}
        </div>
    </div>

    <!-- Frigate Links Popup -->
    {#if showFrigatePopup && selectedSector}
        <div class="popup-overlay">
            <div class="popup-content">
                <div class="popup-header">
                    <h3>Live CCTV Cameras - {selectedSector.label}</h3>
                    <button class="close-button" on:click={closeFrigatePopup}>×</button>
                </div>
                <div class="popup-body">
                    <ul class="camera-list">
                        {#each selectedSector.frigate_urls as camera}
                            <li on:click={() => openFrigateLink(camera.url)}>
                                {camera.label}
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        </div>
    {/if}

    <!-- No Frigate Dialog -->
    {#if showNoFrigateDialog}
        <div class="dialog-overlay">
            <div class="dialog-content">
                <p>No live CCTV cameras available in this area</p>
            </div>
        </div>
    {/if}
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
        display: flex;
        flex-direction: column;
    }
    .tabs {
        display: flex;
        margin-bottom: 20px;
        border-bottom: 1px solid #ddd;
    }
    .tab {
        padding: 10px 20px;
        cursor: pointer;
        border-radius: 5px 5px 0 0;
        margin-right: 5px;
        background-color: #f0f0f0;
        transition: background-color 0.3s;
    }
    .tab.active {
        background-color: #007bff;
        color: white;
        border-bottom: none;
    }
    .stand-path {
        transition: opacity 0.3s;
        cursor: pointer;
    }
    .snapshot-container, .frigate-container {
        padding: 10px;
    }
    .snapshot-grid, .frigate-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
        margin-top: 15px;
    }
    .snapshot-item, .frigate-item {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .snapshot-item img {
        width: 100%;
        height: auto;
        display: block;
    }
    .frigate-item {
        display: flex;
        flex-direction: column;
    }
    .frigate-item h4 {
        margin-top: 0;
        text-align: center;
        font-weight: bold;
        color: #fff;
        margin-bottom: 10px;
        font-size: 16px;
    }
    .frigate-item iframe {
        width: 100%;
        height: 30vh;
        border: none;
        margin-bottom: 10px;
    }
    .open-button {
        padding: 5px 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.3s;
    }
    .open-button:hover {
        background-color: #0056b3;
    }
    .no-snapshots, .no-frigate, .instructions {
        display: flex;
        flex-direction: column;
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
    /* Popup styles */
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .popup-content {
        background-color: white;
        border-radius: 8px;
        width: 400px;
        max-width: 90%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        overflow: hidden;
    }
    .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #eee;
    }
    .popup-header h3 {
        margin: 0;
        padding: 0;
        border: none;
    }
    .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }
    .popup-body {
        padding: 20px;
    }
    .camera-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .camera-list li {
        padding: 12px 15px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .camera-list li:last-child {
        border-bottom: none;
    }
    .camera-list li:hover {
        background-color: #f0f0f0;
    }
    /* Dialog styles */
    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        pointer-events: none;
    }
    .dialog-content {
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        text-align: center;
        animation: fadeInOut 3s forwards;
    }
    @keyframes fadeInOut {
        0% { opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { opacity: 0; }
    }
</style>
