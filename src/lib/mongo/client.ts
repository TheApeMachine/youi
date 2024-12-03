import * as Realm from "realm-web";
import { FromBinary, ToBinary } from "./utils";
import { DateTime } from "luxon";

// Initialize the Realm app once
const app = new Realm.App({ id: import.meta.env.VITE_REALM_APP_ID });
let user: Realm.User | null = null;

// Login function
const ensureUser = async (): Promise<Realm.User> => {
    if (!user) {
        const credentials = Realm.Credentials.apiKey(import.meta.env.VITE_MONGO_API_KEY);
        user = await app.logIn(credentials);
    }
    return user;
};

const convertBinary = (doc: any): any => {
    if (!doc || typeof doc !== 'object') return doc;

    // Handle arrays recursively
    if (Array.isArray(doc)) {
        return doc.map((item: any): any => {
            if (item?.sub_type === 3 && item?.buffer instanceof Uint8Array) {
                return FromBinary(item);
            }
            return convertBinary(item);
        });
    }

    const converted = { ...doc };

    Object.entries(doc).forEach(([key, value]: any) => {
        if (value?.sub_type === 3 && value?.buffer instanceof Uint8Array) {
            converted[key] = FromBinary(value);
        } else if (value?.$date?.$numberLong) {
            converted[key] = new Date(parseInt(value.$date.$numberLong)).toISOString();
        } else if (value instanceof Date) {
            converted[key] = DateTime.fromISO(value.toISOString()).toFormat("dd-mm-yyyy");
        } else if (value && typeof value === 'object') {
            converted[key] = convertBinary(value);
        }
    });

    return converted;
};

export const fetchCollection = async (
    name: string,
    options: {
        query?: Record<string, any>;
        projection?: string[];
        join?: { from: string; localField: string; foreignField: string; as: string };
        sort?: Record<string, 1 | -1>;
        limit?: number;
        offset?: number;
        count?: boolean;
    } = {}
) => {
    const { query = {}, projection = [], join, sort, limit = 20, offset = 0, count = false } = options;

    // Define processQuery before using it
    const processQuery = (q: Record<string, any>): Record<string, any> => {
        return Object.entries(q).reduce((acc, [key, value]) => {
            if (typeof value === 'string' && value.endsWith('==')) {
                // Looks like a base64 string, convert to BSON Binary
                return {
                    ...acc,
                    [key]: {
                        $binary: {
                            base64: value,
                            subType: "03"
                        }
                    }
                };
            }
            if (value && typeof value === 'object') {
                if ('$elemMatch' in value) {
                    return {
                        ...acc,
                        [key]: {
                            $elemMatch: processQuery(value.$elemMatch)
                        }
                    };
                }
                return { ...acc, [key]: processQuery(value) };
            }
            return { ...acc, [key]: value };
        }, {});
    };

    // Add the not-deleted condition to the query
    const notDeletedCondition = { Deleted: null };
    const combinedQuery = {
        ...processQuery(query),
        ...notDeletedCondition
    };

    const user = await ensureUser();
    const conn = user.mongoClient("mongodb-atlas").db("FanApp");

    // If count is requested, return the total count
    if (count) {
        const pipeline = [
            { $match: combinedQuery },
            { $count: "total" }
        ];
        const result = await conn.collection(name).aggregate(pipeline);
        return result[0]?.total || 0;
    }

    // Rest of the existing pipeline logic...
    const pipeline: any[] = [
        { $match: combinedQuery }
    ];

    if (projection.length > 0) {
        const projectFields = projection.reduce(
            (acc: any, field: string) => ({ ...acc, [field]: 1 }),
            {}
        );
        pipeline.push({ $project: projectFields });
    } else {
        // When no projection is specified, exclude _t and _Etag
        pipeline.push({
            $project: {
                _t: 0,
                _Etag: 0
            }
        });
    }

    if (join) {
        pipeline.push({
            $lookup: {
                from: join.from,
                localField: join.localField,
                foreignField: join.foreignField,
                as: join.as
            }
        });
        pipeline.push({ $unwind: `$${join.as}` });
    }

    if (sort) {
        pipeline.push({ $sort: sort });
    }

    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });

    const results = await conn.collection(name).aggregate(pipeline);
    return results.map((doc: any) => convertBinary(doc));
};

export const fetchDocument = async (collectionName: string, id: string, pipeline?: any[]) => {
    const user = await ensureUser();
    const conn = user.mongoClient("mongodb-atlas").db("FanApp");

    if (pipeline) {
        // Add not-deleted condition to custom pipeline
        pipeline.unshift({ $match: { Deleted: null } });
        const results = await conn.collection(collectionName).aggregate(pipeline);
        const result = results[0];
        return result ? convertBinary(result) : null;
    }

    // Update existing logic to include not-deleted condition
    const binaryId = ToBinary(id);
    let result = await conn.collection(collectionName).findOne({ 
        _id: binaryId,
        Deleted: null
    });

    if (!result) {
        result = await conn.collection(collectionName).findOne({ 
            _id: id,
            Deleted: null
        });
    }

    if (!result) return null;

    return convertBinary(result);
};

export const updateCollection = async (
    name: string,
    options: {
        query: Record<string, any>;
        update: Record<string, any>;
        upsert?: boolean;
    }
) => {
    const user = await ensureUser();
    const conn = user.mongoClient("mongodb-atlas").db("FanApp");
    
    return conn.collection(name).updateOne(
        options.query,
        options.update,
        { upsert: options.upsert || false }
    );
};
