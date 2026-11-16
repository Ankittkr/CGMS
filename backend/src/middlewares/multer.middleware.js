import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
];

const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
            new ApiError(
                400,
                "Only PDF, PNG and JPG files are allowed."
            ),
            false
        );
    }

    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024,
        files: 5,
    },
});
