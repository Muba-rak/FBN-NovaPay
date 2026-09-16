import { setupServer } from 'msw/node';
import { handlers } from './browser';

export const server = setupServer(...handlers);
