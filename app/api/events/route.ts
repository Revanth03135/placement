import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';

// Sanitize string input
function sanitize(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, '').trim().slice(0, 500);
}

// Validate time format (HH:MM AM/PM)
function isValidTime(time: string): boolean {
  return /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(time);
}

export async function GET() {
  try {
    await dbConnect();
    const events = await Event.find({})
      .populate('students', 'rollNo name')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const companyName = sanitize(body.companyName);
    const eventType = sanitize(body.eventType);
    const startTime = sanitize(body.startTime);
    const endTime = sanitize(body.endTime);
    const date = body.date;

    if (!companyName || !eventType || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const validTypes = ['Pre Placement Talk', 'Online Assessment', 'Campus Interview'];
    if (!validTypes.includes(eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM AM/PM' },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date' },
        { status: 400 }
      );
    }

    const event = await Event.create({
      companyName,
      eventType,
      date: parsedDate,
      startTime,
      endTime,
      students: [],
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Event create error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
