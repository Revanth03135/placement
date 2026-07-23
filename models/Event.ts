import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IEvent extends Document {
  companyName: string;
  eventType: 'Pre Placement Talk' | 'Online Assessment' | 'Campus Interview';
  date: Date;
  startTime: string;
  endTime: string;
  students: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name too long'],
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: {
        values: ['Pre Placement Talk', 'Online Assessment', 'Campus Interview'],
        message: '{VALUE} is not a valid event type',
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
