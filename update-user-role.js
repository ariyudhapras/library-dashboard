// Script untuk memperbarui role user ke admin
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateUserRole() {
  try {
    // Email user yang ingin diubah role-nya
    const userEmail = 'ariyudhapras@gmail.com'
    
    // Cek role user saat ini
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })
    
    console.log('Current user data:', currentUser)
    
    // Perbarui role menjadi admin
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { role: 'admin' }
    })
    
    console.log('User role updated to admin:', updatedUser)
  } catch (error) {
    console.error('Error updating user role:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserRole() 