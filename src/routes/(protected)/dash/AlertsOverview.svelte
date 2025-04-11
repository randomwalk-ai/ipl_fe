<script lang="ts">
  import AlertCards from '$lib/components/AlertCards.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Switch from '$lib/components/ui/switch';
  import { alertItems as importedAlertItems } from '$lib/data/alertItems';
  import { Loader2, Maximize2 } from '@lucide/svelte';
  import html2canvas from 'html2canvas';
  
  let isDownloading = false;
  let showNewOnly = true;
  let isModalOpen = false;  
  let isNotified = false;
  
  // Declare alertItems variable
  let alertItems = JSON.parse(JSON.stringify(importedAlertItems));
  
  // Add a refresh counter to force reactivity
  let refreshCounter = 0;
  
  // Add a reference to the AlertCards component
  let alertCardsComponent: AlertCards;
  
  $: {
    // This reactive statement will re-run whenever refreshCounter changes
    refreshCounter;
    // Re-fetch the alert items from the imported data
    alertItems = JSON.parse(JSON.stringify(importedAlertItems));
  }
  
  // Function to refresh alert items
  const refreshAlertItems = () => {
    refreshCounter += 1; // Increment the counter to trigger the reactive statement
    
    // Force the AlertCards component to re-render by temporarily changing showNewOnly
    const currentShowNewOnly = showNewOnly;
    showNewOnly = !currentShowNewOnly;
    setTimeout(() => {
      showNewOnly = currentShowNewOnly;
    }, 10);
  };
  
  const sendAlert = async () => {
		if (isDownloading) return; // Prevent multiple clicks
		
		isDownloading = true;
		try {
			// Find the entire container that includes both the cards and the details view
			const contentToCapture = document.querySelector('.container') as HTMLElement;
      		console.log('contentToCapture', contentToCapture);
			if (!contentToCapture) {
				console.error('Content element not found');
				return;
			}

			// Create a temporary clone of the entire content
			const tempContainer = document.createElement('div');
			const clone = contentToCapture.cloneNode(true) as HTMLElement;

			// Apply original styles to make sure the clone looks the same
			const styles = window.getComputedStyle(contentToCapture);
			tempContainer.style.backgroundColor = styles.backgroundColor;
			tempContainer.style.color = styles.color;
			tempContainer.style.padding = styles.padding;
			tempContainer.style.width = contentToCapture.offsetWidth + 'px';

			// Append the clone to the temp container
			tempContainer.appendChild(clone);

			// Make the temp container temporarily visible but off-screen
			tempContainer.style.position = 'absolute';
			tempContainer.style.left = '-9999px';
			tempContainer.style.top = '-9999px';
			document.body.appendChild(tempContainer);

			// Handle images - preload all images to avoid CORS issues
			const images = Array.from(tempContainer.querySelectorAll('img'));
			console.log(`Found ${images.length} images to process`);
			
			// Set a placeholder for broken images
			const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
			
			// Remove all buttons and interactive elements
			const buttons = Array.from(tempContainer.querySelectorAll('button'));
			buttons.forEach(button => button.remove());

			// Create a proxy endpoint for images to avoid CORS issues
			const proxyImage = async (originalSrc: string): Promise<string> => {
				// If it's already a data URL or a relative URL, no need to proxy
				if (originalSrc.startsWith('data:') || originalSrc.startsWith('/')) {
					return originalSrc;
				}
				
				try {
					// Try to fetch the image through your server proxy
					const response = await fetch('/api/proxy-image', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ url: originalSrc })
					});
					
					if (!response.ok) throw new Error('Proxy failed');
					
					const data = await response.json();
					return data.dataUrl || placeholderImage;
				} catch (error) {
					console.error('Error proxying image:', error);
					return placeholderImage;
				}
			};

			// Process each image - convert external URLs to data URLs via proxy
			const imagePromises = images.map(async (img, index) => {
				try {
					// Save original source
					const originalSrc = img.src;
					
					// Skip processing if image is already a data URL
					if (originalSrc.startsWith('data:')) return;
					
					// Set a loading placeholder while we process
					img.setAttribute('data-original-src', originalSrc);
					img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';
					
					// Get data URL via proxy
					const dataUrl = await proxyImage(originalSrc);
					img.src = dataUrl;
					
					// Return a promise that resolves when the image loads
					return new Promise<void>((resolve) => {
						img.onload = () => resolve();
						img.onerror = () => {
							console.log(`Image ${index} failed to load, using placeholder`);
							img.src = placeholderImage;
							resolve();
						};
						
						// Set a timeout in case the image never loads
						setTimeout(() => {
							if (!img.complete || img.naturalWidth === 0) {
								console.log(`Image ${index} timed out, using placeholder`);
								img.src = placeholderImage;
								resolve();
							}
						}, 3000);
					});
				} catch (error) {
					console.error(`Error processing image ${index}:`, error);
					img.src = placeholderImage;
				}
			});

			// Wait for all images to be processed
			await Promise.all(imagePromises);
			console.log("All images processed");
			
			// Use html2canvas with the properly prepared clone
			const canvas = await html2canvas(tempContainer, {
				backgroundColor: window.getComputedStyle(document.body).backgroundColor,
				scale: 2,
				logging: true,
				useCORS: true,
				allowTaint: true,
				width: contentToCapture.offsetWidth,
				height: Math.max(tempContainer.scrollHeight, contentToCapture.scrollHeight),
				imageTimeout: 0,
				onclone: (clonedDoc, clonedElement) => {
					// Any final adjustments to the clone before rendering
					const elementsToRemove = clonedElement.querySelectorAll('.can-be-removed');
					elementsToRemove.forEach(el => el.remove());
				}
			});
			console.log("Canvas created successfully");

			// Clean up the temporary elements
			document.body.removeChild(tempContainer);

			// Create a download link
			const link = document.createElement('a');
			link.download = `alerts-grid-${new Date().toISOString().slice(0, 10)}.png`;
			link.href = canvas.toDataURL('image/png');

      console.log("Sending image to notification service")
			// Call an endpoint to send this image to notification service
			fetch('/api/send-alerts-image', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ image: canvas.toDataURL('image/png') })
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Failed to send alert image');
				}
				return response.json();
			})
			.then(data => {
				console.log('Alert image sent successfully:', data);
			})
			.catch(error => {
				console.error('Error sending alert image:', error);
			});

			// Trigger download
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error('Error downloading scroll area content:', error);
			// Show error notification if desired
			alert('Failed to download image. Please try again.');
		} finally {
			isDownloading = false;
			// Load from localstorage the unNotifiedAlertIds and set the db records accordingly
			const unNotifiedAlertIds = JSON.parse(localStorage.getItem('unNotifiedAlertIds') || '{}');
			console.log('unNotifiedAlertIds', unNotifiedAlertIds);
			fetch('/api/update-alert-ids', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ unNotifiedAlertIds })
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Failed to update alert ids');
				}
				return response.json();
			})
			.then(data => {
				console.log('Alert ids updated successfully:', data);
				// Clear localStorage after successful update
				localStorage.removeItem('unNotifiedAlertIds');
				// Directly call the refresh method on the component
				if (alertCardsComponent) {
					alertCardsComponent.refreshData();
				}
			})
			.catch(error => {
				console.error('Error updating alert ids:', error);
			});
		}
	};
</script>

<div class="container mx-auto border border-[#1E293B] rounded-lg p-0 h-full">
  <!-- Header with title and download button -->
  <div class="flex justify-between items-center bg-[#1E293B] p-4 rounded-t-lg text-white">
    <h1 class="text-2xl font-bold">Alerts Overview</h1>
    <!-- Filter controls -->
    <div class="p-4 bg-muted/30 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">Show Recent</span>
        <Switch.Root 
          checked={showNewOnly} 
          onCheckedChange={(checked) => { 
            showNewOnly = checked;
          }}
        />
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button 
        onclick={() => isModalOpen = true}
        class="flex items-center gap-1 px-3 py-1.5 bg-muted/20 text-white rounded-md hover:bg-muted/30"
        aria-label="Open in fullscreen modal"
      >
        <Maximize2 class="h-4 w-4" />
      </button>
      {#if showNewOnly}
      <button 
        onclick={sendAlert}
        class="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        disabled={isDownloading}
      >
        {#if isDownloading}
          <Loader2 class="h-4 w-4 animate-spin" />
          <span>Processing...</span>
        {:else}
          <span>Send Alert</span>
        {/if}
      </button>
      {/if}
    </div>
  </div>
  <div id="scroll-content" class="p-4 h-full">
    <AlertCards 
      bind:this={alertCardsComponent}
      alertItems={alertItems} 
      showNewOnly={showNewOnly} 
    />
  </div>
</div>

<!-- Fullscreen Modal -->
<Dialog.Root bind:open={isModalOpen}>
  <Dialog.Content class="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-0 overflow-hidden">
    <Dialog.Header class="bg-[#1E293B] p-4 text-white flex justify-between items-center">
      <Dialog.Title>Alerts Overview</Dialog.Title>
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">Show Recent</span>
        <Switch.Root 
          checked={showNewOnly} 
          onCheckedChange={(checked) => { 
            showNewOnly = checked;
          }}
        />
      </div>
    </Dialog.Header>
    
    <div class="p-4 overflow-y-auto fullscreen-content">
      <AlertCards 
        alertItems={alertItems} 
        showNewOnly={showNewOnly} 
        isFullscreen={true} 
      />
    </div>
    
    <Dialog.Footer class="border-t p-4">
      <Dialog.Close class="bg-muted px-3 py-1.5 rounded-md text-sm">Close</Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<style>
  .fullscreen-content {
    height: calc(95vh - 130px); /* Adjust for header and footer */
  }
</style> 