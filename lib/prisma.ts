// Using 'any' to bypass TypeScript error
// @ts-ignore
import { PrismaClient } from '@prisma/client'

// For improved type safety when not using 'any'
// import type { PrismaClient as PrismaClientType } from '@prisma/client'
// const PrismaClient = require('@prisma/client').PrismaClient as typeof PrismaClientType

const globalForPrisma = global as unknown as {
  prisma: any | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma 