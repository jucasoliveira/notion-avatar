/* eslint-disable no-console */
import type { NextApiRequest, NextApiResponse } from 'next';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { AvatarAnalysisSchema } from '@/types/ai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

interface AnalyzeSelfieResponse {
  success: boolean;
  config?: any;
  error?: string;
  lowConfidenceParts?: string[];
  customAssets?: {
    [key: string]: string; // part type -> SVG code
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeSelfieResponse>,
) {
  const startTime = Date.now();
  console.log('📸 [Analyze Selfie] Request received');

  if (req.method !== 'POST') {
    console.log('❌ [Analyze Selfie] Invalid method:', req.method);
    return res
      .status(405)
      .json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image || typeof image !== 'string') {
      console.log('❌ [Analyze Selfie] Invalid image data type');
      return res
        .status(400)
        .json({ success: false, error: 'Invalid image data' });
    }

    // Validate base64 image format
    const base64Match = image.match(
      /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/,
    );
    if (!base64Match) {
      console.log('❌ [Analyze Selfie] Invalid base64 format');
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Please upload JPEG, PNG, or WebP.',
      });
    }

    const [, imageType, base64Data] = base64Match;
    const imageSizeKB = Math.round((base64Data.length * 0.75) / 1024);
    console.log(
      `✅ [Analyze Selfie] Image validated: ${imageType.toUpperCase()}, ${imageSizeKB}KB`,
    );

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ [Analyze Selfie] ANTHROPIC_API_KEY is not set');
      return res.status(500).json({
        success: false,
        error: 'API configuration error',
      });
    }

    console.log('🤖 [Analyze Selfie] Calling Claude Vision API...');
    const apiStartTime = Date.now();

    // Call Claude with structured output
    const result = await generateObject({
      model: anthropic('claude-sonnet-4-5-20250929'),
      schema: AvatarAnalysisSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: base64Data,
            },
            {
              type: 'text',
              text: `Analyze this selfie and select the best matching Notion-style avatar parts. Consider the person's features carefully:

FACE (0-9): Face shape
- 0-2: Round, soft features
- 3-5: Oval, balanced proportions
- 6-9: Square, angular features

HAIR (0-29): Hairstyle and length
- 0-9: Short hair (pixie, buzz, short crop)
- 10-19: Medium length (bob, shoulder-length, messy medium)
- 20-29: Long hair (flowing, ponytail, braids)

EYES (0-9): Eye expression and shape
- 0-3: Wide, open eyes
- 4-6: Normal, balanced eyes
- 7-9: Narrow, almond-shaped eyes

EYEBROWS (0-9): Eyebrow thickness and shape
- 0-3: Thin, delicate brows
- 4-6: Medium, natural brows
- 7-9: Thick, bold brows

NOSE (0-9): Nose shape and size
- 0-3: Small, button nose
- 4-6: Medium, proportional nose
- 7-9: Larger, prominent nose

MOUTH (0-9): Mouth expression
- 0-3: Small, closed mouth
- 4-6: Medium, slight smile
- 7-9: Wide, open smile

GLASSES (0-9 or null): Eyewear presence
- null: No glasses visible
- 0-3: Round/thin frames
- 4-6: Square/medium frames
- 7-9: Bold/statement frames

BEARD (0-9 or null): Facial hair
- null: No beard visible
- 0-3: Light stubble
- 4-6: Short beard
- 7-9: Full beard

ACCESSORIES (0-9 or null): Visible accessories
- null: No accessories
- 0-9: Select based on visible items (hats, earrings, etc.)

DETAILS (0-9 or null): Additional facial features
- null: Standard features
- 0-9: Select if notable details present

FLIP (boolean): Should the avatar be flipped horizontally?
- Typically false unless there's a strong asymmetric element

CONFIDENCE (0-100 for each part): How confident are you that the selected asset matches the person's actual feature?
- 100 = Perfect match
- 70-99 = Good match
- 50-69 = Acceptable match
- Below 50 = Poor match (limited asset options)

SUGGESTIONS: If any part has low confidence (especially hair), provide:
- needsCustomHair: true if the hairstyle is very unique and available assets don't match well
- hairDescription: Brief description of the actual hairstyle (e.g., "curly afro", "dreadlocks", "blue mohawk")

Return your analysis as structured JSON matching the schema.`,
            },
          ],
        },
      ],
    });

    const apiDuration = Date.now() - apiStartTime;
    console.log(`✅ [Analyze Selfie] Claude API responded in ${apiDuration}ms`);
    console.log(
      '📊 [Analyze Selfie] Analysis result:',
      JSON.stringify(result.object, null, 2),
    );

    // Convert null values to 0 for optional parts (glasses, beard, accessories, details)
    // This ensures the avatar still renders properly even if optional parts aren't detected
    const sanitizedConfig = {
      ...result.object,
      glasses: result.object.glasses ?? 0,
      beard: result.object.beard ?? 0,
      accessories: result.object.accessories ?? 0,
      details: result.object.details ?? 0,
    };

    // Detect parts with low confidence (below 60%)
    const lowConfidenceParts: string[] = [];
    if (result.object.confidence) {
      const confidenceEntries = Object.entries(result.object.confidence);
      confidenceEntries.forEach(([part, confidence]) => {
        if (typeof confidence === 'number' && confidence < 60) {
          lowConfidenceParts.push(part);
        }
      });
    }

    if (lowConfidenceParts.length > 0) {
      console.log(
        '⚠️  [Analyze Selfie] Low confidence parts detected:',
        lowConfidenceParts.join(', '),
      );
    } else {
      console.log('✨ [Analyze Selfie] All parts matched with good confidence');
    }

    // Generate custom assets if needed
    const customAssets: { [key: string]: string } = {};

    if (
      result.object.suggestions?.needsCustomHair &&
      result.object.suggestions.hairDescription
    ) {
      console.log('🎨 [Analyze Selfie] Generating custom hair asset...');
      try {
        const assetResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
          }/api/generate-custom-asset`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              partType: 'hair',
              description: result.object.suggestions.hairDescription,
              referenceImage: image,
            }),
          },
        );

        const assetData = await assetResponse.json();
        if (assetData.success && assetData.svg) {
          customAssets.hair = assetData.svg;
          console.log('✅ [Analyze Selfie] Custom hair asset generated');
          // Update config to use custom hair (keep as number for now, we'll handle custom rendering separately)
          // sanitizedConfig.hair stays as the original number
        } else {
          console.error(
            '❌ [Analyze Selfie] Failed to generate custom hair:',
            assetData.error,
          );
        }
      } catch (error) {
        console.error(
          '❌ [Analyze Selfie] Error generating custom hair:',
          error,
        );
      }
    }

    const response: AnalyzeSelfieResponse = {
      success: true,
      config: sanitizedConfig,
      lowConfidenceParts:
        lowConfidenceParts.length > 0 ? lowConfidenceParts : undefined,
      customAssets:
        Object.keys(customAssets).length > 0 ? customAssets : undefined,
    };

    const totalDuration = Date.now() - startTime;
    console.log(
      `🎉 [Analyze Selfie] Request completed successfully in ${totalDuration}ms`,
    );

    return res.status(200).json(response);
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error(
      `❌ [Analyze Selfie] Request failed after ${totalDuration}ms:`,
      error,
    );

    // Handle specific error cases
    if (error.message?.includes('image')) {
      console.error('❌ [Analyze Selfie] Image processing error');
      return res.status(400).json({
        success: false,
        error:
          'Could not process image. Please ensure the photo shows a clear face.',
      });
    }

    console.error('❌ [Analyze Selfie] General error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze image. Please try again.',
    });
  }
}
