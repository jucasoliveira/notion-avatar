/* eslint-disable no-console, @typescript-eslint/no-use-before-define */
import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '@ai-sdk/openai';
import { generateImage } from 'ai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

interface GenerateAssetRequest {
  partType: 'hair' | 'beard' | 'accessories' | 'details';
  description: string;
  referenceImage?: string; // base64 encoded image
}

interface GenerateAssetResponse {
  success: boolean;
  svg?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateAssetResponse>,
) {
  const startTime = Date.now();
  console.log('🎨 [Generate Asset] Request received');

  if (req.method !== 'POST') {
    console.log('❌ [Generate Asset] Invalid method:', req.method);
    return res
      .status(405)
      .json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { partType, description, referenceImage } =
      req.body as GenerateAssetRequest;

    if (!partType || !description) {
      console.log('❌ [Generate Asset] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing partType or description',
      });
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [Generate Asset] OPENAI_API_KEY is not set');
      return res.status(500).json({
        success: false,
        error: 'API configuration error',
      });
    }

    console.log(
      `🎨 [Generate Asset] Generating ${partType} with description: "${description}"`,
    );
    const apiStartTime = Date.now();

    // Build the detailed prompt for DALL-E
    const prompt = buildImagePrompt(partType, description, referenceImage);

    console.log('📝 [Generate Asset] Prompt:', prompt);

    // Generate image using OpenAI DALL-E
    const result = await generateImage({
      model: openai.image('dall-e-3'),
      prompt,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
    });

    const apiDuration = Date.now() - apiStartTime;
    console.log(`✅ [Generate Asset] OpenAI responded in ${apiDuration}ms`);

    // Get the generated image URL or base64
    const imageUrl = result.image;

    if (!imageUrl) {
      console.error('❌ [Generate Asset] No image URL returned');
      return res.status(500).json({
        success: false,
        error: 'Failed to generate image',
      });
    }

    console.log('🖼️  [Generate Asset] Image URL:', imageUrl);

    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl.toString());
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Create SVG that embeds the generated image
    const svgCode = createSVGFromImage(base64Image, partType);

    const totalDuration = Date.now() - startTime;
    console.log(
      `🎉 [Generate Asset] Image generated and converted to SVG in ${totalDuration}ms`,
    );

    return res.status(200).json({
      success: true,
      svg: svgCode,
    });
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error(
      `❌ [Generate Asset] Request failed after ${totalDuration}ms:`,
      error,
    );

    return res.status(500).json({
      success: false,
      error: 'Failed to generate custom asset. Please try again.',
    });
  }
}

function buildImagePrompt(
  partType: string,
  description: string,
  referenceImage?: string,
): string {
  const baseStyle = `Create a simple, minimalist Notion-style avatar ${partType} asset.
Style requirements:
- Clean, flat design with black fills and strokes
- Minimalist geometric shapes
- Simple lines, no complex details
- Black and white only (no colors)
- Transparent background
- Centered composition
- 1024x1024 resolution`;

  const partSpecificGuidelines = getImagePromptGuidelines(partType);

  let prompt = `${baseStyle}

${partSpecificGuidelines}

${partType.toUpperCase()} DESCRIPTION: ${description}`;

  if (referenceImage) {
    prompt += `\n\nReference: Match the style and characteristics shown in the reference image as closely as possible while maintaining the minimalist Notion avatar aesthetic.`;
  }

  return prompt;
}

function getImagePromptGuidelines(partType: string): string {
  switch (partType) {
    case 'hair':
      return `HAIR GUIDELINES:
- Hair should frame the top and sides of where a head would be
- Use simple, flowing shapes for hair strands
- Keep the style clean and geometric
- Position for a face that would be centered in frame
- Match the length and texture from the description (short, medium, long, curly, straight, etc.)`;

    case 'beard':
      return `BEARD GUIDELINES:
- Beard should be positioned for the lower face area
- Use simple shapes with clean outlines
- Match the fullness and style from description
- Keep proportions natural for a typical face`;

    case 'accessories':
      return `ACCESSORIES GUIDELINES:
- Create the accessory item (glasses, earrings, hat, etc.)
- Position appropriately (glasses centered, earrings on sides, hat on top)
- Keep design minimal and iconic
- Use thin, clean lines`;

    case 'details':
      return `DETAILS GUIDELINES:
- Create subtle facial details (freckles, moles, beauty marks, dimples)
- Keep very small and minimal
- Position naturally for a face area
- Use simple dots or small shapes`;

    default:
      return 'Follow minimalist Notion avatar style guidelines';
  }
}

function createSVGFromImage(base64Image: string, partType: string): string {
  // Create an SVG that embeds the generated image
  // This maintains compatibility with the existing avatar system
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080px" height="1080px" viewBox="0 0 1080 1080" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>${partType}/custom-ai</title>
    <defs>
        <clipPath id="clip-circle">
            <circle cx="540" cy="540" r="500"/>
        </clipPath>
    </defs>
    <g id="${partType}-custom-ai" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <image
            x="40"
            y="40"
            width="1000"
            height="1000"
            xlink:href="data:image/png;base64,${base64Image}"
            clip-path="url(#clip-circle)"
            preserveAspectRatio="xMidYMid slice"
        />
    </g>
</svg>`;
}
