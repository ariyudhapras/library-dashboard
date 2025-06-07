import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET endpoint to fetch the authenticated user's profile
export async function GET(request: NextRequest) {
  try {
    console.log('API: GET /api/users/profile - Request received');
    
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    console.log('API: Session check result:', 
      session ? `Authenticated as ${session.user.email} (id: ${session.user.id})` : 'Not authenticated');
    
    if (!session || !session.user || !session.user.id) {
      console.log('API: Authentication failed - No valid session');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Fetch the user's profile
    const userId = parseInt(String(session.user.id));
    if (isNaN(userId)) {
      console.log(`API: Invalid user ID from session: ${session.user.id}`);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    console.log(`API: Fetching user profile for ID: ${userId}`);
    const { data: user, error: fetchError } = await supabase
      .from('user')
      .select(`
        id,
        memberId,
        name,
        email,
        address,
        phone,
        birthDate,
        profileImage,
        role,
        status,
        createdAt,
        updatedAt
      `)
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error(`API: Error fetching user profile for ID ${userId}:`, fetchError);
      // PGRST116: Row to be returned was not found
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Failed to fetch user profile', details: fetchError.message },
        { status: 500 }
      );
    }
    
    if (!user) { // Should be caught by fetchError.code === 'PGRST116', but as a safeguard
      console.log(`API: User with ID ${userId} not found in database (post-query check)`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log(`API: Successfully fetched profile for ${user.email}`);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update the authenticated user's profile
export async function PUT(request: NextRequest) {
  try {
    console.log('API: PUT /api/users/profile - Request received');
    
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    console.log('API: Session check result:', 
      session ? `Authenticated as ${session.user.email} (id: ${session.user.id})` : 'Not authenticated');
    
    if (!session || !session.user || !session.user.id) {
      console.log('API: Authentication failed - No valid session');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = parseInt(String(session.user.id));
    if (isNaN(userId)) {
      console.log(`API: Invalid user ID from session: ${session.user.id}`);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    
    // Parse request body
    let data;
    try {
      data = await request.json();
    } catch (e) {
      console.error('API: Failed to parse request body', e);
      return NextResponse.json(
        { error: 'Invalid request body format' },
        { status: 400 }
      );
    }
    
    // Extract fields that are allowed to be updated by the user
    const { name, address, phone, birthDate, redirectTo } = data;
    
    // Required field validation
    const missingFields = [];
    
    if (!name || name.trim().length < 2) {
      missingFields.push('name');
    }
    
    if (!address || address.trim().length < 5) {
      missingFields.push('address');
    }
    
    if (!phone) {
      missingFields.push('phone');
    }
    
    if (!birthDate) {
      missingFields.push('birthDate');
    }
    
    if (missingFields.length > 0) {
      console.log('API: Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          error: 'Required fields are missing or invalid', 
          fields: missingFields 
        },
        { status: 400 }
      );
    }
    
    // Validate phone number format
    if (phone) {
      const phoneRegex = /^[0-9]{10,13}$/;
      if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
        return NextResponse.json(
          { error: "Nomor HP harus berisi 10-13 digit angka" },
          { status: 400 }
        );
      }
    }
    
    // Validate birthdate
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      if (isNaN(birthDateObj.getTime())) {
        return NextResponse.json(
          { error: "Format tanggal lahir tidak valid" },
          { status: 400 }
        );
      }
      const now = new Date();
      if (birthDateObj > now) {
        return NextResponse.json(
          { error: "Tanggal lahir tidak boleh di masa depan" },
          { status: 400 }
        );
      }
    }
    
    // Validate current user before updating
    const { data: user, error: userCheckError } = await supabase
      .from('user')
      .select('id, profileImage, email')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle as user might not exist

    if (userCheckError) {
      console.error(`API: Error checking user existence for ID ${userId}:`, userCheckError);
      return NextResponse.json(
        { error: 'Database error while checking user', details: userCheckError.message },
        { status: 500 }
      );
    }
    
    if (!user) {
      console.log(`API: User with ID ${userId} not found in database for update`);
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }
    
    // Update the user
    try {
      const updatePayload: { name: string; address: string; phone: string; birthDate?: string | null } = {
        name,
        address,
        phone,
      };
      if (birthDate) {
        updatePayload.birthDate = new Date(birthDate).toISOString();
      } else {
        updatePayload.birthDate = null;
      }

      console.log(`API: Updating user ${userId} with data:`, updatePayload);
      const { data: updatedUser, error: updateError } = await supabase
        .from('user')
        .update(updatePayload)
        .eq('id', userId)
        .select(`
          id,
          memberId,
          name,
          email,
          address,
          phone,
          birthDate,
          profileImage,
          role,
          status,
          createdAt,
          updatedAt
        `)
        .single();

      if (updateError) {
        console.error(`API: Error updating user ${userId} in database:`, updateError);
        return NextResponse.json(
          { error: 'Database error saat memperbarui profil', details: updateError.message },
          { status: 500 }
        );
      }

      if (!updatedUser) {
        // This case should ideally not be reached if the user check above passed and .single() is used.
        // However, it's a safeguard.
        console.error(`API: User ${userId} not found after update attempt or update returned no data.`);
        return NextResponse.json(
          { error: 'Gagal memperbarui profil: Pengguna tidak ditemukan setelah pembaruan.' },
          { status: 404 }
        );
      }
      
      console.log(`API: User ${userId} updated successfully`);
      
      const responseData = {
        ...updatedUser,
        redirectUrl: redirectTo || '/user/profile',
        profileUpdated: true
      };
      
      return NextResponse.json(responseData);
    } catch (error) {
      // Catch unexpected errors during the update process itself, not Supabase client errors if handled by updateError.
      console.error('Unexpected error updating user in database:', error);
      return NextResponse.json(
        { error: 'Terjadi kesalahan tak terduga saat memperbarui profil', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui profil', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 