export const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req.body);
            req.bodyParsed = parsed;
            next();
        }
        catch (e) {
            next(e);
        }
    };
};
export const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req.params);
            req.paramsParsed = parsed;
            next();
        }
        catch (e) {
            next(e);
        }
    };
};
export const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req.query);
            req.queryParsed = parsed;
            next();
        }
        catch (e) {
            next(e);
        }
    };
};
