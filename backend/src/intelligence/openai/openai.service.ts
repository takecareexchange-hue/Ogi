import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);

  async analyzeIntake(rawData: any, protocols: any[]) {
    // In a real implementation, this would call OpenAI API
    // const response = await this.openai.chat.completions.create({...})
    
    this.logger.log('Running AI analysis (Mock)...');
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const content = JSON.stringify(rawData).toLowerCase();

    let summary = 'Patient intake analysis complete.';
    let suggestedProtocolId: string | null = null;
    let confidenceScore = 0.5;
    let flagged = false;
    let flaggedReason: string | null = null;
    let analysisNotes = 'Based on preliminary keyword analysis.';

    // Matching logic
    for (const protocol of protocols) {
      const keywords = protocol.indication_criteria.toLowerCase().split(/[\s,]+/);
      const matchCount = keywords.filter(
        (k) => k.length > 3 && content.includes(k),
      ).length;

      if (matchCount > 0) {
        suggestedProtocolId = protocol.id;
        confidenceScore = Math.min(0.5 + matchCount * 0.1, 0.95);
        summary = `Patient identified as a strong candidate for ${protocol.name}.`;
        analysisNotes = `Matched ${matchCount} criteria from ${protocol.name} protocol.`;

        // Check for contraindications
        const contraKeywords = protocol.contraindications
          .toLowerCase()
          .split(/[\s,]+/);
        const contraMatch = contraKeywords.find(
          (k) => k.length > 4 && content.includes(k),
        );
        if (contraMatch) {
          flagged = true;
          flaggedReason = `Potential contraindication found: ${contraMatch} matched in intake.`;
        }
        break;
      }
    }

    if (!suggestedProtocolId) {
      summary =
        'No specific wellness protocols identified based on current intake.';
      confidenceScore = 0.3;
    }

    return {
      summary,
      suggestedProtocolId,
      confidenceScore,
      flagged,
      flaggedReason,
      analysisNotes,
      patientInfo: {
        firstName:
          rawData.firstName ||
          rawData.patient_name?.split(' ')[0] ||
          rawData.name?.split(' ')[0] ||
          'Unknown',
        lastName:
          rawData.lastName ||
          rawData.patient_name?.split(' ')[1] ||
          rawData.name?.split(' ')[1] ||
          'Patient',
        email: rawData.email || 'unknown@example.com',
        dob: rawData.dob || '1990-01-01',
      },
    };
  }
}
