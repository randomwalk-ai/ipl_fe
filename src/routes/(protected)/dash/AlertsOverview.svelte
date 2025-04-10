<script lang="ts">
  import AlertCards from '$lib/components/AlertCards.svelte';
  import * as Switch from '$lib/components/ui/switch';
  import { alertItems } from '$lib/data/alertItems';
  import { Loader2 } from '@lucide/svelte';
  import html2canvas from 'html2canvas';
  
  let isDownloading = false;
  let showNewOnly = true;
 
  const downloadScrollAreaContent = async () => {
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
			const clone = contentToCapture.cloneNode(true);


				// Find the grid container in the clone
      const gridElement = clone.querySelector('.grid') as HTMLElement;
      if (gridElement) {
        // Force the grid to maintain 3 columns
        gridElement.style.display = 'grid';
        gridElement.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
        gridElement.style.gap = '1rem';
        gridElement.style.width = '100%';
      }
    

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

			// Wait for all images to load in the clone
			const imagePromises = Array.from(tempContainer.querySelectorAll('img')).map((img) => {
				if (img.complete) return Promise.resolve();
				return new Promise((resolve) => {
					img.onload = resolve;
					img.onerror = resolve;
				});
			});

      console.log("Waiting for images to load")
      await Promise.all(imagePromises);
      console.log("imagePromises done")
      console.log("Converting to canvas")
			// Use html2canvas with the properly prepared clone
			const canvas = await html2canvas(tempContainer, {
				backgroundColor: window.getComputedStyle(document.body).backgroundColor,
				scale: 1, // Reduce scale for faster processing
				logging: false,
				useCORS: true,
				allowTaint: true,
				width: contentToCapture.offsetWidth,
				height: Math.max(tempContainer.scrollHeight, contentToCapture.scrollHeight),
				imageTimeout: 5000, // Add timeout for images
				onclone: (clonedDoc, clonedElement) => {
					// Remove unnecessary elements that don't need to be rendered
					const elementsToRemove = clonedElement.querySelectorAll('.can-be-removed');
					elementsToRemove.forEach(el => el.remove());
				}
			});
      console.log("canvas done")

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
		}
	};
</script>

<div class="container mx-auto border border-[#1E293B] rounded-lg p-0">
  <!-- Header with title and download button -->
  <div class="flex justify-between items-center bg-[#1E293B] p-4 rounded-t-lg text-white">
    <h1 class="text-2xl font-bold">Alerts Overview</h1>
     <!-- Filter controls -->
    <div class="p-4 bg-muted/30 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">Show New Only:</span>
        <Switch.Root 
          checked={showNewOnly} 
          onCheckedChange={(checked) => { 
            showNewOnly = checked;
          }}
        />
      </div>
    </div>
    <button 
      on:click={downloadScrollAreaContent}
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
     
  </div>
  

  
  <div id="scroll-content" class="p-4">
    <AlertCards alertItems={alertItems} showNewOnly={showNewOnly} />
  </div>
</div> 