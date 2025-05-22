import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET endpoint to fetch all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }
    
    // Query parameter for search
    const searchQuery = request.nextUrl.searchParams.get('search') || '';
    
    // Fetch all users with optional search filter
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { memberId: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
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
        // Exclude password for security
      },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update a user (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    const { id, name, role, status } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    if (!role || !['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role is required' },
        { status: 400 }
      );
    }

    if (!status || !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      );
    }
    
    // Check if trying to update own role
    const currentSessionUserId = parseInt(session.user.id);
    const updateUserId = parseInt(id);
    
    // If updating current user from admin to regular user, check if they're the last admin
    if (currentSessionUserId === updateUserId && role !== 'admin') {
      // Count how many admins there are
      const adminCount = await prisma.user.count({
        where: { role: 'admin' }
      });
      
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove admin role from the last admin user' },
          { status: 400 }
        );
      }
    }
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: updateUserId },
      data: {
        name,
        role,
        status,
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
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete a user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }
    
    // Extract the user id from the URL
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const userId = parseInt(id);
    
    // Check if trying to delete yourself
    const currentSessionUserId = parseInt(session.user.id);
    if (currentSessionUserId === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete all user's book loans first (cascade would be better in schema)
    await prisma.bookLoan.deleteMany({
      where: { userId },
    });
    
    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 