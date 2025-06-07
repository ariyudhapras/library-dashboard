// Script untuk memperbarui role user ke admin
import { supabase } from './lib/supabase'; // Assuming supabase is exported from lib/supabase.ts


async function updateUserRole() {
  try {
    // Email user yang ingin diubah role-nya
    const userEmail = 'ariyudhapras@gmail.com'
    const targetUserId = 1; // Define target user ID
    const newRole = 'admin'; // Define new role
    
    // Cek role user saat ini
    const { data: currentUser, error: findUserError } = await supabase
      .from('user')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (findUserError) {
      console.error('Error fetching current user:', findUserError);
      return;
    }
    
    console.log('Current user data:', currentUser)
    
    // Perbarui role menjadi admin
    const { data: updatedUser, error: updateUserError } = await supabase
      .from('user')
      .update({ role: newRole })
      .eq('email', userEmail)
      .select()
      .single();

    if (updateUserError) {
      console.error('Error updating target user role:', updateUserError);
      return;
    }
    
    console.log('User role updated to admin:', updatedUser)
  } catch (error) {
    console.error('Error updating user role:', error)
  } finally {

  }
}

updateUserRole() 