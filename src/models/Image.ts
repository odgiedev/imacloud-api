import { model, Schema } from "mongoose";

const ImageSchema = new Schema(
    {
        name: String,
        user_id: String
    },
    { timestamps: true }
);

export const Image = model("Image", ImageSchema);
