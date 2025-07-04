export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { migrateMemberIds } from "@/lib/utils"; // Prisma import removed
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// This endpoint should ONLY be used by admins to migrate member IDs
export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can run migrations." },
        { status: 403 }
      )
    }
    
    // Run the migration
    // The migrateMemberIds function from lib/utils has been refactored to use Supabase internally
    const count = await migrateMemberIds();
    
    return NextResponse.json(
      { 
        success: true, 
        message: `Successfully migrated ${count} member IDs to new format`,
        migratedCount: count 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "An error occurred during migration" 
      },
      { status: 500 }
    )
  }
} 