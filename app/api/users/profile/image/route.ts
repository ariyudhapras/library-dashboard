import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import fs from "fs";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    console.log("API: POST /api/users/profile/image - Request received");

    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    console.log(
      "API: Session check result:",
      session
        ? `Authenticated as ${session.user?.email} (id: ${session.user?.id})`
        : "Not authenticated"
    );

    if (!session || !session.user || !session.user.id) {
      console.log("API: Authentication failed - No valid session");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ✅ FIXED: Simpler and more robust type conversion
    const userId = Number(session.user.id);

    // Validate userId conversion
    if (!userId || isNaN(userId) || userId <= 0) {
      console.log(`API: Invalid user ID: ${session.user.id}`);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Parse the FormData from the request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("API: No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      console.log(`API: Invalid file type: ${file.type}`);
      return NextResponse.json(
        {
          error:
            "Format file tidak didukung. Silakan unggah file gambar (JPEG, PNG, WebP).",
        },
        { status: 400 }
      );
    }

    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      console.log(`API: File size too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 2MB." },
        { status: 400 }
      );
    }

    // Prepare directory and filename
    const fileExtension = file.name.split(".").pop() || "jpg";
    const uniqueFilename = `${userId}-${Date.now()}.${fileExtension}`;
    const relativePath = `/uploads/profiles/${uniqueFilename}`;
    const publicDir = join(process.cwd(), "public");
    const uploadsDir = join(publicDir, "uploads");
    const profilesDir = join(uploadsDir, "profiles");
    const absolutePath = join(publicDir, relativePath);

    console.log(`API: Preparing to save file to ${absolutePath}`);

    // Ensure directories exist
    try {
      // Create parent directories if they don't exist
      if (!fs.existsSync(publicDir)) {
        await mkdir(publicDir, { recursive: true });
      }

      if (!fs.existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      if (!fs.existsSync(profilesDir)) {
        await mkdir(profilesDir, { recursive: true });
      }

      // Ensure parent directory for target file exists
      await mkdir(dirname(absolutePath), { recursive: true });
    } catch (error) {
      console.error("API: Error creating directories:", error);
      return NextResponse.json(
        {
          error: "Gagal membuat direktori upload.",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Save the file
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(absolutePath, buffer);
      console.log(`API: File saved successfully to ${absolutePath}`);
    } catch (error) {
      console.error("API: Error writing file:", error);
      return NextResponse.json(
        {
          error: "Gagal menyimpan file yang diunggah.",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Update the user's profile image in the database
    try {
      console.log(`API: Updating profile image for user ${userId}`);
      const { data: updatedUser, error: updateError } = await supabase
        .from('user')
        .update({ profileImage: relativePath })
        .eq('id', userId)
        .select('id, memberId, name, email, profileImage')
        .single();

      if (updateError) {
        console.error("API: Error updating user profile in database:", updateError);
        // Remove file if database update fails
        try {
          fs.unlinkSync(absolutePath);
          console.log(
            `API: Removed uploaded file ${absolutePath} after database error`
          );
        } catch (unlinkError) {
          console.error(
            "API: Failed to remove uploaded file after database error:",
            unlinkError
          );
        }
        return NextResponse.json(
          {
            error: "Gagal memperbarui profil dalam database.",
            details: updateError.message,
          },
          { status: 500 }
        );
      }

      if (!updatedUser) {
        console.error("API: User not found or not updated for ID:", userId);
        // Attempt to remove file as the user record wasn't updated as expected
        try {
          fs.unlinkSync(absolutePath);
          console.log(
            `API: Removed uploaded file ${absolutePath} as user update returned no data`
          );
        } catch (unlinkError) {
          console.error(
            "API: Failed to remove uploaded file after empty update result:",
            unlinkError
          );
        }
        return NextResponse.json(
          {
            error: "Gagal memperbarui profil: Pengguna tidak ditemukan atau tidak ada data yang dikembalikan.",
          },
          { status: 404 } // Or 500 if it's unexpected
        );
      }

      console.log(`API: Profile image updated successfully for user ${userId}`);
      return NextResponse.json({
        success: true,
        profileImage: relativePath,
        user: updatedUser,
      });
    } catch (error) {
      // This catch block is for unexpected errors during the try block execution, 
      // not specific to Supabase client errors if they were already handled by `if (updateError)`.
      console.error("API: Unexpected error during database update process:", error);
      // Attempt to remove file if any unexpected error occurs during this stage
      try {
        fs.unlinkSync(absolutePath);
        console.log(
          `API: Removed uploaded file ${absolutePath} after unexpected database stage error`
        );
      } catch (unlinkError) {
        console.error(
          "API: Failed to remove uploaded file after unexpected database stage error:",
          unlinkError
        );
      }
      return NextResponse.json(
        {
          error: "Terjadi kesalahan tak terduga saat memperbarui profil.",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API: Error uploading profile image:", error);
    return NextResponse.json(
      {
        error: "Gagal mengunggah foto profil.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
