export default (res, message) => {
    return res.status(500).json({
        message,
    });
};