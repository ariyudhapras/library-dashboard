import { backupDatabase } from '../lib/database-backup'

async function runBackup() {
  console.log('Starting database backup...')
  
  try {
    const result = await backupDatabase()
    
    if (result.success) {
      console.log('✅ Backup successful:', result.message)
      process.exit(0)
    } else {
      console.error('❌ Backup failed:', result.message)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Unexpected error during backup:', error)
    process.exit(1)
  }
}

runBackup() 