import { config } from '../config/index.js';

export interface ExtractedQuestion {
  question_number: string;
  sub_question_number?: string;
  page_number: number;
  original_text: string;
  normalised_text: string;
  marks?: number;
}

export interface MappedQuestion extends ExtractedQuestion {
  id?: string;
  topic_id?: string;
  mapping_confidence?: number;
  mapping_status: 'AUTO_MAPPED' | 'REVIEW_REQUIRED' | 'ADMIN_VERIFIED' | 'UNMAPPED';
  candidates?: Array<{ topic_id: string; topic_name: string; score: number }>;
}

export interface QuestionClusterResult {
  representative_question_id: string;
  representative_text: string;
  member_question_ids: string[];
  cluster_size: number;
  years_repeated: number[];
}

export class MLServiceClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.mlService.url;
    this.apiKey = config.mlService.apiKey;
  }

  private async request<T>(endpoint: string, method: string, body?: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`ML Service request to ${endpoint} failed (${res.status}): ${errText}`);
    }

    return res.json() as Promise<T>;
  }

  async checkHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health', 'GET');
  }

  async extractQuestions(filePath: string): Promise<{ questions: ExtractedQuestion[]; page_count: number }> {
    return this.request<{ questions: ExtractedQuestion[]; page_count: number }>(
      '/extract-questions',
      'POST',
      { file_path: filePath }
    );
  }

  async mapTopics(questions: any[], topics: any[], threshold = 0.15): Promise<{ mapped_questions: MappedQuestion[] }> {
    return this.request<{ mapped_questions: MappedQuestion[] }>(
      '/map-topics',
      'POST',
      { questions, topics, threshold }
    );
  }

  async clusterQuestions(questions: any[], distanceThreshold = 0.6): Promise<{ clusters: QuestionClusterResult[] }> {
    return this.request<{ clusters: QuestionClusterResult[] }>(
      '/cluster-questions',
      'POST',
      { questions, distance_threshold: distanceThreshold }
    );
  }
}

export const mlClient = new MLServiceClient();
