<script>
  import { onMount } from 'svelte';
  
  const imageUrl = "https://as1.ftcdn.net/jpg/10/25/79/94/1000_F_1025799499_K6a7Xpv5mPSdBTwebyUrvlBoZ1CrghoP.jpg";
  const images = Array(10).fill(imageUrl);
</script>

<div class="crowd-monitoring-container">
  <h1>Crowd Monitoring</h1>
  
  <div class="image-grid">
    {#each images as image, i}
      <div class="image-card">
        <img src={image} alt={`Crowd monitoring image ${i+1}`} />
        <div class="image-info">
          <span>Location {i+1}</span>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .crowd-monitoring-container {
    padding: 20px;
  }
  
  h1 {
    margin-bottom: 20px;
  }
  
  .image-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .image-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }
  
  .image-card:hover {
    transform: translateY(-5px);
  }
  
  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
  }
  
  .image-info {
    padding: 10px;
    background-color: #f8f9fa;
    border-top: 1px solid #eee;
  }
  
  @media (max-width: 1200px) {
    .image-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 768px) {
    .image-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 480px) {
    .image-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 