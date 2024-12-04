import { ToBinary } from "./utils";

import { fetchCollection, updateCollection } from "./client";

export interface QueryProps {
    collection: string;
    fields?: string[];
    where?: Record<string, any>;
    joins?: Array<{
        collection: string;
        localField: string;
        foreignField: string;
    }>;
    limit?: number;
    offset?: number;
    sort?: { field: string; order: "asc" | "desc" };
}

export const query = async ({
    collection,
    fields,
    where = {},
    joins,
    limit = 20,
    offset = 0,
    sort
}: QueryProps) => {
    const options: any = {
        query: where,
        projection: fields,
        limit,
        offset
    };

    if (sort) {
        options.sort = { [sort.field]: sort.order === "asc" ? 1 : -1 };
    }

    if (joins?.length) {
        // Get initial results with first join
        const firstJoin = joins[0];
        options.join = {
            from: firstJoin.collection,
            localField: firstJoin.localField,
            foreignField: firstJoin.foreignField,
            as: firstJoin.collection.toLowerCase()
        };

        let results = await fetchCollection(collection, options);

        // Handle additional joins
        if (joins.length > 1) {
            for (let i = 1; i < joins.length; i++) {
                const join = joins[i];
                const joinOptions = {
                    ...options,
                    join: {
                        from: join.collection,
                        localField: join.localField,
                        foreignField: join.foreignField,
                        as: join.collection.toLowerCase()
                    },
                    initialData: results
                };
                results = await fetchCollection(collection, joinOptions);
            }
        }

        return results;
    }

    return fetchCollection(collection, options);
};

// Type for the smart query builder
type QueryBuilder = {
    [K: string]: any;
    where: (conditions: Record<string, any>) => QueryBuilder;
    select: (...fields: string[]) => QueryBuilder;
    limit: (num: number) => QueryBuilder;
    sortBy: (field: string, direction?: "asc" | "desc") => QueryBuilder;
    include: (...relations: string[]) => QueryBuilder;
    exec: () => Promise<any[]>;
    count: () => Promise<number>;
    set: (data: Record<string, any>) => Promise<any>;
    softDelete: () => Promise<void>;
    whereArrayField: (field: string, conditions: Record<string, any>) => QueryBuilder;
};

// Helper to ensure PascalCase
const toPascalCase = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

// At the top of the file, add this type
type WhereConditions = Record<string, any>;

// Smart query function - now accepts PascalCase collection names
export const from = (collection: string): QueryBuilder => {
    let state = {
        collection: toPascalCase(collection),
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

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const isUUID = (value: any): boolean => {
        if (typeof value !== 'string') return false;
        return UUID_REGEX.test(value);
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
                if (value && typeof value === 'object' && !('$elemMatch' in value)) {
                    // Assume this is an array field query
                    acc[key] = { $elemMatch: value };
                } else {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);

            // Then handle binary conversion
            const processedConditions = Object.entries(arrayProcessed).reduce((acc, [key, value]) => {
                if ((key === "_id" || key.endsWith("Id")) && isUUID(value)) {
                    return { ...acc, [key]: ToBinary(value) };
                }
                // If it's an $elemMatch, check its contents for IDs too
                if (value && typeof value === 'object' && '$elemMatch' in value) {
                    const processedElemMatch = Object.entries(value.$elemMatch).reduce((acc, [elemKey, elemValue]) => {
                        if ((elemKey === "_id" || elemKey.endsWith("Id")) && isUUID(elemValue as string)) {
                            return { 
                                ...acc, 
                                [elemKey]: { 
                                    $binary: {
                                        base64: ToBinary(elemValue as string),
                                        subType: "03"
                                    }
                                }
                            };
                        }
                        return { ...acc, [elemKey]: elemValue };
                    }, {});
                    return { ...acc, [key]: { $elemMatch: processedElemMatch }};
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
            relations.forEach(relation => {
                const relationName = toPascalCase(relation);
                state.joins.push({
                    collection: relationName,
                    localField: `${relationName}Id`,
                    foreignField: "_id"
                });
            });
            return builder;
        },

        exec: async () => {
            return query(state);
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