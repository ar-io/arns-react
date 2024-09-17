// __mocks__/framer-motion.ts
// eslint-disable-next-line
import { motion } from 'framer-motion';

jest.mock('framer-motion', () => ({
  motion: jest.fn(),
}));
