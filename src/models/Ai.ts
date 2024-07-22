import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  userMessage: string;
  generatedMessage: string;
  language: string;
  textFormat: string;
  textSize: string;
  writingStyle: string;
  withEmoji: boolean;
  createdAt: Date;
}

const messageSchema: Schema = new Schema({
  userMessage: {
    type: String,
    required: true,
  },
  generatedMessage: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: ['filipino', 'english-us', 'english-uk'],
    required: true,
  },
  textFormat: {
    type: String,
    enum: ['Email', 'Message'],
    required: true,
  },
  textSize: {
    type: String,
    enum: ['Short', 'Medium', 'Long'],
    required: true,
  },
  writingStyle: {
    type: String,
    enum: [
      'Formal', 'Friendly', 'Persuasive', 'Expert', 'Joyful', 'Inspirational',
      'Informative', 'Thoughtful', 'Cautionary', 'Grieved', 'Exciting', 'Loving',
      'Confident', 'Surprised'
    ],
    required: true,
  },
  withEmoji: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model<IMessage>('Message', messageSchema);

export { Message, IMessage };
