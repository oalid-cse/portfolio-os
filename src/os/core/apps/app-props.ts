import type { PortfolioData } from '@/content/types';
import type { AppId } from '../types';

export type AppProps = { data: PortfolioData; openApp: (id: AppId) => void };
