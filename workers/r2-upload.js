/**
 * Cloudflare Worker for R2 Image Uploads
 *
 * This Worker handles secure uploads to R2 using R2 bindings (no API keys needed).
 * Architecture: Frontend → Worker → R2 Bucket
 *
 * Benefits:
 * - No credentials exposed in frontend
 * - Zero egress costs (Worker ↔ R2)
 * - Edge-optimized performance
 * - Cloudflare's recommended approach
 */

export default {
  async fetch(request, env) {
    // CORS headers for frontend requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Change to your domain in production
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      // Parse request body
      const body = await request.json();
      const { images, metadata } = body;

      if (!images || !Array.isArray(images)) {
        return new Response(
          JSON.stringify({ error: 'Invalid request: images array required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Upload each image to R2
      const uploadResults = [];

      for (const image of images) {
        const { data, filename } = image;

        if (!data || !filename) {
          console.error('Invalid image object:', { hasData: !!data, hasFilename: !!filename });
          continue;
        }

        try {
          // Convert base64 to binary
          const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
          const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

          // Determine content type
          const contentType = data.startsWith('data:image/png')
            ? 'image/png'
            : data.startsWith('data:image/jpeg')
            ? 'image/jpeg'
            : 'image/png';

          // Upload to R2 using binding (no credentials needed!)
          await env.R2_BUCKET.put(filename, binaryData, {
            httpMetadata: {
              contentType: contentType,
            },
          });

          // Construct public URL
          const publicUrl = `${env.PUBLIC_URL}/${filename}`;

          uploadResults.push({
            filename,
            url: publicUrl,
            success: true,
          });

          console.log(`✅ Uploaded: ${filename}`);
        } catch (error) {
          console.error(`❌ Failed to upload ${filename}:`, error);
          uploadResults.push({
            filename,
            error: error.message,
            success: false,
          });
        }
      }

      // Optionally save metadata JSON
      if (metadata && metadata.projectName) {
        try {
          const metadataFilename = `gameforge-project-${metadata.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.json`;
          const metadataJson = JSON.stringify(metadata, null, 2);

          await env.R2_BUCKET.put(metadataFilename, metadataJson, {
            httpMetadata: {
              contentType: 'application/json',
            },
          });

          uploadResults.push({
            filename: metadataFilename,
            url: `${env.PUBLIC_URL}/${metadataFilename}`,
            success: true,
            type: 'metadata',
          });

          console.log(`✅ Uploaded metadata: ${metadataFilename}`);
        } catch (error) {
          console.error('❌ Failed to upload metadata:', error);
        }
      }

      // Return results
      return new Response(
        JSON.stringify({
          success: true,
          uploaded: uploadResults.filter(r => r.success).length,
          total: images.length,
          results: uploadResults,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    } catch (error) {
      console.error('❌ Worker Error:', error);

      return new Response(
        JSON.stringify({
          error: 'Upload failed',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
  },
};
