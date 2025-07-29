import axios from 'axios';
import { ENV } from '../constants/env.constants';

export class TavilyClient {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.tavily.com';

    constructor() {
        this.apiKey = ENV.TAVILY_API_KEY;
        if (!this.apiKey) {
            throw new Error('Tavily API key is not configured');
        }
    }

    async search(params: {
        query: string;
        search_depth?: 'basic' | 'advanced';
        include_images?: boolean;
        include_answer?: boolean;
        include_raw_content?: boolean;
        max_results?: number;
        include_domains?: string[];
        exclude_domains?: string[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }): Promise<any> {
        const response = await axios.post(`${this.baseUrl}/search`, params, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        return response.data;
    }
}