import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
  || 'postgres://kermesse:password@localhost:5432/kermesse'

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
})
