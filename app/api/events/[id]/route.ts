import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const event = await Event.findById(id)
      .populate('students', 'rollNo name')
      .lean();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    // Validate student IDs if provided
    if (body.students) {
      if (!Array.isArray(body.students)) {
        return NextResponse.json(
          { error: 'Students must be an array' },
          { status: 400 }
        );
      }

      const validIds = body.students.every(
        (sid: string) => mongoose.Types.ObjectId.isValid(sid)
      );
      if (!validIds) {
        return NextResponse.json(
          { error: 'Invalid student ID(s)' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.students !== undefined) {
      updateData.students = body.students;
    }
    if (body.startTime !== undefined) {
      updateData.startTime = body.startTime;
    }
    if (body.endTime !== undefined) {
      updateData.endTime = body.endTime;
    }
    if (body.date !== undefined) {
      updateData.date = body.date;
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('students', 'rollNo name')
      .lean();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Event delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
