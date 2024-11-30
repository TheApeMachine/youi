import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transform } from './transform';

interface MockData {
    Group: Array<{ _id: string; name: string }>;
    Organization: Array<{ _id: string; name: string }>;
}

interface QueryOptions {
    query?: {
        _id?: string;
    };
}

// Update the mock implementation with proper types and null checks
vi.mock('./client', () => ({
    fetchCollection: vi.fn((collection: keyof MockData, query: QueryOptions) => {
        // Mock data for different collections
        const mockData: MockData = {
            Group: [
                { _id: '123e4567-e89b-12d3-a456-426614174001', name: 'Admin Group' },
                { _id: '123e4567-e89b-12d3-a456-426614174002', name: 'User Group' }
            ],
            Organization: [
                { _id: '123e4567-e89b-12d3-a456-426614174003', name: 'Acme Corp' },
                { _id: '123e4567-e89b-12d3-a456-426614174004', name: 'Globex Corp' }
            ]
        };

        // If there's a query._id, filter the results
        const queryId = query?.query?._id;
        if (queryId) {
            return mockData[collection]?.filter(item => item._id === queryId) || [];
        }

        return mockData[collection] || [];
    })
}));

describe('Transform', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should join single relation', async () => {
        const testData = {
            items: [{
                _id: '123e4567-e89b-12d3-a456-426614174000',
                groupId: '123e4567-e89b-12d3-a456-426614174001',
                name: 'John Doe'
            }]
        };

        const joins = [{
            join: 'Group',
            on: '_id,groupId'
        }];

        const result = await transform.withJoins(joins)(testData);

        expect(result.items[0]).toHaveProperty('group');
        expect(result.items[0].group).toEqual(
            expect.objectContaining({
                _id: '123e4567-e89b-12d3-a456-426614174001',
                name: 'Admin Group'
            })
        );
    });

    it('should handle multiple joins', async () => {
        const testData = {
            items: [{
                _id: '123e4567-e89b-12d3-a456-426614174000',
                groupId: '123e4567-e89b-12d3-a456-426614174001',
                organizationId: '123e4567-e89b-12d3-a456-426614174003',
                name: 'John Doe'
            }]
        };

        const joins = [
            { join: 'Group', on: '_id,groupId' },
            { join: 'Organization', on: '_id,organizationId' }
        ];

        const result = await transform.withJoins(joins)(testData);

        expect(result.items[0]).toHaveProperty('group');
        expect(result.items[0]).toHaveProperty('organization');
        expect(result.items[0].group.name).toBe('Admin Group');
        expect(result.items[0].organization.name).toBe('Acme Corp');
    });

    it('should handle missing relations', async () => {
        const testData = {
            items: [{
                _id: '123e4567-e89b-12d3-a456-426614174000',
                groupId: 'nonexistent',
                name: 'John Doe'
            }]
        };

        const joins = [{
            join: 'Group',
            on: '_id,groupId'
        }];

        const result = await transform.withJoins(joins)(testData);

        expect(result.items[0].group).toBeNull();
    });

    it('should handle empty input data', async () => {
        const testData = { items: [] };
        const joins = [{ join: 'Group', on: '_id,groupId' }];

        const result = await transform.withJoins(joins)(testData);

        expect(result.items).toEqual([]);
    });

    it('should preserve original data when joining', async () => {
        const testData = {
            items: [{
                _id: '123e4567-e89b-12d3-a456-426614174000',
                groupId: '123e4567-e89b-12d3-a456-426614174001',
                name: 'John Doe',
                email: 'john@example.com'
            }]
        };

        const joins = [{
            join: 'Group',
            on: '_id,groupId'
        }];

        const result = await transform.withJoins(joins)(testData);

        expect(result.items[0]).toMatchObject({
            _id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John Doe',
            email: 'john@example.com',
            groupId: '123e4567-e89b-12d3-a456-426614174001',
            group: {
                _id: '123e4567-e89b-12d3-a456-426614174001',
                name: 'Admin Group'
            }
        });
    });
}); 