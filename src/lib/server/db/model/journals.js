import { model, Schema } from 'mongoose';

export default model(
    'Journals',
    new Schema({
        title: {
            type: String,
            required: true,
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
        },
        documentations: [String],
        created_at: Date,
        updated_at: Date,
    }, {
        versionKey: false,
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    })
);
