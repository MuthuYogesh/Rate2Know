import { Router } from "express";
import { body, query as vquery, param } from "express-validator";
import handleValidation from "../middleware/validate.mjs";
import { authenticateJWT } from "../middleware/authMiddleware.mjs";
import { query as dbQuery } from "../db.mjs";

const router = Router();

/**
 * GET /api/ratings
 * Query params:
 *  - user_id (uuid)         : filter by user
 *  - store_id (uuid)        : filter by store
 *  - min (int 1..5)         : min rating
 *  - max (int 1..5)         : max rating
 *  - q (string)             : comment text search (ILIKE %q%)
 *  - page (int, default 1)
 *  - size (int, default 50)
 *  - sort ('created_at'|'rating') default 'created_at'
 *  - order ('asc'|'desc') default 'desc'
 *
 * Admins can query any user; non-admins may only fetch their own ratings.
 */
router.get('/',
    authenticateJWT,
    // basic express-validator checks on query params (optional, will be mapped later)
    vquery('min').optional().isInt({ min: 1, max: 5 }),
    vquery('max').optional().isInt({ min: 1, max: 5 }),
    vquery('page').optional().isInt({ min: 1 }),
    vquery('size').optional().isInt({ min: 1, max: 500 }),
    handleValidation,
    async (req, res) => {
        try {
            const requester = req.user;
            const {
                user_id,
                store_id,
                min,
                max,
                q,
                page = 1,
                size = 50,
                sort = 'created_at',
                order = 'desc'
            } = req.query;

            // enforce authorization: non-admins may only request their own ratings
            let effectiveUserId = null;
            if (user_id) {
                if (requester.role !== 'system_admin') {
                    // non-admin must only request their own id
                    if (user_id !== requester.id) {
                        return res.status(403).json({ error: 'Forbidden: cannot query other users ratings' });
                    }
                    effectiveUserId = user_id;
                } else {
                    effectiveUserId = user_id;
                }
            } else if (requester.role !== 'system_admin') {
                // default to their own ratings
                effectiveUserId = requester.id;
            }

            // build WHERE clause dynamically with parameterized queries
            const params = [];
            let whereClauses = ['1=1'];

            if (effectiveUserId) {
                params.push(effectiveUserId);
                whereClauses.push(`r.user_id = $${params.length}`);
            }

            if (store_id) {
                params.push(store_id);
                whereClauses.push(`r.store_id = $${params.length}`);
            }

            if (min) {
                params.push(parseInt(min, 10));
                whereClauses.push(`r.rating >= $${params.length}`);
            }

            if (max) {
                params.push(parseInt(max, 10));
                whereClauses.push(`r.rating <= $${params.length}`);
            }

            if (q) {
                params.push(`%${q.toLowerCase()}%`);
                whereClauses.push(`lower(r.comment) LIKE $${params.length}`);
            }

            // sorting
            const ALLOWED_SORT = { created_at: 'r.created_at', rating: 'r.rating' };
            const sortCol = ALLOWED_SORT[sort] || ALLOWED_SORT.created_at;
            const sortOrd = (order && String(order).toLowerCase() === 'asc') ? 'ASC' : 'DESC';

            // pagination
            const pageNum = Math.max(parseInt(page, 10) || 1, 1);
            const pageSize = Math.min(Math.max(parseInt(size, 10) || 50, 1), 500);
            const offset = (pageNum - 1) * pageSize;

            // total count query
            const whereSql = whereClauses.join(' AND ');
            const countSql = `SELECT COUNT(*)::int AS total FROM ratings r WHERE ${whereSql}`;
            const countRes = await dbQuery(countSql, params);
            const total = countRes.rows[0]?.total ?? 0;

            // main query: include basic user and store info
            // note: params will be reused; add limit/offset params at the end
            const mainSql = `
        SELECT
          r.id, r.user_id, r.store_id, r.rating, r.comment, r.created_at, r.updated_at,
          row_to_json(u_alias) AS "user",
          row_to_json(s_alias) AS "store"
        FROM ratings r
        LEFT JOIN (
          SELECT id, name, email FROM users
        ) u_alias ON u_alias.id = r.user_id
        LEFT JOIN (
          SELECT id, name, email, address FROM stores
        ) s_alias ON s_alias.id = r.store_id
        WHERE ${whereSql}
        ORDER BY ${sortCol} ${sortOrd}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
            const mainParams = params.concat([pageSize, offset]);
            const rres = await dbQuery(mainSql, mainParams);

            return res.json({
                total,
                page: pageNum,
                size: pageSize,
                ratings: rres.rows
            });
        } catch (err) {
            console.error('Failed to fetch ratings list', err);
            return res.status(500).json({ error: 'Server error' });
        }
    }
);

export default router;
