import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
    courseTitle: {
        type: String,
        required: true
    },
    subTitle: { type: String },
    description: { type: String },
    category: {
        type: String,
        required: true
    },
    courseLevel: {
        type: String,
        enum: ["Beginner", "Medium", "Advance"]
    },
    coursePrice: {
        type: Number
    },
    courseThumbnail: {
        type: String
    },
    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    lectures: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture"
        }
    ],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isPublished: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });
// Virtual field for formatted course price
courseSchema.virtual("formattedPrice").get(function () {
    return this.coursePrice === 0 ? "Free" : this.coursePrice;
});

// Ensure virtuals are included when converting to JSON or an object
courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

export const Course = mongoose.model("Course", courseSchema);