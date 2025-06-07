import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
    let query = supabase
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
      .order('createdAt', { ascending: false });

    if (searchQuery) {
      const searchPattern = `%${searchQuery}%`;
      query = query.or(`name.ilike.${searchPattern},email.ilike.${searchPattern},memberId.ilike.${searchPattern}`);
    }

    const { data: users, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: fetchError.message },
        { status: 500 }
      );
    }
    
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
    const currentSessionUserId = parseInt(String(session.user.id));
    const updateUserId = parseInt(String(id));
    if (isNaN(currentSessionUserId) || isNaN(updateUserId)) {
      return NextResponse.json({ error: 'Invalid User ID format for comparison' }, { status: 400 });
    }
    
    // If updating current user from admin to regular user, check if they're the last admin
    if (currentSessionUserId === updateUserId && role !== 'admin') {
      const { count: adminCount, error: countError } = await supabase
        .from('user')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (countError) {
        console.error('Error counting admin users:', countError);
        return NextResponse.json(
          { error: 'Failed to verify admin count', details: countError.message },
          { status: 500 }
        );
      }
      
      if (adminCount !== null && adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove admin role from the last admin user' },
          { status: 400 }
        );
      }
    }
    
    // Update the user
    const { data: updatedUser, error: updateError } = await supabase
      .from('user')
      .update({ name, role, status })
      .eq('id', updateUserId)
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
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user', details: updateError.message },
        { status: 500 }
      );
    }
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found or update failed' }, { status: 404 });
    }
    
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
    
    const userId = parseInt(String(id));
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
    }
    
    // Check if trying to delete yourself
    const currentSessionUserId = parseInt(String(session.user.id));
     if (isNaN(currentSessionUserId)) {
      return NextResponse.json({ error: 'Invalid session User ID format' }, { status: 400 });
    }
    if (currentSessionUserId === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const { data: user, error: findUserError } = await supabase
      .from('user')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (findUserError) {
      console.error('Error checking user existence for delete:', findUserError);
      return NextResponse.json(
        { error: 'Failed to check user existence', details: findUserError.message },
        { status: 500 }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete all user's book loans first
    const { error: loanDeleteError } = await supabase
      .from('bookLoan')
      .delete()
      .eq('userId', userId);

    if (loanDeleteError) {
      console.error('Error deleting user book loans:', loanDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete user book loans', details: loanDeleteError.message },
        { status: 500 }
      );
    }
    
    // Delete the user
    const { error: userDeleteError } = await supabase
      .from('user')
      .delete()
      .eq('id', userId);

    if (userDeleteError) {
      console.error('Error deleting user:', userDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete user', details: userDeleteError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 