
export const SuccessResponse = ({ res, status = 200, message = "Done", data } = {}) => {
    return res.status(status).json({
        message,
        ...(data !== undefined && { data })
    })
}