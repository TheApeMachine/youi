import { describe, it, expect, vi, beforeEach } from 'vitest';
import { from } from './query';
import { updateCollection, fetchCollection } from './client';

// Add interface for transform data
interface TransformData {
    items: any[];
}

// Mock both client and transform functions
vi.mock('./client', () => ({
    updateCollection: vi.fn(),
    fetchCollection: vi.fn(() => [])  // Return empty array by default
}));

// Update the transform mock with type annotations
vi.mock('./transform', () => ({
    transform: {
        withJoins: vi.fn().mockImplementation((_joins: any[]) => {
            return (data: TransformData) => Promise.resolve({ items: data.items || [] });
        })
    }
}));

describe('Query Builder', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should convert UUIDs in data to binary format', async () => {
        const testData = {
            _id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test User',
            groupIds: [
                '123e4567-e89b-12d3-a456-426614174001',
                '123e4567-e89b-12d3-a456-426614174002'
            ],
            groups: [{
                _id: '123e4567-e89b-12d3-a456-426614174003',
                name: 'Test Group'
            }]
        };

        const query = from('User');
        await query.set(testData);

        expect(updateCollection).toHaveBeenCalledWith(
            'User',
            expect.objectContaining({
                update: expect.objectContaining({
                    $set: expect.objectContaining({
                        _id: expect.any(String),
                        GroupIds: expect.arrayContaining([
                            expect.any(String),
                            expect.any(String)
                        ]),
                        Groups: expect.arrayContaining([
                            expect.objectContaining({
                                _id: expect.any(String)
                            })
                        ]),
                        Name: 'Test User',
                        Updated: expect.any(String)
                    })
                })
            })
        );
    });

    it('should handle where conditions with UUIDs', async () => {
        const query = from('User').where({
            _id: '123e4567-e89b-12d3-a456-426614174000',
            accountId: '123e4567-e89b-12d3-a456-426614174001'
        });

        await query.exec();

        expect(fetchCollection).toHaveBeenCalledWith(
            'User',
            expect.objectContaining({
                query: expect.objectContaining({
                    _id: expect.any(String),
                    accountId: expect.any(String)
                }),
                limit: 20,
                offset: 0,
                projection: expect.any(Array)
            })
        );
    });

    it('should handle soft delete with UUID conditions', async () => {
        const query = from('User').where({
            _id: '123e4567-e89b-12d3-a456-426614174000'
        });

        await query.softDelete();

        expect(updateCollection).toHaveBeenCalledWith(
            'User',
            expect.objectContaining({
                query: expect.objectContaining({
                    _id: expect.any(String)
                }),
                update: expect.objectContaining({
                    $set: expect.objectContaining({
                        Deleted: expect.any(String),
                        Updated: expect.any(String)
                    })
                })
            })
        );
    });

    it('should throw error when soft deleting without conditions', async () => {
        const query = from('User');
        
        await expect(query.softDelete()).rejects.toThrow('Cannot delete without conditions');
    });

    describe('Query Building', () => {
        it('should handle select with field projection', async () => {
            const query = from('User').select('firstName', 'lastName', 'email');
            await query.exec();

            expect(fetchCollection).toHaveBeenCalledWith(
                'User',
                expect.objectContaining({
                    projection: ['FirstName', 'LastName', 'Email']
                })
            );
        });

        it('should handle pagination with limit and offset', async () => {
            const query = from('User').limit(10);
            await query.exec();

            expect(fetchCollection).toHaveBeenCalledWith(
                'User',
                expect.objectContaining({
                    limit: 10,
                    offset: 0
                })
            );
        });

        it('should handle sorting', async () => {
            const query = from('User').sortBy('firstName', 'desc');
            await query.exec();

            expect(fetchCollection).toHaveBeenCalledWith(
                'User',
                expect.objectContaining({
                    sort: { FirstName: -1 }
                })
            );
        });
    });

    describe('Relationships', () => {
        it('should automatically infer relationships from Id fields', async () => {
            const query = from('User').select('firstName', 'groupId');
            await query.exec();

            expect(fetchCollection).toHaveBeenCalledWith(
                'User',
                expect.objectContaining({
                    join: expect.objectContaining({
                        from: 'Group',
                        localField: 'groupId',
                        foreignField: '_id'
                    })
                })
            );
        });

        it('should handle explicit includes', async () => {
            const query = from('User').include('group', 'organization');
            await query.exec();

            expect(fetchCollection).toHaveBeenCalledWith(
                'User',
                expect.objectContaining({
                    join: expect.objectContaining({
                        from: 'Group',
                        localField: 'GroupId',
                        foreignField: '_id'
                    })
                })
            );
        });
    });

    describe('Data Operations', () => {
        it('should handle upsert with existing record', async () => {
            const query = from('User')
                .where({ _id: '123e4567-e89b-12d3-a456-426614174000' });
            
            await query.set({ firstName: 'John' });

            expect(updateCollection).toHaveBeenCalledWith(
                'User',
                expect.objectContaining({
                    query: expect.objectContaining({
                        _id: expect.any(String)
                    }),
                    update: expect.objectContaining({
                        $set: expect.objectContaining({
                            FirstName: 'John',
                            Updated: expect.any(String)
                        }),
                        $setOnInsert: expect.objectContaining({
                            Created: expect.any(String),
                            Deleted: null
                        })
                    }),
                    upsert: true
                })
            );
        });

        it('should handle count operations', async () => {
            const query = from('User').where({ active: true });
            await query.count();

            expect(fetchCollection).toHaveBeenCalledWith(
                'User',
                expect.objectContaining({
                    query: { active: true },
                    count: true
                })
            );
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty where conditions', async () => {
            const query = from('User').where({});
            await query.exec();

            expect(fetchCollection).toHaveBeenCalledWith(
                'User',
                expect.objectContaining({
                    query: {}
                })
            );
        });

        it('should handle complex nested conditions', async () => {
            const query = from('User').where({
                _id: '123e4567-e89b-12d3-a456-426614174000',
                'profile.address.city': 'New York',
                active: true
            });
            await query.exec();

            expect(fetchCollection).toHaveBeenCalledWith(
                'User',
                expect.objectContaining({
                    query: expect.objectContaining({
                        _id: expect.any(String),
                        'profile.address.city': 'New York',
                        active: true
                    })
                })
            );
        });
    });
}); 