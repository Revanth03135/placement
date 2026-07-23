import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';

export async function GET() {
  try {
    await dbConnect();
    const students = await Student.find({}).sort({ rollNo: 1 }).lean();
    return NextResponse.json(students);
  } catch (error) {
    console.error('Students fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
