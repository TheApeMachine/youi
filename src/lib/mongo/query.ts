import { ToBinary } from "./utils";
import { fetchCollection, updateCollection } from "./client";

// Add this type definition at the top of the file
type CollectionName = keyof typeof COLLECTION_RELATIONSHIPS;

export interface QueryProps {
    collection: CollectionName;
    fields?: string[];
    where?: Record<string, any>;
    joins?: string[];
    limit?: number;
    offset?: number;
    sort?: { field: string; order: "asc" | "desc" };
}

interface Join {
    from: string;
    localField: string;
    foreignField: string;
    as: string;
    isArray: boolean;
    nested?: Join;
}

// Define known relationships between collections with nested relationships
const COLLECTION_RELATIONSHIPS = {
    Group: {
        Chat: {
            localField: "_id",
            foreignField: "GroupId",
            isArray: false,
            includes: {
                Message: {
                    localField: "_id",
                    foreignField: "ChatId",
                    isArray: true
                }
            }
        }
    }
} as const;

const handlePrimaryJoin = (collection: CollectionName, primary: string, nested?: string) => {
    const relationship = COLLECTION_RELATIONSHIPS[collection as keyof typeof COLLECTION_RELATIONSHIPS][primary as keyof (typeof COLLECTION_RELATIONSHIPS)[keyof typeof COLLECTION_RELATIONSHIPS]];
    if (!relationship) {
        throw new Error(`No relationship defined from ${collection} to ${primary}`);
    }

    const primaryJoin = {
        from: primary,
        localField: relationship.localField,
        foreignField: relationship.foreignField,
        as: primary.toLowerCase(),
        isArray: relationship.isArray || false
    };

    if (nested && relationship.includes?.[nested as keyof typeof relationship.includes]) {
        const nestedRel = relationship.includes[nested as keyof typeof relationship.includes];
        return [primaryJoin, {
            from: nested,
            localField: `${primary.toLowerCase()}._id`,
            foreignField: nestedRel.foreignField,
            as: `${primary.toLowerCase()}_${nested.toLowerCase()}`,
            isArray: nestedRel.isArray || false
        }];
    }

    return primaryJoin;
}

export const query = async ({
    collection,
    fields,
    where = {},
    joins,
    limit = 20,
    offset = 0,
    sort
}: QueryProps, options?: { stateKey?: string }) => {
    console.log('Query Input:', { collection, fields, where, joins, limit, offset, sort });

    const fetchOptions: any = {
        query: where,
        projection: fields,
        limit,
        offset,
        stateKey: options?.stateKey
    };

    if (sort) {
        fetchOptions.sort = { [sort.field]: sort.order === "asc" ? 1 : -1 };
    }

    if (joins?.length) {
        console.log('Processing joins:', joins);
        // Convert simple join names to full join configurations
        fetchOptions.joins = joins.map(join => {
            console.log('Processing join:', join);

            // If it's a string (e.g., "Chat.Message")
            if (typeof join === 'string') {
                const [primary, nested] = join.split('.');
                console.log('Split join:', { primary, nested });

                if (!(collection in COLLECTION_RELATIONSHIPS)) {
                    throw new Error(`Invalid collection: ${collection}`);
                }

                return handlePrimaryJoin(collection, primary, nested);
            }

            if (typeof join === 'object' && 'from' in join) {
                const typedJoin = join as Join;  // Type assertion
                // Check if it is a nested join. If yes, return as is
                if (typedJoin.nested) {
                    return [typedJoin, {
                        from: typedJoin.nested.from,
                        localField: `${typedJoin.as}._id`,
                        foreignField: typedJoin.nested.foreignField,
                        as: `${typedJoin.as}_${typedJoin.nested.as}`,
                        isArray: typedJoin.nested.isArray
                    }];
                }
                // Otherwise, return this join as it is.
                return typedJoin;
            }


            throw new Error(`Invalid join configuration: ${JSON.stringify(join)}`);
        }).flat();
    }

    console.log('Final fetchOptions:', fetchOptions);
    const results = await fetchCollection(collection, fetchOptions);
    return limit === 1 ? results[0] || null : results;
};


// Type for the smart query builder
type QueryBuilder = {
    [K: string]: any;
    where: (conditions: Record<string, any>) => QueryBuilder;
    select: (...fields: string[]) => QueryBuilder;
    limit: (num: number) => QueryBuilder;
    sortBy: (field: string, direction?: "asc" | "desc") => QueryBuilder;
    include: (...relations: string[]) => QueryBuilder;
    exec: (options?: { stateKey?: string }) => Promise<any>;
    count: () => Promise<number>;
    set: (data: Record<string, any>) => Promise<any>;
    softDelete: () => Promise<void>;
    whereArrayField: (field: string, conditions: Record<string, any>) => QueryBuilder;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUUID = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    return UUID_REGEX.test(value);
};

// Helper to ensure PascalCase
const toPascalCase = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

// At the top of the file, add this type
type WhereConditions = Record<string, any>;

// Smart query function - now accepts PascalCase collection names
export const from = (collection: string): QueryBuilder => {
    let state = {
        collection: toPascalCase(collection) as CollectionName,
        fields: [] as string[],
        where: {} as WhereConditions,
        joins: [] as any[],
        limit: 20,
        offset: 0,
        sort: undefined as any
    };

    // Updated to handle PascalCase and Binary IDs
    const inferRelations = (fieldName: string) => {
        if (fieldName.endsWith("Id")) {
            const relationName = fieldName.replace("Id", "");
            return {
                collection: toPascalCase(relationName), // No pluralization, respect PascalCase
                localField: fieldName,
                foreignField: "_id"
            };
        }
        return null;
    };

    const convertToBinary = (data: Record<string, any>): Record<string, any> => {
        return Object.entries(data).reduce((acc, [key, value]) => {
            // Handle arrays
            if (Array.isArray(value)) {
                return {
                    ...acc,
                    [key]: value.map(item => {
                        if (isUUID(item)) return ToBinary(item);
                        if (typeof item === 'object') return convertToBinary(item);
                        return item;
                    })
                };
            }

            // Handle single UUID values
            if (isUUID(value)) {
                return { ...acc, [key]: ToBinary(value) };
            }

            // Handle nested objects
            if (value && typeof value === 'object') {
                return { ...acc, [key]: convertToBinary(value) };
            }

            // Return non-UUID values as-is
            return { ...acc, [key]: value };
        }, {});
    };

    const builder = {
        where: (conditions: Record<string, any>) => {
            // First handle array field queries
            const arrayProcessed = Object.entries(conditions).reduce((acc, [key, value]) => {
                // Handle $in operator specially
                if (value && typeof value === 'object' && '$in' in value) {
                    // Ensure we have an array
                    const inArray = Array.isArray(value.$in) ? value.$in : [value.$in];
                    acc[key] = {
                        $in: Array.isArray(inArray) ? inArray.map(v =>
                            typeof v === 'string' && isUUID(v) ? ToBinary(v) : v
                        ) : [inArray]
                    };
                    return acc;
                }
                // If it already has other MongoDB operators ($elemMatch, etc), leave it as is
                else if (value && typeof value === 'object' && Object.keys(value).some(k => k.startsWith('$'))) {
                    acc[key] = value;
                }
                // If it's an object without operators, wrap it in $elemMatch
                else if (value && typeof value === 'object' && !Array.isArray(value)) {
                    acc[key] = { $elemMatch: value };
                }
                // Otherwise, keep as is
                else {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);

            // Then handle binary conversion (keeping the existing detailed logic)
            const processedConditions = Object.entries(arrayProcessed).reduce((acc, [key, value]) => {
                if (isUUID(value)) {
                    return { ...acc, [key]: ToBinary(value) };
                }
                // If it's an $elemMatch, check its contents for IDs too
                if (value && typeof value === 'object' && '$elemMatch' in value) {
                    return {
                        ...acc,
                        [key]: {
                            $elemMatch: convertToBinary(value.$elemMatch)
                        }
                    };
                }
                return { ...acc, [key]: value };
            }, {});

            state.where = processedConditions;
            return builder;
        },

        select: (...fields: string[]) => {
            state.fields = fields.map(toPascalCase);
            fields.forEach(field => {
                const relation = inferRelations(field);
                if (relation && !state.joins.some(j => j.collection === relation.collection)) {
                    state.joins.push(relation);
                }
            });
            return builder;
        },

        limit: (num: number) => {
            state.limit = num;
            return builder;
        },

        sortBy: (field: string, direction: "asc" | "desc" = "asc") => {
            state.sort = { field: toPascalCase(field), order: direction };
            return builder;
        },

        include: (...relations: string[]) => {
            let newJoins = [...state.joins];
            relations.forEach(relation => {
                const [primary, nested] = relation.split('.');
                const joins = handlePrimaryJoin(state.collection, primary, nested);

                // handlePrimaryJoin returns either a single join or an array of joins
                if (Array.isArray(joins)) {
                    newJoins.push(...joins);
                } else {
                    newJoins.push(joins);
                }
            });

            state.joins = newJoins;
            return builder;
        },

        exec: async (options?: { stateKey?: string }) => {
            return query(state, options);
        },

        count: async () => {
            return fetchCollection(state.collection, {
                query: state.where,
                count: true
            });
        },

        // Always use upsert for set operations
        set: async (data: Record<string, any>) => {
            const timestamp = new Date().toISOString();
            const processedData = convertToBinary(data);

            // Convert field names to PascalCase
            const processedDataWithPascalCase = Object.entries(processedData).reduce((acc, [key, value]) => ({
                ...acc,
                [toPascalCase(key)]: value
            }), {});

            return updateCollection(state.collection, {
                query: state.where || { _id: null },
                update: {
                    $set: {
                        ...processedDataWithPascalCase,
                        Updated: timestamp
                    },
                    $setOnInsert: {
                        Created: timestamp,
                        Deleted: null
                    }
                },
                upsert: true
            });
        },

        // Soft delete - now properly throws error
        softDelete: async () => {
            if (!state.where || Object.keys(state.where).length === 0) {
                throw new Error("Cannot delete without conditions");
            }

            const processedWhere = convertToBinary(state.where);

            await updateCollection(state.collection, {
                query: processedWhere,
                update: {
                    $set: {
                        Deleted: new Date().toISOString(),
                        Updated: new Date().toISOString()
                    }
                }
            });
        },

        // Add new method for array field queries
        whereArrayField: (field: string, conditions: Record<string, any>) => {
            const processedConditions = convertToBinary(conditions);
            state.where[field] = { $elemMatch: processedConditions };
            return builder;
        }
    };

    return builder;
};