import { ErrorRequestHandler } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            error: 'File too large. Max size is 5MB.'
        });
    }

    if (err.message === 'Error: Images only!') {
        return res.status(400).json({
            error: 'Only image files are allowed (jpeg, jpg, png, gif)'
        });
    }

    return res.status(500).json({
        error: 'Something went wrong!'
    });
};