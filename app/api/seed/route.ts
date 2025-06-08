import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { generateMemberId } from "@/lib/utils";

// This endpoint should ONLY be used in development!
// It's for testing the login system by creating test users
export async function GET(req: Request) {
  // Guard against running in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is not available in production" },
      { status: 403 }
    );
  }

  try {
    // Create test admin user
    const adminEmail = "admin@test.com";
    const adminPassword = "password123";
    const adminHashedPassword = await hash(adminPassword, 10);

    // Generate a unique member ID for admin
    const adminMemberId = await generateMemberId();

    // Check if user already exists
    const { data: existingAdmin, error: adminExistsError } = await supabase
      .from("users")
      .select("id, memberId")
      .eq("email", adminEmail)
      .maybeSingle();

    if (adminExistsError) {
      console.error("Error checking for existing admin:", adminExistsError);
      return NextResponse.json(
        {
          error:
            "Error checking for existing admin: " + adminExistsError.message,
        },
        { status: 500 }
      );
    }

    let adminUser;
    if (existingAdmin) {
      // Update existing admin user
      const { data: updatedAdmin, error: updateAdminError } = await supabase
        .from("users")
        .update({
          name: "Admin Test",
          password: adminHashedPassword,
          role: "admin",
          memberId: existingAdmin.memberId || adminMemberId,
        })
        .eq("email", adminEmail)
        .select("id, email, memberId")
        .single();

      if (updateAdminError) {
        console.error("Error updating admin user:", updateAdminError);
        return NextResponse.json(
          { error: "Error updating admin user: " + updateAdminError.message },
          { status: 500 }
        );
      }
      adminUser = updatedAdmin;
      console.log(
        "Updated existing admin user:",
        adminUser?.id,
        "with member ID:",
        adminUser?.memberId
      );
    } else {
      // Create new admin user
      const { data: newAdmin, error: createAdminError } = await supabase
        .from("users")
        .insert({
          name: "Admin Test",
          email: adminEmail,
          password: adminHashedPassword,
          role: "admin",
          memberId: adminMemberId,
        })
        .select("id, email, memberId")
        .single();

      if (createAdminError) {
        console.error("Error creating admin user:", createAdminError);
        return NextResponse.json(
          { error: "Error creating admin user: " + createAdminError.message },
          { status: 500 }
        );
      }
      adminUser = newAdmin;
      console.log(
        "Created new admin user:",
        adminUser?.id,
        "with member ID:",
        adminUser?.memberId
      );
    }

    // Create test regular user
    const userEmail = "user@test.com";
    const userPassword = "password123";
    const userHashedPassword = await hash(userPassword, 10);

    // Generate a unique member ID for user
    const userMemberId = await generateMemberId();

    // Check if user already exists
    const { data: existingUser, error: userExistsError } = await supabase
      .from("users")
      .select("id, memberId")
      .eq("email", userEmail)
      .maybeSingle();

    if (userExistsError) {
      console.error("Error checking for existing user:", userExistsError);
      return NextResponse.json(
        {
          error: "Error checking for existing user: " + userExistsError.message,
        },
        { status: 500 }
      );
    }

    let regularUser;
    if (existingUser) {
      // Update existing regular user
      const { data: updatedUser, error: updateUserError } = await supabase
        .from("users")
        .update({
          name: "User Test",
          password: userHashedPassword,
          role: "user",
          memberId: existingUser.memberId || userMemberId,
        })
        .eq("email", userEmail)
        .select("id, email, memberId")
        .single();

      if (updateUserError) {
        console.error("Error updating regular user:", updateUserError);
        return NextResponse.json(
          { error: "Error updating regular user: " + updateUserError.message },
          { status: 500 }
        );
      }
      regularUser = updatedUser;
      console.log(
        "Updated existing regular user:",
        regularUser?.id,
        "with member ID:",
        regularUser?.memberId
      );
    } else {
      // Create new regular user
      const { data: newUser, error: createUserError } = await supabase
        .from("users")
        .insert({
          name: "User Test",
          email: userEmail,
          password: userHashedPassword,
          role: "user",
          memberId: userMemberId,
        })
        .select("id, email, memberId")
        .single();

      if (createUserError) {
        console.error("Error creating regular user:", createUserError);
        return NextResponse.json(
          { error: "Error creating regular user: " + createUserError.message },
          { status: 500 }
        );
      }
      regularUser = newUser;
      console.log(
        "Created new regular user:",
        regularUser?.id,
        "with member ID:",
        regularUser?.memberId
      );
    }

    // Seed books if there are none
    const { count: existingBooks, error: countBooksError } = await supabase
      .from("book")
      .select("*", { count: "exact", head: true });

    if (countBooksError) {
      console.error("Error counting books:", countBooksError);
      return NextResponse.json(
        { error: "Error counting books: " + countBooksError.message },
        { status: 500 }
      );
    }
    const createdBooks = [];

    if (existingBooks === 0) {
      // Add some sample books
      const books = [
        {
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          publisher: "J. B. Lippincott & Co.",
          year: 1960,
          isbn: "9780446310789",
          stock: 5,
        },
        {
          title: "1984",
          author: "George Orwell",
          publisher: "Secker & Warburg",
          year: 1949,
          isbn: "9780451524935",
          stock: 3,
        },
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          publisher: "Charles Scribner's Sons",
          year: 1925,
          isbn: "9780743273565",
          stock: 4,
        },
        {
          title: "Pride and Prejudice",
          author: "Jane Austen",
          publisher: "T. Egerton, Whitehall",
          year: 1813,
          isbn: "9780141439518",
          stock: 2,
        },
      ];

      for (const book of books) {
        const { data: createdBook, error: createBookError } = await supabase
          .from("book")
          .insert(book)
          .select()
          .single();

        if (createBookError) {
          console.error(
            `Error creating book "${book.title}":`,
            createBookError
          );
          // Optionally, decide if you want to stop all seeding or continue
          return NextResponse.json(
            {
              error:
                `Error creating book "${book.title}": ` +
                createBookError.message,
            },
            { status: 500 }
          );
        }
        if (!createdBook) {
          // Should not happen if no error, but good practice
          console.error(
            `Book "${book.title}" was not created, but no error reported.`
          );
          return NextResponse.json(
            {
              error: `Book "${book.title}" was not created, but no error reported.`,
            },
            { status: 500 }
          );
        }
        createdBooks.push(createdBook);
      }

      console.log(`Created ${createdBooks.length} books`);
    }

    return NextResponse.json({
      message: "Seed completed successfully",
      admin: {
        id: adminUser?.id,
        email: adminUser?.email,
        memberId: adminUser?.memberId,
      },
      user: {
        id: regularUser?.id,
        email: regularUser?.email,
        memberId: regularUser?.memberId,
      },
      books: existingBooks === 0 ? createdBooks.length : "No new books created",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong during seeding",
      },
      { status: 500 }
    );
  }
}
