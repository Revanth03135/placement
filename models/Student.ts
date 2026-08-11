import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudent extends Document {
  rollNo: string;
  name: string;
}

const StudentSchema = new Schema<IStudent>({
  rollNo: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
});


const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
