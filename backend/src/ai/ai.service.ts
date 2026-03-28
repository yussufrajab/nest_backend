import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  /**
   * Enhance complaint text for clarity and professionalism
   * Uses rule-based text improvement (can be replaced with AI API)
   */
  enhanceComplaintText(text: string): string {
    if (!text || text.trim().length === 0) {
      return text;
    }

    let enhanced = text;

    // Capitalize first letter of each sentence
    enhanced = enhanced.replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());

    // Fix common issues
    const improvements: [RegExp, string][] = [
      [/\s+/g, ' '], // Multiple spaces to single
      [/\s+\./g, '.'], // Space before period
      [/\s+,/g, ','], // Space before comma
      [/\s+\!/g, '!'], // Space before exclamation
      [/\s+\?/g, '?'], // Space before question mark
      [/i guess/gi, 'I believe'],
      [/kind of/gi, 'somewhat'],
      [/sort of/gi, 'somewhat'],
      [/really/gi, 'very'],
      [/very/gi, 'extremely'],
      [/bad/gi, 'unacceptable'],
      [/good/gi, 'satisfactory'],
      [/wrong/gi, 'incorrect'],
      [/they said/gi, 'it was stated'],
      [/they did/gi, 'actions were taken'],
      [/i want/gi, 'I request'],
      [/i need/gi, 'I require'],
      [/because/gi, 'due to the fact that'],
      [/so/gi, 'therefore'],
      [/but/gi, 'however'],
      [/also/gi, 'additionally'],
      [/maybe/gi, 'potentially'],
      [/things/gi, 'matters'],
      [/stuff/gi, 'matters'],
    ];

    improvements.forEach(([pattern, replacement]) => {
      enhanced = enhanced.replace(pattern, replacement);
    });

    // Ensure professional tone
    enhanced = this.ensureProfessionalTone(enhanced);

    return enhanced.trim();
  }

  /**
   * Ensure professional tone in text
   */
  private ensureProfessionalTone(text: string): string {
    const unprofessionalPatterns: [RegExp, string][] = [
      [/this is ridiculous/gi, 'this situation is concerning'],
      [/unacceptable/gi, 'not in line with expected standards'],
      [/terrible/gi, 'highly unsatisfactory'],
      [/awful/gi, 'deeply concerning'],
      [/horrible/gi, 'extremely problematic'],
      [/worst/gi, 'most concerning'],
      [/hate/gi, 'have serious concerns about'],
      [/angry/gi, 'frustrated'],
      [/mad/gi, 'concerned'],
      [/upset/gi, 'disturbed'],
      [/useless/gi, 'not serving its intended purpose'],
      [/incompetent/gi, 'not meeting expected competency levels'],
      [/stupid/gi, 'not well-considered'],
      [/dumb/gi, 'not well-considered'],
    ];

    let result = text;
    unprofessionalPatterns.forEach(([pattern, replacement]) => {
      result = result.replace(pattern, replacement);
    });

    return result;
  }

  /**
   * Summarize complaint text
   */
  summarizeText(text: string, maxLength = 100): string {
    if (!text || text.length <= maxLength) {
      return text;
    }

    // Try to cut at sentence boundary
    const truncated = text.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastPeriod > maxLength / 2) {
      return truncated.substring(0, lastPeriod + 1);
    }

    if (lastSpace > maxLength / 2) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  /**
   * Categorize complaint based on keywords
   */
  categorizeComplaint(subject: string, details: string): string {
    const text = `${subject} ${details}`.toLowerCase();

    const categories: { keywords: string[]; category: string }[] = [
      { keywords: ['salary', 'payment', 'wage', 'allowance', 'bonus'], category: 'Compensation' },
      { keywords: ['harassment', 'discrimination', 'bias', 'unfair treatment'], category: 'Workplace Conduct' },
      { keywords: ['promotion', 'demotion', 'career', 'advancement'], category: 'Career Development' },
      { keywords: ['leave', 'vacation', 'time off', 'lwop'], category: 'Leave Management' },
      { keywords: ['working conditions', 'facility', 'equipment', 'environment'], category: 'Working Conditions' },
      { keywords: ['supervisor', 'manager', 'leadership', 'management'], category: 'Management Issue' },
      { keywords: ['policy', 'procedure', 'rule', 'regulation'], category: 'Policy Matter' },
      { keywords: ['benefits', 'insurance', 'pension', 'zssf'], category: 'Benefits' },
      { keywords: ['transfer', 'posting', 'deployment', 'station'], category: 'Posting/Transfer' },
      { keywords: ['disciplinary', 'punishment', 'warning', 'query'], category: 'Disciplinary' },
    ];

    let maxMatches = 0;
    let bestCategory = 'General';

    for (const { keywords, category } of categories) {
      const matches = keywords.filter((kw) => text.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  /**
   * Generate suggested response for complaint
   */
  generateSuggestedResponse(complaintType: string, details: string): string {
    const templates: Record<string, string> = {
      'Compensation': 'We acknowledge your concern regarding compensation matters. Our team will review your case in accordance with the established salary structures and payment policies. You will receive a detailed response within 14 working days.',
      'Workplace Conduct': 'Thank you for bringing this matter to our attention. We take all workplace conduct concerns seriously and will conduct a thorough investigation following our established procedures. Confidentiality will be maintained throughout the process.',
      'Career Development': 'Your career development concerns are important to us. We will review your case against the established promotion and career advancement guidelines. A comprehensive response will be provided within 21 working days.',
      'Leave Management': 'We have received your concern regarding leave matters. Our HR team will review your case in light of the applicable leave policies and regulations. You will be informed of the decision within 10 working days.',
      'Working Conditions': 'Thank you for reporting this issue. We are committed to maintaining proper working conditions and will investigate your concerns. Appropriate remedial actions will be taken if necessary.',
      'Management Issue': 'Your feedback regarding management practices has been noted. We will review this matter through appropriate channels and ensure proper follow-up. A response will be provided within 14 working days.',
      'Policy Matter': 'We acknowledge your concern regarding policy matters. Our team will review the applicable policies and provide clarification or take appropriate action as needed. You will receive a response within 15 working days.',
      'Benefits': 'Thank you for bringing this benefits-related concern to our attention. We will review your case against the established benefits framework and coordinate with relevant agencies if necessary.',
      'Posting/Transfer': 'Your concern regarding posting/transfer has been received. We will review this matter in accordance with the established transfer policies and staffing requirements. A decision will be communicated within 14 working days.',
      'Disciplinary': 'We have received your concern regarding disciplinary matters. This will be reviewed following our established disciplinary procedures with due consideration to all relevant facts.',
      'General': 'Thank you for submitting your complaint. We have received your concern and will review it carefully. Our team will investigate the matter and provide a comprehensive response within the stipulated timeframe.',
    };

    return templates[complaintType] || templates['General'];
  }

  /**
   * Detect sentiment (positive, neutral, negative)
   */
  detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const lowerText = text.toLowerCase();

    const positiveWords = ['satisfied', 'happy', 'good', 'excellent', 'great', 'thank', 'appreciate', 'helpful', 'resolved', 'pleased'];
    const negativeWords = ['angry', 'frustrated', 'disappointed', 'unhappy', 'poor', 'terrible', 'worst', 'hate', 'complaint', 'issue', 'problem', 'concern', 'dissatisfied', 'unacceptable'];

    const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length;

    if (negativeCount > positiveCount + 2) {
      return 'negative';
    }
    if (positiveCount > negativeCount + 2) {
      return 'positive';
    }
    return 'neutral';
  }

  /**
   * Extract key entities from complaint
   */
  extractEntities(text: string): {
    dates: string[];
    people: string[];
    departments: string[];
    locations: string[];
  } {
    const dates: string[] = [];
    const people: string[] = [];
    const departments: string[] = [];
    const locations: string[] = [];

    // Extract dates (various formats)
    const datePatterns = [
      /\d{1,2}\/\d{1,2}\/\d{2,4}/g,
      /\d{1,2}-\d{1,2}-\d{2,4}/g,
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi,
    ];

    datePatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        dates.push(...matches);
      }
    });

    // Extract potential people names (capitalized words after Mr., Mrs., etc.)
    const namePatterns = [/\b(Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g, /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g];
    namePatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        people.push(...matches.map((m) => m.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s+/, '')));
      }
    });

    // Extract departments
    const deptPatterns = [/\b(HR|Human Resources|Finance|IT|Administration|Operations|Legal|Audit|Procurement|Planning)\b/gi];
    deptPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        departments.push(...matches.map((m) => m.toLowerCase()));
      }
    });

    // Extract locations
    const locationPatterns = [/\b(Zanzibar|Dar es Salaam|Dodoma|Arusha|Mwanza|Tanga|Morogoro|Mbeya|Tabora|Iringa)\b/gi];
    locationPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        locations.push(...matches);
      }
    });

    return {
      dates: [...new Set(dates)],
      people: [...new Set(people)].slice(0, 10),
      departments: [...new Set(departments)],
      locations: [...new Set(locations)],
    };
  }
}
