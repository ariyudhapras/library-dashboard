import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { generateMemberId } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    // Log awal request untuk debugging
    console.log("Processing registration request")
    
    // Parse request body
    const body = await req.json().catch(e => {
      console.error("Failed to parse request JSON:", e)
      return null
    })
    
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      )
    }
    
    const { 
      name, 
      email, 
      password, 
      role = "user",
      address = null,
      phone = null,
      birthDate = null
    } = body
    
    // Log data yang diterima (hapus password untuk keamanan)
    console.log("Registration data received:", { 
      name, 
      email,
      hasPassword: !!password,
      role,
      hasAddress: !!address,
      hasPhone: !!phone,
      hasBirthDate: !!birthDate
    })

    // Validate input
    if (!name || !email || !password) {
      const missingFields = []
      if (!name) missingFields.push('name')
      if (!email) missingFields.push('email') 
      if (!password) missingFields.push('password')
      
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validasi password
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Validasi role
    const validRoles = ["user", "admin"]
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Role must be either 'user' or 'admin'" },
        { status: 400 }
      )
    }

    // Validasi nomor telepon jika disediakan
    if (phone) {
      const phoneRegex = /^[0-9]{10,13}$/
      if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
        return NextResponse.json(
          { error: "Invalid phone number format. Should be 10-13 digits" },
          { status: 400 }
        )
      }
    }

    // Validasi tanggal lahir jika disediakan
    if (birthDate) {
      const birthDateObj = new Date(birthDate)
      if (isNaN(birthDateObj.getTime())) {
        return NextResponse.json(
          { error: "Invalid birth date format" },
          { status: 400 }
        )
      }
      const now = new Date()
      if (birthDateObj > now) {
        return NextResponse.json(
          { error: "Birth date cannot be in the future" },
          { status: 400 }
        )
      }
    }

    try {
      // Check if user already exists
      console.log("Checking if user already exists...")
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error("Database error during user check:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown database error"
      return NextResponse.json(
        { error: `Database error during user check: ${errorMessage}` },
        { status: 500 }
      )
    }

    // Hash password
    let hashedPassword
    try {
      console.log("Hashing password...")
      hashedPassword = await hash(password, 10)
    } catch (error) {
      console.error("Password hashing error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown hashing error"
      return NextResponse.json(
        { error: `Failed to hash password: ${errorMessage}` },
        { status: 500 }
      )
    }

    // Generate unique member ID
    let memberId
    try {
      console.log("Generating unique member ID...")
      memberId = await generateMemberId(prisma)
      console.log("Generated member ID:", memberId)
    } catch (error) {
      console.error("Error generating member ID:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      return NextResponse.json(
        { error: `Failed to generate member ID: ${errorMessage}` },
        { status: 500 }
      )
    }

    // Create user
    try {
      console.log("Creating new user with role:", role)
      const user = await prisma.user.create({
        data: {
          memberId,
          name,
          email,
          password: hashedPassword,
          role,
          address,
          phone,
          birthDate: birthDate ? new Date(birthDate) : null,
        },
      })

      console.log("User created successfully:", user.id, "with role:", user.role, "and member ID:", user.memberId)
      return NextResponse.json(
        {
          user: {
            id: user.id,
            memberId: user.memberId,
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address,
            phone: user.phone,
            birthDate: user.birthDate,
            createdAt: user.createdAt,
          },
        },
        { status: 201 }
      )
    } catch (error) {
      console.error("User creation error:", error)
      
      // Handle Prisma specific errors
      if (error instanceof PrismaClientKnownRequestError) {
        // P2002 is a unique constraint violation
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[] || ['unknown field']
          return NextResponse.json(
            { error: `The ${field.join(', ')} is already taken` },
            { status: 400 }
          )
        }
        
        // P2003 is a foreign key constraint violation
        if (error.code === 'P2003') {
          return NextResponse.json(
            { error: `Referenced relation does not exist: ${error.meta?.field_name}` },
            { status: 400 }
          )
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error during user creation"
      return NextResponse.json(
        { error: `Error creating user: ${errorMessage}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    )
  }
} 