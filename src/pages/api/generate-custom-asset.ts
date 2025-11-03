/* eslint-disable no-console, @typescript-eslint/no-use-before-define */
import type { NextApiRequest, NextApiResponse } from 'next';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

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
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ [Generate Asset] ANTHROPIC_API_KEY is not set');
      return res.status(500).json({
        success: false,
        error: 'API configuration error',
      });
    }

    console.log(
      `🎨 [Generate Asset] Generating ${partType} with description: "${description}"`,
    );
    const apiStartTime = Date.now();

    // Build the prompt content
    const content: any[] = [];

    if (referenceImage) {
      // Extract base64 data if it's a data URL
      const base64Match = referenceImage.match(
        /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/,
      );
      if (base64Match) {
        const [, imageType, base64Data] = base64Match;
        content.push({
          type: 'image',
          image: base64Data,
          mimeType: `image/${imageType}`,
        });
      }
    }

    content.push({
      type: 'text',
      text: `You are an expert SVG illustrator creating Notion-style avatar assets. Generate a ${partType} SVG that matches this description: "${description}"

CRITICAL REQUIREMENTS:
1. The SVG MUST be 1080x1080px viewBox
2. Use simple, clean paths with rounded edges (stroke-linecap="round" stroke-linejoin="round")
3. Style: Minimalist, flat design with black fills and 12px black strokes
4. The ${partType} should be positioned to align with a Notion avatar face (centered, appropriate size)
5. Return ONLY the SVG code, no explanations or markdown
6. Use this structure:

<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080px" height="1080px" viewBox="0 0 1080 1080" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>${partType}/custom</title>
    <g id="${partType}-custom" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <!-- Your paths here -->
    </g>
</svg>

DESIGN GUIDELINES FOR ${partType.toUpperCase()}:
${getDesignGuidelines(partType)}



Generate the complete, valid SVG now:`,
    });

    // Call Claude to generate SVG
    const result = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      messages: [
        {
          role: 'user',
          content,
        },
      ],
      maxTokens: 4000,
    });

    const apiDuration = Date.now() - apiStartTime;
    console.log(`✅ [Generate Asset] Claude responded in ${apiDuration}ms`);

    // Extract SVG from response (remove markdown code blocks if present)
    let svgCode = result.text.trim();
    svgCode = svgCode.replace(/```svg\n?/g, '').replace(/```\n?/g, '');

    // Validate it's actually SVG
    if (!svgCode.includes('<svg') || !svgCode.includes('</svg>')) {
      console.error('❌ [Generate Asset] Invalid SVG generated');
      return res.status(500).json({
        success: false,
        error: 'Failed to generate valid SVG',
      });
    }

    const totalDuration = Date.now() - startTime;
    console.log(
      `🎉 [Generate Asset] SVG generated successfully in ${totalDuration}ms`,
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

function getDesignGuidelines(partType: string): string {
  switch (partType) {
    case 'hair':
      return `- Hair should frame the face, starting around y=300-400
- Keep shapes simple and geometric
- Use solid fills for main hair mass
- Add strokes for texture/detail lines
- Consider common styles: short, medium, long, curly, straight
- Match the description's length, texture, and style`;

    case 'beard':
      return `- Beard should be positioned on lower face (y=700-900)
- Keep shapes simple and clean
- Use solid fills with stroke outlines
- Match the description's fullness and style
- Align with typical face proportions`;

    case 'accessories':
      return `- Position based on accessory type (earrings: y=500-600, headband: y=300-400)
- Keep design minimal and iconic
- Use thin strokes (8-12px)
- Ensure accessories don't overwhelm the face`;

    case 'details':
      return `- Facial details like freckles, moles, dimples
- Keep very subtle and small
- Position naturally on face area (y=400-700)
- Use simple circles or small paths`;

    default:
      return '- Follow Notion avatar style guidelines';
  }
}
