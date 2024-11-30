import { describe, it, expect, vi, beforeEach } from 'vitest';
import { from } from './query';
import { fetchCollection, updateCollection } from './client';

// Mock data with proper UUIDs
type UserType = {
    _id: string;
    firstName: string;
    lastName: string;
    groupId: string;
    organizationId: string;
    group?: GroupType | null;
    organization?: OrganizationType | null;
    [key: string]: string | GroupType | OrganizationType | null | undefined;
};

type GroupType = {
    _id: string;
    name: string;
    [key: string]: string;
};

type OrganizationType = {
    _id: string;
    name: string;
    [key: string]: string;
};

type MockDataType = {
    User: UserType[];
    Group: GroupType[];
    Organization: OrganizationType[];
};

const mockData: MockDataType = {
    User: [
        {
            _id: '123e4567-e89b-12d3-a456-426614174000',
            firstName: 'John',
            lastName: 'Doe',
            groupId: '123e4567-e89b-12d3-a456-426614174001',
            organizationId: '123e4567-e89b-12d3-a456-426614174002'
        }
    ],
    Group: [
        {
            _id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Admin Group'
        }
    ],
    Organization: [
        {
            _id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Acme Corp'
        }
    ]
};

// Mock the client
vi.mock('./client', () => ({
    fetchCollection: vi.fn((collection: keyof MockDataType, options: any) => {
        // Use initialData if provided, otherwise use collection data
        let data = options.initialData || mockData[collection] || [];
        
        if (options.count) return data.length;
        
        // Handle joins/includes
        if (options.join) {
            data = (data as UserType[]).map(item => {
                const result = { ...item } as UserType;
                
                const join = options.join;
                const relatedCollection = join.from;
                const localField = join.localField;
                const foreignField = join.foreignField;
                
                if (relatedCollection === 'Group' && (localField === 'GroupId' || localField === 'groupId')) {
                    const group = mockData.Group.find(g => g[foreignField as keyof GroupType] === item.groupId);
                    result.group = group || null;
                }
                
                if (relatedCollection === 'Organization' && (localField === 'OrganizationId' || localField === 'organizationId')) {
                    const org = mockData.Organization.find(o => o[foreignField as keyof OrganizationType] === item.organizationId);
                    result.organization = org || null;
                }
                
                return result;
            });
        }
        
        return data;
    }),
    updateCollection: vi.fn()
}));

describe('Query Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch and transform related data', async () => {
        const query = from('User')
            .include('group', 'organization')
            .where({ _id: '123e4567-e89b-12d3-a456-426614174000' });

        const results = await query.exec();
        
        expect(results[0]).toHaveProperty('group');
        expect(results[0].group).toHaveProperty('name', 'Admin Group');
        expect(results[0]).toHaveProperty('organization');
        expect(results[0].organization).toHaveProperty('name', 'Acme Corp');
    });

    it('should handle complex queries with multiple operations', async () => {
        const query = from('User')
            .where({ organizationId: '123e4567-e89b-12d3-a456-426614174002' })
            .select('firstName', 'lastName', 'groupId')
            .include('group')
            .limit(5)
            .sortBy('firstName', 'desc');

        await query.exec();

        expect(fetchCollection).toHaveBeenCalledWith(
            'User',
            expect.objectContaining({
                query: { organizationId: expect.any(String) },
                projection: ['FirstName', 'LastName', 'GroupId'],
                limit: 5,
                sort: { FirstName: -1 },
                join: expect.objectContaining({
                    from: 'Group'
                })
            })
        );
    });

    it('should handle updates with related data', async () => {
        const query = from('User')
            .where({ _id: '123e4567-e89b-12d3-a456-426614174000' });

        await query.set({
            firstName: 'Jane',
            groupId: '123e4567-e89b-12d3-a456-426614174001'
        });

        expect(updateCollection).toHaveBeenCalledWith(
            'User',
            expect.objectContaining({
                query: { _id: expect.any(String) },
                update: expect.objectContaining({
                    $set: expect.objectContaining({
                        FirstName: 'Jane',
                        GroupId: expect.any(String)
                    })
                })
            })
        );
    });
}); 