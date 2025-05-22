import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
    console.log(`API: Fetching user profile for ID: ${session.user.id}`);
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        memberId: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        birthDate: true,
        profileImage: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      console.log(`API: User with ID ${session.user.id} not found in database`);
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
    
    const userId = parseInt(session.user.id);
    
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        profileImage: true,
        email: true
      }
    });
    
    if (!user) {
      console.log(`API: User with ID ${userId} not found in database`);
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }
    
    // Update the user
    try {
      console.log(`API: Updating user ${userId} with data:`, { name, address, phone, birthDate });
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          address,
          phone,
          birthDate: birthDate ? new Date(birthDate) : null,
        },
        select: {
          id: true,
          memberId: true,
          name: true,
          email: true,
          address: true,
          phone: true,
          birthDate: true,
          profileImage: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      console.log(`API: User ${userId} updated successfully`);
      
      // Store target redirect in the response
      const responseData = {
        ...updatedUser,
        redirectUrl: redirectTo || '/user/profile',
        profileUpdated: true
      };
      
      return NextResponse.json(responseData);
    } catch (error) {
      console.error('Error updating user in database:', error);
      return NextResponse.json(
        { error: 'Database error saat memperbarui profil', details: error instanceof Error ? error.message : 'Unknown error' },
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