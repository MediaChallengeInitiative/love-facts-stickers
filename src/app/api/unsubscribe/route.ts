import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { unsubscribeSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = unsubscribeSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { email, phone, requestType } = validationResult.data

    // Create unsubscribe request
    const unsubscribeRequest = await prisma.unsubscribeRequest.create({
      data: {
        email: email || null,
        phone: phone || null,
        requestType,
        status: 'pending',
      },
    })

    // If it's a delete request, process it immediately (or queue for later)
    if (requestType === 'delete_data') {
      // Delete associated download records
      if (email) {
        await prisma.download.deleteMany({
          where: { userEmail: email },
        })
      }
      if (phone) {
        await prisma.download.deleteMany({
          where: { userPhone: phone },
        })
      }

      // Update request status
      await prisma.unsubscribeRequest.update({
        where: { id: unsubscribeRequest.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      requestId: unsubscribeRequest.id,
      message:
        requestType === 'delete_data'
          ? 'Your data has been deleted'
          : 'You have been unsubscribed from communications',
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
