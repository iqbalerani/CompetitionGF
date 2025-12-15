/**
 * Cloudflare R2 Storage Service (via Worker)
 *
 * Securely uploads generated game assets to Cloudflare R2 using a Worker proxy.
 * Architecture: Frontend → Cloudflare Worker → R2 Bucket
 *
 * Benefits:
 * - No API keys exposed in browser
 * - Zero egress costs (Worker ↔ R2)
 * - Edge-optimized performance
 * - Cloudflare's recommended approach
 */

/**
 * Get Worker endpoint URL from environment
 */
const getWorkerUrl = (): string => {
  const workerUrl = import.meta.env.VITE_WORKER_URL;

  if (!workerUrl || workerUrl === 'YOUR_WORKER_URL_HERE') {
    console.warn('⚠️ VITE_WORKER_URL not configured. Upload will fail.');
    console.warn('Deploy the Worker first, then add VITE_WORKER_URL to .env.local');
  }

  return workerUrl || '';
};

/**
 * Upload a single image to R2 via Worker
 *
 * @param imageData - Base64 encoded image string
 * @param filename - Desired filename (e.g., "gameforge-123456-world.png")
 * @returns Public URL of uploaded image
 */
export const uploadImageToR2 = async (
  imageData: string,
  filename: string
): Promise<string> => {
  const workerUrl = getWorkerUrl();

  if (!workerUrl) {
    throw new Error('Worker URL not configured. Set VITE_WORKER_URL in .env.local');
  }

  console.log(`📤 Uploading to Worker: ${filename}`);

  try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: [
          {
            data: imageData,
            filename: filename,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Worker error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    if (!result.success || !result.results || result.results.length === 0) {
      throw new Error('Worker returned no results');
    }

    const uploadResult = result.results[0];

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    console.log(`✅ Upload success: ${uploadResult.url}`);

    return uploadResult.url;
  } catch (error: any) {
    console.error(`❌ Worker Upload Error for ${filename}:`, error);

    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      console.error('Worker is not reachable. Make sure it\'s deployed and VITE_WORKER_URL is correct.');
    }

    throw error;
  }
};

/**
 * Upload multiple images to R2 via Worker in batch
 *
 * @param images - Array of {data: base64String, filename: string}
 * @param onProgress - Optional callback for upload progress
 * @returns Array of public URLs
 */
export const uploadImagesToR2 = async (
  images: Array<{ data: string; filename: string }>,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> => {
  const workerUrl = getWorkerUrl();

  if (!workerUrl) {
    throw new Error('Worker URL not configured. Set VITE_WORKER_URL in .env.local');
  }

  console.log(`📤 Uploading ${images.length} images to Worker...`);

  try {
    // Call progress immediately to show starting
    if (onProgress) {
      onProgress(0, images.length);
    }

    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: images,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Worker error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error('Worker upload failed');
    }

    // Extract URLs from successful uploads
    const urls = result.results
      .filter((r: any) => r.success && r.type !== 'metadata')
      .map((r: any) => r.url);

    // Update progress to completion
    if (onProgress) {
      onProgress(urls.length, images.length);
    }

    console.log(`✅ Successfully uploaded ${urls.length}/${images.length} images`);

    return urls;
  } catch (error: any) {
    console.error('❌ Worker Batch Upload Error:', error);

    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      console.error('');
      console.error('🚨 Worker is not reachable!');
      console.error('');
      console.error('Make sure you:');
      console.error('1. Deployed the Worker: cd workers && npx wrangler deploy');
      console.error('2. Set VITE_WORKER_URL in .env.local to your Worker URL');
      console.error('3. Restarted dev server: npm run dev');
      console.error('');
    }

    throw error;
  }
};

/**
 * Save project metadata to R2 via Worker
 *
 * @param projectData - Project metadata object
 * @param filename - JSON filename
 * @returns Public URL of JSON file
 */
export const saveProjectMetadataToR2 = async (
  projectData: any,
  filename: string
): Promise<string> => {
  const workerUrl = getWorkerUrl();

  if (!workerUrl) {
    throw new Error('Worker URL not configured');
  }

  console.log(`📤 Uploading project metadata: ${filename}`);

  try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: [], // No images, just metadata
        metadata: projectData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Worker error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    // Find metadata result
    const metadataResult = result.results?.find((r: any) => r.type === 'metadata');

    if (!metadataResult || !metadataResult.success) {
      throw new Error('Metadata upload failed');
    }

    console.log(`✅ Metadata saved: ${metadataResult.url}`);

    return metadataResult.url;
  } catch (error) {
    console.error('❌ Failed to save metadata:', error);
    throw error;
  }
};

/**
 * Generate unique filename for a game asset
 *
 * @param nodeId - Node ID from ReactFlow
 * @param nodeType - Type of asset (e.g., "world", "character")
 * @returns Unique filename
 */
export const generateAssetFilename = (nodeId: string, nodeType: string): string => {
  const timestamp = Date.now();
  const sanitizedType = nodeType.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `gameforge-${timestamp}-${sanitizedType}-${nodeId}.png`;
};

/**
 * Generate unique filename for project metadata
 *
 * @param projectName - Name of the game/project
 * @returns Unique JSON filename
 */
export const generateMetadataFilename = (projectName: string): string => {
  const timestamp = Date.now();
  const sanitized = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `gameforge-project-${sanitized}-${timestamp}.json`;
};
