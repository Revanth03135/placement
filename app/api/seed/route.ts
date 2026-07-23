import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import { STUDENTS_DATA } from '@/lib/seed';

export async function POST() {
  try {
    await dbConnect();

    const existingCount = await Student.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json(
        { message: 'Students already seeded', count: existingCount },
        { status: 200 }
      );
    }

    const result = await Student.insertMany(STUDENTS_DATA);
    return NextResponse.json(
      { message: 'Students seeded successfully', count: result.length },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed students' },
      { status: 500 }
    );
  }
}
