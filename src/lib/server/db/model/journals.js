import { model, Schema } from 'mongoose';

export default model(
    'Journals',
    new Schema({
        title: {
            type: String,
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        documentations: [String],
    }, {
        versionKey: false,
        timestamps: {
            createdAt: true,
            updatedAt: true,
        },
    })
        .index({ userId: 1, createdAt: -1 })
);
