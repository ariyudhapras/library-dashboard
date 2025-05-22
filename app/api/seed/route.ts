import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { generateMemberId } from "@/lib/utils"

// This endpoint should ONLY be used in development!
// It's for testing the login system by creating test users
export async function GET(req: Request) {
  // Guard against running in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is not available in production" },
      { status: 403 }
    )
  }

  try {
    // Create test admin user
    const adminEmail = "admin@test.com"
    const adminPassword = "password123"
    const adminHashedPassword = await hash(adminPassword, 10)
    
    // Generate a unique member ID for admin
    const adminMemberId = await generateMemberId(prisma)

    // Check if user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    let adminUser
    if (existingAdmin) {
      // Update existing admin user
      adminUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          name: "Admin Test",
          password: adminHashedPassword,
          role: "admin",
          // Keep the existing memberId if it exists
          memberId: existingAdmin.memberId || adminMemberId,
        },
      })
      console.log("Updated existing admin user:", adminUser.id, "with member ID:", adminUser.memberId)
    } else {
      // Create new admin user
      adminUser = await prisma.user.create({
        data: {
          name: "Admin Test",
          email: adminEmail,
          password: adminHashedPassword,
          role: "admin",
          memberId: adminMemberId,
        },
      })
      console.log("Created new admin user:", adminUser.id, "with member ID:", adminUser.memberId)
    }

    // Create test regular user
    const userEmail = "user@test.com"
    const userPassword = "password123"
    const userHashedPassword = await hash(userPassword, 10)
    
    // Generate a unique member ID for user
    const userMemberId = await generateMemberId(prisma)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    let regularUser
    if (existingUser) {
      // Update existing regular user
      regularUser = await prisma.user.update({
        where: { email: userEmail },
        data: {
          name: "User Test",
          password: userHashedPassword,
          role: "user",
          // Keep the existing memberId if it exists
          memberId: existingUser.memberId || userMemberId,
        },
      })
      console.log("Updated existing regular user:", regularUser.id, "with member ID:", regularUser.memberId)
    } else {
      // Create new regular user
      regularUser = await prisma.user.create({
        data: {
          name: "User Test",
          email: userEmail,
          password: userHashedPassword,
          role: "user",
          memberId: userMemberId,
        },
      })
      console.log("Created new regular user:", regularUser.id, "with member ID:", regularUser.memberId)
    }

    // Seed books if there are none
    const existingBooks = await prisma.book.count();
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
        const createdBook = await prisma.book.create({
          data: book,
        });
        createdBooks.push(createdBook);
      }

      console.log(`Created ${createdBooks.length} books`);
    }

    return NextResponse.json({
      message: "Seed completed successfully",
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        memberId: adminUser.memberId,
      },
      user: {
        id: regularUser.id,
        email: regularUser.email,
        memberId: regularUser.memberId,
      },
      books: existingBooks === 0 ? createdBooks.length : "No new books created",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong during seeding" },
      { status: 500 }
    );
  }
} 