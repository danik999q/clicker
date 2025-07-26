// backend/src/db.ts
import { Pool, QueryResult, QueryResultRow } from 'pg';

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ...(isProduction && {
        ssl: {
            rejectUnauthorized: false
        }
    })
};

const pool = new Pool(poolConfig);

export default {
    query: <T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> => pool.query<T>(text, params),
    getClient: () => pool.connect(),
};