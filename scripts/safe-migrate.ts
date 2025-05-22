import { spawn } from 'child_process'
import { backupDatabase } from '../lib/database-backup'

async function safeMigrate() {
  try {
    // 1. Backup database terlebih dahulu
    console.log('🔍 Backing up database before migration...')
    const backupResult = await backupDatabase()
    
    if (!backupResult.success) {
      console.error('❌ Database backup failed, aborting migration for safety')
      console.error('Error:', backupResult.message)
      process.exit(1)
    }
    
    console.log('✅ Database backup successful:', backupResult.path)
    
    // 2. Jalankan prisma migrate dev
    console.log('🚀 Running prisma migrate dev...')
    
    const migrate = spawn('npx', ['prisma', 'migrate', 'dev'], {
      stdio: 'inherit',
      shell: true
    })
    
    migrate.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Migration completed successfully')
        
        // 3. Isi data seed jika database kosong
        console.log('🌱 Running seed data script...')
        
        const seed = spawn('npm', ['run', 'seed'], {
          stdio: 'inherit',
          shell: true
        })
        
        seed.on('close', (seedCode) => {
          if (seedCode === 0) {
            console.log('✅ Seed completed successfully')
          } else {
            console.error(`❌ Seed failed with code ${seedCode}`)
          }
        })
      } else {
        console.error(`❌ Migration failed with code ${code}`)
        console.log('💡 You can restore from the backup if needed using:')
        console.log(`   ts-node scripts/restore-database.ts --file="${backupResult.path}"`)
      }
    })
  } catch (error) {
    console.error('❌ Error during safe migration:', error)
    process.exit(1)
  }
}

safeMigrate() 