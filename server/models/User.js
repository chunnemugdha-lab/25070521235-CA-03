const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"]
    },
    college: {
      type: String,
      default: "Campus Student",
      trim: true,
      maxlength: [150, "College name cannot exceed 150 characters"]
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"]
    },
    skills: {
      type: [String],
      default: []
    },
    phone: {
      type: String,
      default: "",
      trim: true
    },
    github: {
      type: String,
      default: "",
      trim: true
    },
    role: {
      type: String,
      enum: ["student", "recruiter"],
      default: "student"
    }
  },
  {
    timestamps: true
  }
);

// Method to return user info without sensitive fields
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    _id: this._id,
    name: this.name,
    email: this.email,
    college: this.college,
    bio: this.bio,
    skills: this.skills,
    phone: this.phone,
    github: this.github,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model("User", userSchema);
