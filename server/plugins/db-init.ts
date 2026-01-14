import { prisma } from '../utils/prisma'

export default defineNitroPlugin(async () => {
  console.log('🔌 Checking database connection with Prisma...')

  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected via Prisma')

    // Check if app_config has default row
    const config = await prisma.appConfig.findUnique({
      where: { id: 1 }
    })

    if (!config) {
      console.log('📦 Creating default app_config...')
      await prisma.appConfig.create({
        data: {
          id: 1,
          isBorn: false
        }
      })
      console.log('✅ Default app_config created')
    }

    console.log('✅ Database schema is ready')
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    throw error
  }
})
