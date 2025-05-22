import { restoreFromBackup } from '../lib/database-backup'

async function restoreDatabase() {
  // Parse command line arguments
  const args = process.argv.slice(2)
  let backupFile: string | undefined
  
  // Extract backup file path
  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      backupFile = arg.substring(7)
    }
  }
  
  if (!backupFile) {
    console.error('❌ Error: Backup file not specified')
    console.error('Usage: ts-node scripts/restore-database.ts --file="path/to/backup.json"')
    process.exit(1)
  }
  
  console.log(`🔍 Attempting to restore from backup: ${backupFile}`)
  
  try {
    const result = await restoreFromBackup(backupFile)
    
    if (result.success) {
      console.log('✅ Restore successful:', result.message)
      process.exit(0)
    } else {
      console.error('❌ Restore failed:', result.message)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Unexpected error during restore:', error)
    process.exit(1)
  }
}

restoreDatabase() 