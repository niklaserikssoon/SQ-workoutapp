import { jest } from '@jest/globals'
globalThis.jest = jest

import jestAxe from 'jest-axe'
expect.extend(jestAxe.toHaveNoViolations)
